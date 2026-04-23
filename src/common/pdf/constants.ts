// src/common/pdf/constants.ts
export const MARGIN = 50;
export const PAGE_WIDTH = 595.28; // A4 width in pts
export const PAGE_HEIGHT = 841.89; // A4 height in pts
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export const FONT_TITLE = 'Helvetica-Bold';
export const FONT_NORMAL = 'Helvetica';
export const FONT_ITALIC = 'Helvetica-Oblique';

export const DIAGRAM_MAX_WIDTH = CONTENT_WIDTH - 40; // indented
export const DIAGRAM_MAX_HEIGHT = 240;

export const FOOTER_RESERVE = 30; // reserve at bottom of page for page-number footer
