import { SubjectRequirement, SubjectLine } from '../model.js';
import type { ISubjectLine } from '../model.js';
import { Subject } from '../../Academic/model.js';
import { AIService } from '../../../services/ai.service.js';

interface SuggestedLine {
  lineName: string;
  subjectIds: string[];
  subjectNames: string[];
  reasoning: string;
}

export class LineOptimizerService {
  /**
   * Suggest subject lines for a grade using AI or a greedy fallback.
   * Groups subjects that are NOT commonly taken together into the same line.
   */
  static async suggestLines(
    schoolId: string,
    gradeId: string,
  ): Promise<SuggestedLine[]> {
    // Load subjects for this grade
    const requirements = await SubjectRequirement.find({
      schoolId,
      gradeId,
      isDeleted: false,
    }).lean();

    if (requirements.length === 0) return [];

    const subjectIds = requirements.map((r) => String(r.subjectId));
    const subjects = await Subject.find({
      schoolId,
      _id: { $in: subjectIds },
      isDeleted: false,
    }).lean();

    const subjectNameMap = new Map(subjects.map((s) => [String(s._id), s.name]));

    // Try AI-based suggestion first
    try {
      return await LineOptimizerService.suggestWithAI(subjectIds, subjectNameMap, gradeId);
    } catch (err: unknown) {
      console.error('AI line suggestion failed, using greedy fallback:', err);
      return LineOptimizerService.suggestGreedy(subjectIds, subjectNameMap);
    }
  }

  /** Use AI to suggest optimal subject line groupings. */
  private static async suggestWithAI(
    subjectIds: string[],
    subjectNameMap: Map<string, string>,
    gradeId: string,
  ): Promise<SuggestedLine[]> {
    const subjectList = subjectIds
      .map((id) => `- ${subjectNameMap.get(id) ?? id} (${id})`)
      .join('\n');

    const systemPrompt = `You are a school timetable optimizer. Given a list of subjects for a grade, suggest subject line groupings. Subjects in the SAME line will be scheduled at the SAME time, so students can only pick ONE subject per line. Group subjects that students are unlikely to take together into the same line. Return JSON only.`;

    const userPrompt = `Grade: ${gradeId}
Subjects:
${subjectList}

Respond with a JSON array of lines:
[{ "lineName": "Line A", "subjectIds": ["id1", "id2"], "reasoning": "..." }]

Rules:
- Each subject must appear in exactly one line
- Aim for 3-6 subjects per line
- Group subjects that conflict (students rarely take both together)
- Compulsory subjects (Maths, English) should be in different lines or left out`;

    const response = await AIService.generateCompletion(systemPrompt, userPrompt, {
      maxTokens: 2048,
      temperature: 0.3,
    });

    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('AI did not return valid JSON');

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      lineName: string;
      subjectIds: string[];
      reasoning: string;
    }>;

    return parsed.map((line) => ({
      lineName: line.lineName,
      subjectIds: line.subjectIds,
      subjectNames: line.subjectIds.map((id) => subjectNameMap.get(id) ?? id),
      reasoning: line.reasoning,
    }));
  }

  /** Simple greedy fallback: distribute subjects round-robin into ~4 lines. */
  private static suggestGreedy(
    subjectIds: string[],
    subjectNameMap: Map<string, string>,
  ): SuggestedLine[] {
    const lineCount = Math.min(4, Math.ceil(subjectIds.length / 3));
    const lines: SuggestedLine[] = [];

    for (let i = 0; i < lineCount; i++) {
      lines.push({
        lineName: `Line ${String.fromCharCode(65 + i)}`,
        subjectIds: [],
        subjectNames: [],
        reasoning: 'Greedy round-robin grouping',
      });
    }

    // Sort subjects alphabetically for determinism
    const sorted = [...subjectIds].sort((a, b) => {
      const nameA = subjectNameMap.get(a) ?? a;
      const nameB = subjectNameMap.get(b) ?? b;
      return nameA.localeCompare(nameB);
    });

    for (let i = 0; i < sorted.length; i++) {
      const lineIdx = i % lineCount;
      const id = sorted[i];
      lines[lineIdx].subjectIds.push(id);
      lines[lineIdx].subjectNames.push(subjectNameMap.get(id) ?? id);
    }

    return lines;
  }
}
