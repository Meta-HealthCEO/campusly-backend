import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { AIService } from '../../services/ai.service.js';
import { logger } from '../../common/logger.js';

// ─── Configuration ────────────────────────────────────────────────────────────

const TIKZ_RENDERER_URL = process.env.TIKZ_RENDERER_URL || 'http://localhost:3600';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const DIAGRAM_DIR = path.join(UPLOAD_DIR, 'diagrams');
const RENDER_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface DiagramInput {
  tikz: string;
  data: Record<string, unknown>;
  alt: string;
}

export interface DiagramResult {
  tikz: string;
  data: Record<string, unknown>;
  alt: string;
  svgUrl: string;
  pdfUrl: string | null;
  hash: string;
  renderStatus: 'rendered';
  renderError: null;
}

export interface DiagramFailure {
  tikz: string;
  data: Record<string, unknown>;
  alt: string;
  svgUrl: null;
  pdfUrl: null;
  hash: string;
  renderStatus: 'failed';
  renderError: string;
}

// ─── Forbidden commands that could escape the TikZ sandbox ────────────────────

const FORBIDDEN_COMMANDS = [
  '\\input',
  '\\include',
  '\\write18',
  '\\immediate',
  '\\openout',
  '\\closeout',
  '\\csname',
  '\\catcode',
  '\\directlua',
  '\\latelua',
];

// ─── Validation (Layer 2) ─────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  error: string | null;
}

function validateTikz(tikz: string): ValidationResult {
  const trimmed = tikz.trim();

  if (!trimmed) {
    return { valid: false, error: 'TikZ code is empty' };
  }

  // Check for forbidden commands
  for (const cmd of FORBIDDEN_COMMANDS) {
    if (trimmed.includes(cmd)) {
      return { valid: false, error: `Forbidden command found: ${cmd}` };
    }
  }

  // Check matching \begin{...} / \end{...}
  const beginMatches = trimmed.match(/\\begin\{([^}]+)\}/g) ?? [];
  const endMatches = trimmed.match(/\\end\{([^}]+)\}/g) ?? [];

  const beginEnvs = beginMatches.map((m: string) => {
    const match = m.match(/\\begin\{([^}]+)\}/);
    return match ? match[1] : '';
  });

  const endEnvs = endMatches.map((m: string) => {
    const match = m.match(/\\end\{([^}]+)\}/);
    return match ? match[1] : '';
  });

  if (beginEnvs.length !== endEnvs.length) {
    return {
      valid: false,
      error: `Mismatched environments: ${beginEnvs.length} \\begin vs ${endEnvs.length} \\end`,
    };
  }

  // Check each begin has a matching end (in order)
  for (let i = 0; i < beginEnvs.length; i++) {
    const beginEnv = beginEnvs[i];
    const endEnv = endEnvs[i];
    if (beginEnv !== endEnv) {
      return {
        valid: false,
        error: `Environment mismatch: \\begin{${beginEnv}} closed by \\end{${endEnv}}`,
      };
    }
  }

  return { valid: true, error: null };
}

// ─── Hash computation ─────────────────────────────────────────────────────────

function computeHash(tikz: string): string {
  return crypto.createHash('sha256').update(tikz).digest('hex').slice(0, 16);
}

// ─── Renderer HTTP call (Layer 3a) ────────────────────────────────────────────

interface RendererResponse {
  svg?: string;
  error?: string;
  log?: string;
}

async function callRenderer(
  tikz: string,
  packages?: string[],
): Promise<{ svg: string } | { error: string; log: string }> {
  const body: Record<string, unknown> = { tikz };
  if (packages && packages.length > 0) {
    body.packages = packages;
  }

  let response: Response;
  try {
    response = await fetch(`${TIKZ_RENDERER_URL}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(RENDER_TIMEOUT_MS),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error';
    return { error: `Renderer unreachable: ${message}`, log: '' };
  }

  const data = (await response.json()) as RendererResponse;

  if (!response.ok || !data.svg) {
    return {
      error: data.error ?? `Renderer returned status ${response.status}`,
      log: data.log ?? '',
    };
  }

  return { svg: data.svg };
}

// ─── Claude fix request (Layer 3b) ────────────────────────────────────────────

async function askClaudeToFix(
  originalTikz: string,
  errorLog: string,
  attempt: number,
): Promise<string> {
  const strictness =
    attempt >= 3
      ? 'Use ONLY basic TikZ commands: \\draw, \\fill, \\node, \\path, \\coordinate. No external libraries. No pgfplots. Keep it as simple as possible.'
      : attempt >= 2
        ? 'Simplify the code. Avoid complex libraries. Prefer basic TikZ drawing primitives.'
        : 'Fix the compilation error while keeping the diagram as close to the original as possible.';

  const systemPrompt = [
    'You are a LaTeX/TikZ expert. You receive broken TikZ code and its compilation error.',
    'Return ONLY the fixed TikZ code — no explanation, no markdown fences, no comments.',
    strictness,
  ].join(' ');

  const userPrompt = [
    '## Original TikZ code:',
    '```',
    originalTikz,
    '```',
    '',
    '## Compilation error:',
    '```',
    errorLog,
    '```',
    '',
    'Return the fixed TikZ code only.',
  ].join('\n');

  const fixed = await AIService.generateCompletion(systemPrompt, userPrompt, {
    maxTokens: 2048,
    temperature: 0.2,
  });

  // Strip any accidental markdown fences
  return fixed
    .replace(/^```(?:latex|tex|tikz)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

// ─── SVG persistence ──────────────────────────────────────────────────────────

function saveSvg(svg: string, hash: string): string {
  fs.mkdirSync(DIAGRAM_DIR, { recursive: true });
  const filename = `${hash}.svg`;
  const filePath = path.join(DIAGRAM_DIR, filename);
  fs.writeFileSync(filePath, svg, 'utf-8');
  return `/uploads/diagrams/${filename}`;
}

// ─── Check for cached SVG ─────────────────────────────────────────────────────

function getCachedSvgUrl(hash: string): string | null {
  const filePath = path.join(DIAGRAM_DIR, `${hash}.svg`);
  if (fs.existsSync(filePath)) {
    return `/uploads/diagrams/${hash}.svg`;
  }
  return null;
}

// ─── Main entry point (Layers 2–4) ───────────────────────────────────────────

export async function renderDiagram(
  input: DiagramInput,
): Promise<DiagramResult | DiagramFailure> {
  const hash = computeHash(input.tikz);

  // Layer 1 (cache): Check if already rendered
  const cached = getCachedSvgUrl(hash);
  if (cached) {
    logger.info(`[DiagramService] Cache hit for hash ${hash}`);
    return {
      tikz: input.tikz,
      data: input.data,
      alt: input.alt,
      svgUrl: cached,
      pdfUrl: null,
      hash,
      renderStatus: 'rendered',
      renderError: null,
    };
  }

  // Layer 2: Quick validation
  const validation = validateTikz(input.tikz);
  if (!validation.valid) {
    logger.warn(`[DiagramService] Validation failed: ${validation.error}`);
    return {
      tikz: input.tikz,
      data: input.data,
      alt: input.alt,
      svgUrl: null,
      pdfUrl: null,
      hash,
      renderStatus: 'failed',
      renderError: `Validation: ${validation.error}`,
    };
  }

  // Layer 3: Attempt render with retries + Claude fixes
  let currentTikz = input.tikz;
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    logger.info(`[DiagramService] Render attempt ${attempt}/${MAX_ATTEMPTS} for hash ${hash}`);

    const result = await callRenderer(currentTikz);

    if ('svg' in result) {
      // Success — save and return
      const currentHash = attempt === 1 ? hash : computeHash(currentTikz);
      const svgUrl = saveSvg(result.svg, currentHash);
      logger.info(`[DiagramService] Rendered successfully on attempt ${attempt}`);

      return {
        tikz: currentTikz,
        data: input.data,
        alt: input.alt,
        svgUrl,
        pdfUrl: null,
        hash: currentHash,
        renderStatus: 'rendered',
        renderError: null,
      };
    }

    // Render failed — try to fix with Claude
    lastError = `${result.error}\n${result.log}`.trim();
    logger.warn(
      `[DiagramService] Attempt ${attempt} failed: ${result.error}`,
    );

    if (attempt < MAX_ATTEMPTS) {
      try {
        currentTikz = await askClaudeToFix(currentTikz, lastError, attempt);
        logger.info(`[DiagramService] Claude provided fix for attempt ${attempt + 1}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        logger.error(`[DiagramService] Claude fix failed: ${msg}`);
        // Continue to next attempt with same code if Claude fails
      }
    }
  }

  // Layer 4: All attempts exhausted — return failure (frontend shows alt text)
  logger.error(`[DiagramService] All ${MAX_ATTEMPTS} attempts failed for hash ${hash}`);
  return {
    tikz: input.tikz,
    data: input.data,
    alt: input.alt,
    svgUrl: null,
    pdfUrl: null,
    hash,
    renderStatus: 'failed',
    renderError: lastError,
  };
}

// ─── Batch render ─────────────────────────────────────────────────────────────

export async function renderDiagrams(
  inputs: DiagramInput[],
): Promise<(DiagramResult | DiagramFailure)[]> {
  return Promise.all(inputs.map((input: DiagramInput) => renderDiagram(input)));
}
