import {
  TeamAnnouncement,
  type ITeamAnnouncement,
} from './model-announcement.js';
import { SportTeam } from './model.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { Notification } from '../Notification/model.js';
import { logger } from '../../common/logger.js';
import { NotFoundError } from '../../common/errors.js';
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from './validation-announcement.js';

interface ListFilters {
  schoolId: string;
  teamId?: string;
  studentId?: string;
  pinned?: boolean;
}

export class AnnouncementService {
  static async create(
    input: CreateAnnouncementInput,
    schoolId: string,
    authorId: string,
  ): Promise<ITeamAnnouncement> {
    const announcement = await TeamAnnouncement.create({
      ...input,
      schoolId,
      authorId,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    });

    // Fan out in-app notifications to player Users + their parents
    AnnouncementService.dispatchNotifications(announcement).catch((err: unknown) => {
      logger.warn(
        { err: err instanceof Error ? err.message : 'unknown' },
        'TeamAnnouncement: notification dispatch failed',
      );
    });

    return announcement;
  }

  /**
   * Best-effort fan-out of in-app notifications to all team players' user accounts
   * and their parents. Errors are logged but don't block the create.
   */
  private static async dispatchNotifications(
    announcement: ITeamAnnouncement,
  ): Promise<void> {
    const team = await SportTeam.findOne({
      _id: announcement.teamId,
      schoolId: announcement.schoolId,
      isDeleted: false,
    }).lean();
    if (!team) return;

    const playerIds = team.playerIds ?? [];
    if (playerIds.length === 0) return;

    const students = await Student.find({
      _id: { $in: playerIds },
      schoolId: announcement.schoolId,
      isDeleted: false,
    }).select('_id userId').lean();

    const parents = await Parent.find({
      childrenIds: { $in: playerIds },
      schoolId: announcement.schoolId,
      isDeleted: false,
    }).select('userId').lean();

    const recipientUserIds = new Set<string>();
    students.forEach((s) => {
      if (s.userId) recipientUserIds.add(s.userId.toString());
    });
    parents.forEach((p) => {
      if (p.userId) recipientUserIds.add(p.userId.toString());
    });

    if (recipientUserIds.size === 0) return;

    const docs = Array.from(recipientUserIds).map((uid) => ({
      recipientId: uid,
      schoolId: announcement.schoolId,
      type: 'in_app' as const,
      title: announcement.title,
      message: announcement.body,
      data: {
        entityId: String(announcement._id),
        entityType: 'team_announcement',
        url: `/sports?announcement=${announcement._id}`,
      },
      isRead: false,
      isDeleted: false,
    }));

    await Notification.insertMany(docs, { ordered: false });
  }

  static async list(filters: ListFilters): Promise<ITeamAnnouncement[]> {
    const query: Record<string, unknown> = {
      schoolId: filters.schoolId,
      isDeleted: false,
    };
    if (filters.teamId) query.teamId = filters.teamId;
    if (filters.studentId) {
      const teams = await SportTeam.find({
        schoolId: filters.schoolId,
        playerIds: filters.studentId,
        isDeleted: false,
      }).select('_id').lean();
      const teamIds = teams.map((t) => t._id);
      query.teamId = { $in: teamIds };
    }
    if (filters.pinned !== undefined) query.pinned = filters.pinned;
    return TeamAnnouncement.find(query)
      .sort({ pinned: -1, publishedAt: -1 })
      .populate('teamId', 'name sport')
      .populate('authorId', 'firstName lastName email')
      .lean();
  }

  static async get(
    id: string,
    schoolId: string,
  ): Promise<ITeamAnnouncement> {
    const announcement = await TeamAnnouncement.findOne({
      _id: id,
      schoolId,
      isDeleted: false,
    })
      .populate('teamId', 'name sport')
      .populate('authorId', 'firstName lastName email');
    if (!announcement) throw new NotFoundError('Announcement not found');
    return announcement;
  }

  static async update(
    id: string,
    schoolId: string,
    input: UpdateAnnouncementInput,
  ): Promise<ITeamAnnouncement> {
    const update: Record<string, unknown> = { ...input };
    if (input.publishedAt) update.publishedAt = new Date(input.publishedAt);
    if (input.expiresAt) update.expiresAt = new Date(input.expiresAt);
    const announcement = await TeamAnnouncement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate('teamId', 'name sport')
      .populate('authorId', 'firstName lastName email');
    if (!announcement) throw new NotFoundError('Announcement not found');
    return announcement;
  }

  static async remove(id: string, schoolId: string): Promise<void> {
    const result = await TeamAnnouncement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) throw new NotFoundError('Announcement not found');
  }

  /**
   * Generate a match-day team sheet announcement for a fixture.
   * Pulls the team roster + per-player availability and renders a
   * markdown body, then publishes it as a high-priority pinned announcement.
   */
  static async generateTeamSheet(
    fixtureId: string,
    schoolId: string,
    authorId: string,
  ): Promise<ITeamAnnouncement> {
    const { SportFixture, PlayerAvailability } = await import('./model.js');

    const fixture = await SportFixture.findOne({
      _id: fixtureId,
      schoolId,
      isDeleted: false,
    })
      .populate('teamId')
      .lean();
    if (!fixture) throw new NotFoundError('Fixture not found');

    const team = fixture.teamId as unknown as {
      _id: unknown;
      name: string;
      sport: string;
      playerIds?: unknown[];
    };

    const availability = await PlayerAvailability.find({
      fixtureId,
      schoolId,
      isDeleted: false,
    })
      .populate('studentId', 'firstName lastName')
      .lean();

    const playerStudentIds = (team.playerIds ?? []).map(String);
    const Student = (await import('../Student/model.js')).Student;
    const players = await Student.find({
      _id: { $in: playerStudentIds },
      schoolId,
      isDeleted: false,
    })
      .populate<{ userId: { firstName?: string; lastName?: string } | null }>(
        'userId',
        'firstName lastName',
      )
      .select('admissionNumber userId')
      .lean();

    function studentName(s: typeof players[number]): string {
      const u = s.userId as { firstName?: string; lastName?: string } | null | undefined;
      if (u && (u.firstName || u.lastName)) {
        return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
      }
      return s.admissionNumber ?? 'Unknown';
    }

    type AvailMap = Record<string, { status: string; notes?: string | null }>;
    const availMap: AvailMap = {};
    availability.forEach((a) => {
      const sid = typeof a.studentId === 'object' && a.studentId
        ? String((a.studentId as { _id: unknown })._id)
        : String(a.studentId);
      availMap[sid] = { status: a.status, notes: a.notes };
    });

    const groups: Record<string, string[]> = {
      available: [],
      injured: [],
      unavailable: [],
      unconfirmed: [],
    };
    for (const p of players) {
      const sid = String(p._id);
      const name = studentName(p);
      const a = availMap[sid];
      if (!a) groups.unconfirmed.push(name);
      else if (a.status === 'available') groups.available.push(name);
      else if (a.status === 'injured') groups.injured.push(name);
      else groups.unavailable.push(name);
    }

    const matchDate = new Date(fixture.date).toLocaleDateString();
    const homeAway = fixture.isHome ? 'Home' : 'Away';
    const lines: string[] = [
      `**Opponent:** ${fixture.opponent}`,
      `**Date:** ${matchDate} at ${fixture.time}`,
      `**Venue:** ${fixture.venue} (${homeAway})`,
      '',
      '**Squad**',
    ];
    if (groups.available.length > 0) {
      lines.push('', `_Available (${groups.available.length})_`);
      groups.available.forEach((n) => lines.push(`- ${n}`));
    }
    if (groups.injured.length > 0) {
      lines.push('', `_Injured (${groups.injured.length})_`);
      groups.injured.forEach((n) => lines.push(`- ${n}`));
    }
    if (groups.unavailable.length > 0) {
      lines.push('', `_Unavailable (${groups.unavailable.length})_`);
      groups.unavailable.forEach((n) => lines.push(`- ${n}`));
    }
    if (groups.unconfirmed.length > 0) {
      lines.push('', `_Unconfirmed (${groups.unconfirmed.length})_`);
      groups.unconfirmed.forEach((n) => lines.push(`- ${n}`));
    }

    const title = `${team.name} · vs ${fixture.opponent} · ${matchDate}`;
    const body = lines.join('\n');

    return AnnouncementService.create(
      {
        teamId: String(team._id),
        title,
        body,
        priority: 'high',
        pinned: true,
      },
      schoolId,
      authorId,
    );
  }
}
