/**
 * TikZ template types and helper functions for AI prompt injection.
 * Template data lives in ./tikz-template-data.ts to respect the 350-line limit.
 */

import { TIKZ_TEMPLATES } from './tikz-template-data.js';

export interface TikzTemplate {
  name: string;
  diagramType: string;
  grades: [number, number];
  packages: string[];
  template: string;
  description: string;
}

/**
 * Returns all templates whose grade range includes the given grade.
 */
export function getTemplatesForGrade(grade: number): TikzTemplate[] {
  return TIKZ_TEMPLATES.filter(
    (t: TikzTemplate) => grade >= t.grades[0] && grade <= t.grades[1],
  );
}

/**
 * Find a single template by its diagramType field.
 */
export function getTemplateByType(diagramType: string): TikzTemplate | undefined {
  return TIKZ_TEMPLATES.find((t: TikzTemplate) => t.diagramType === diagramType);
}

/**
 * Format an array of templates as markdown for injection into an AI system prompt.
 * Each template is rendered as a named section with packages and a LaTeX code block.
 */
export function formatTemplatesForPrompt(templates: TikzTemplate[]): string {
  if (templates.length === 0) return '';

  return templates
    .map((t: TikzTemplate) => {
      const pkgs =
        t.packages.length > 0
          ? `Packages: ${t.packages.join(', ')}`
          : 'Packages: none (base TikZ only)';
      return `### ${t.name} (${t.description})\n${pkgs}\n\`\`\`latex\n${t.template}\n\`\`\``;
    })
    .join('\n\n');
}

export { TIKZ_TEMPLATES };
