import { Worker, type Job } from 'bullmq';
import { redisConnection, communicationQueue } from './queues.js';
import { BulkMessage } from '../modules/Communication/model.js';
import { MessageLog } from '../modules/Communication/model.js';
import { executeBulkMessage, dispatchSingleLog } from '../modules/Communication/service.js';
import { logger } from '../common/logger.js';

interface SendScheduledJobData {
  bulkId: string;
}

interface RetryDeliveryJobData {
  logId: string;
}

type CommunicationJobData = SendScheduledJobData | RetryDeliveryJobData;

async function handleSendScheduled(bulkId: string): Promise<void> {
  const bulk = await BulkMessage.findById(bulkId);
  if (!bulk || bulk.isDeleted) {
    logger.info({ bulkId }, '[CommWorker] send-scheduled: bulk message not found or deleted, skipping');
    return;
  }
  if (bulk.status !== 'scheduled') {
    logger.info({ bulkId, status: bulk.status }, '[CommWorker] send-scheduled: not in scheduled state, skipping');
    return;
  }
  logger.info({ bulkId }, '[CommWorker] send-scheduled: executing bulk message');
  await executeBulkMessage(bulkId);
  logger.info({ bulkId }, '[CommWorker] send-scheduled: complete');
}

async function handleRetryDelivery(logId: string): Promise<void> {
  const log = await MessageLog.findById(logId);
  if (!log || log.isDeleted) {
    logger.info({ logId }, '[CommWorker] retry-delivery: log not found or deleted, skipping');
    return;
  }
  if (log.status !== 'retrying') {
    logger.info({ logId, status: log.status }, '[CommWorker] retry-delivery: not in retrying state, skipping');
    return;
  }

  const bulk = await BulkMessage.findOne({ _id: log.bulkMessageId, isDeleted: false }).lean();
  if (!bulk) {
    logger.warn({ logId, bulkMessageId: log.bulkMessageId }, '[CommWorker] retry-delivery: parent bulk message not found');
    await MessageLog.findByIdAndUpdate(logId, { $set: { status: 'failed', error: 'Parent bulk message not found' } });
    return;
  }

  log.retryCount = (log.retryCount ?? 0) + 1;
  await log.save();

  logger.info({ logId, retryCount: log.retryCount }, '[CommWorker] retry-delivery: dispatching');
  await dispatchSingleLog(log, { subject: bulk.subject, body: bulk.body });

  // After retry, update parent bulk message counters
  const [sentCount, failedCount, retryingCount] = await Promise.all([
    MessageLog.countDocuments({ bulkMessageId: bulk._id, status: { $in: ['sent', 'delivered'] } }),
    MessageLog.countDocuments({ bulkMessageId: bulk._id, status: 'failed' }),
    MessageLog.countDocuments({ bulkMessageId: bulk._id, status: 'retrying' }),
  ]);

  if (retryingCount === 0) {
    let finalStatus: 'sent' | 'partial' | 'failed';
    if (sentCount > 0 && failedCount === 0) finalStatus = 'sent';
    else if (sentCount > 0) finalStatus = 'partial';
    else finalStatus = 'failed';

    await BulkMessage.findByIdAndUpdate(bulk._id, {
      $set: { status: finalStatus, delivered: sentCount, failed: failedCount },
    });
  }
}

export function createCommunicationSendWorker(): Worker {
  const worker = new Worker<CommunicationJobData>(
    'communication-send',
    async (job: Job<CommunicationJobData>) => {
      if (job.name === 'send-scheduled') {
        const data = job.data as SendScheduledJobData;
        await handleSendScheduled(data.bulkId);
      } else if (job.name === 'retry-delivery') {
        const data = job.data as RetryDeliveryJobData;
        await handleRetryDelivery(data.logId);
      } else {
        logger.warn({ jobName: job.name }, '[CommWorker] Unknown job name, skipping');
      }
    },
    { connection: redisConnection, concurrency: 3 },
  );

  worker.on('completed', (job) => {
    logger.info(`[CommWorker] Job ${job.id} (${job.name}) completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[CommWorker] Job ${job?.id} (${job?.name}) failed: ${err.message}`);
  });

  return worker;
}

export { communicationQueue };
