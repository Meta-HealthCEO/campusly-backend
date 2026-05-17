import type { Browser } from 'playwright';
import { logger } from '../logger.js';
import { escapeHtml } from './html.js';

export interface HtmlPdfRenderOptions {
  title?: string;
  footerLabel?: string;
  timeoutMs?: number;
}

let browserPromise: Promise<Browser> | null = null;

export async function renderHtmlToPdf(
  html: string,
  options: HtmlPdfRenderOptions = {},
): Promise<Buffer> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1240, height: 1754 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    await page.emulateMedia({ media: 'print' });
    await page.setContent(html, {
      waitUntil: 'networkidle',
      timeout: options.timeoutMs ?? 45_000,
    });
    await page.evaluate('document.fonts && document.fonts.ready');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size:1px;width:100%;"></div>',
      footerTemplate: footerTemplate(options.footerLabel ?? options.title ?? ''),
      margin: {
        top: '16mm',
        right: '16mm',
        bottom: '18mm',
        left: '16mm',
      },
      tagged: true,
      outline: true,
    });

    return Buffer.from(pdf);
  } finally {
    await context.close();
  }
}

export async function closeHtmlPdfRenderer(): Promise<void> {
  if (!browserPromise) return;
  const browser = await browserPromise;
  browserPromise = null;
  await browser.close();
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((err: unknown) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import('playwright');
  const args = ['--disable-dev-shm-usage'];
  if (process.platform === 'linux') args.push('--no-sandbox');

  logger.info('Launching document PDF renderer');
  const browser = await chromium.launch({
    headless: true,
    args,
  });
  browser.on('disconnected', () => {
    browserPromise = null;
  });
  return browser;
}

function footerTemplate(label: string): string {
  const safeLabel = escapeHtml(label);
  return `
    <div style="
      width: 100%;
      padding: 0 16mm;
      font: 8px Arial, sans-serif;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    ">
      <span>${safeLabel}</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;
}
