import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import type { AnswerEntry } from "@/src/types/answer-entry.types";
import type { AnswerSheet } from "@/src/types/answer-sheet.types";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic } from "@/src/utils/topic-utils";
import type { AssessmentTopicMap, Topic } from "@/src/types";
import type {
  AnalyticsAssessmentRow,
  AnalyticsDistributionItem,
  AnalyticsQuestionBreakdown,
  AnalyticsSnapshot,
} from "@/src/types/analytics.types";

function parsePercent(value: string) {
  if (value === "-") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildTopicMap(topics: Topic[]) {
  return new Map(topics.map((topic) => [topic.id, topic]));
}

function getAssessmentTopicLabels(
  assessmentId: string,
  assessmentTopics: AssessmentTopicMap[],
  topicMap: Map<string, Topic>,
) {
  return assessmentTopics
    .filter((mapping) => mapping.assessment_id === assessmentId)
    .map((mapping) => topicMap.get(mapping.topic_id)?.name)
    .filter((name): name is string => Boolean(name))
    .sort((left, right) => left.localeCompare(right));
}

function buildAssessmentRows(
  assessments: AssessmentCatalogItem[],
  assessmentTopics: AssessmentTopicMap[],
  topics: Topic[],
): AnalyticsAssessmentRow[] {
  const topicMap = buildTopicMap(topics);

  return assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.name || assessment.title || "Untitled",
    topicLabels: getAssessmentTopicLabels(assessment.id, assessmentTopics, topicMap),
    participants: assessment.participant_count ?? 0,
    questions: assessment.settings?.numQuestions ?? assessment.question_count ?? 0,
    averageScore: parsePercent(assessment.average_score || "0%"),
    passRate: parsePercent(assessment.pass_rate || "0%"),
    lifecycle: assessment.status || assessment.lifecycle || "DRAFT",
    deliveryMode: assessment.settings?.mode || assessment.delivery_mode || "SELF_PACED",
  }));
}

function getDifficultyLabel(points: number) {
  if (points <= 6) {
    return "Easy";
  }

  if (points <= 10) {
    return "Medium";
  }

  return "Hard";
}

function parseResponse(entry: AnswerEntry) {
  try {
    return typeof entry.response === "string"
      ? (JSON.parse(entry.response) as Record<string, unknown>)
      : (entry.response as Record<string, unknown>);
  } catch {
    return null;
  }
}

function getCorrectOptionIds(correctAnswer: unknown) {
  if (typeof correctAnswer === "string") {
    return new Set([correctAnswer]);
  }

  if (Array.isArray(correctAnswer)) {
    return new Set(correctAnswer.filter((value): value is string => typeof value === "string"));
  }

  return new Set<string>();
}

function buildDistributionItems(
  counts: Map<string, number>,
  getToneClassName: (label: string, index: number) => string,
  helperSuffix: string,
) {
  const maxCount = Math.max(...counts.values(), 1);

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([label, value], index) => ({
      id: label,
      label,
      value,
      helper: `${Math.round((value / maxCount) * 100)}% ${helperSuffix}`,
      toneClassName: getToneClassName(label, index),
    }));
}

function buildDifficultyDistributionItems(counts: Map<string, number>) {
  const maxCount = Math.max(...counts.values(), 1);
  const order = { Hard: 0, Medium: 1, Easy: 2 };

  return [...counts.entries()]
    .sort((left, right) => order[left[0] as keyof typeof order] - order[right[0] as keyof typeof order])
    .map(([label, value]) => ({
      id: label,
      label,
      value,
      helper: `${Math.round((value / maxCount) * 100)}% of the largest difficulty bucket in this slice`,
      toneClassName:
        label === "Hard"
          ? "bg-primary"
          : label === "Medium"
            ? "bg-[color:var(--color-chart-2)]"
            : "bg-[color:var(--color-chart-4)]",
    }));
}

function buildAnalyticsDerivedData({
  visibleAssessments,
  answerEntries,
  answerSheets,
}: {
  visibleAssessments: AssessmentCatalogItem[];
  answerEntries: AnswerEntry[];
  answerSheets: AnswerSheet[];
}): {
  questionTypeDistribution: AnalyticsDistributionItem[];
  difficultyDistribution: AnalyticsDistributionItem[];
  questionBreakdown: AnalyticsQuestionBreakdown[];
} {
  const assessmentMap = new Map(visibleAssessments.map((assessment) => [assessment.id, assessment] as const));
  const submittedSheetIds = new Set(
    answerSheets
      .filter(
        (sheet) =>
          sheet.submitted_at != null && assessmentMap.has(sheet.assessment_id),
      )
      .map((sheet) => sheet.id),
  );
  const grouped = new Map<string, AnalyticsQuestionBreakdown>();
  const typeCounts = new Map<string, number>();
  const difficultyCounts = new Map<string, number>([
    ["Easy", 0],
    ["Medium", 0],
    ["Hard", 0],
  ]);
  const seenQuestionIds = new Set<string>();

  answerEntries.forEach((entry) => {
    if (!submittedSheetIds.has(entry.sheet_id)) {
      return;
    }

    const assessmentId = entry.question_id.split("-question-")[0];
    const assessment = assessmentMap.get(assessmentId);
    const options = entry.question_snapshot.options;

    if (!assessment) {
      return;
    }

    if (!seenQuestionIds.has(entry.question_id)) {
      seenQuestionIds.add(entry.question_id);
      const typeLabel = entry.question_snapshot.type_id.replaceAll("_", " ");
      const difficultyLabel = getDifficultyLabel(entry.question_snapshot.points);

      typeCounts.set(typeLabel, (typeCounts.get(typeLabel) ?? 0) + 1);
      difficultyCounts.set(difficultyLabel, (difficultyCounts.get(difficultyLabel) ?? 0) + 1);
    }

    if (!options || options.length === 0) {
      return;
    }

    if (!grouped.has(entry.question_id)) {
      const correctIds = getCorrectOptionIds(entry.question_snapshot.correct_answer);

      grouped.set(entry.question_id, {
        id: entry.question_id,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        questionText: entry.question_snapshot.question_text,
        questionType: entry.question_snapshot.type_id,
        responseCount: 0,
        correctResponseCount: 0,
        optionStats: options.map((option) => ({
          id: option.id,
          label: option.text,
          picks: 0,
          isCorrect: correctIds.has(option.id),
        })),
      });
    }

    const question = grouped.get(entry.question_id);

    if (!question) {
      return;
    }

    const response = parseResponse(entry);
    if (!response) {
      return;
    }

    question.responseCount += 1;
    if (entry.is_correct === true) {
      question.correctResponseCount += 1;
    }

    const singleOptionId =
      typeof response.selected_option_id === "string" ? response.selected_option_id : null;
    const multipleOptionIds = Array.isArray(response.selected_option_ids)
      ? response.selected_option_ids.filter((value): value is string => typeof value === "string")
      : [];
    const selectedIds = new Set(
      singleOptionId ? [singleOptionId, ...multipleOptionIds] : multipleOptionIds,
    );

    question.optionStats = question.optionStats.map((option) =>
      selectedIds.has(option.id)
        ? { ...option, picks: option.picks + 1 }
        : option,
    );
  });

  return {
    questionTypeDistribution: buildDistributionItems(
      typeCounts,
      (_label, index) =>
        index === 0
          ? "bg-primary"
          : index === 1
            ? "bg-secondary"
            : "bg-[color:var(--color-chart-3)]",
      "of the most common question type in this slice",
    ),
    difficultyDistribution: buildDifficultyDistributionItems(difficultyCounts),
    questionBreakdown: [...grouped.values()]
      .sort((left, right) => right.responseCount - left.responseCount)
      .slice(0, 6),
  };
}

export function buildAnalyticsSnapshot({
  assessments,
  assessmentTopics,
  topics,
  answerEntries,
  answerSheets,
  selectedAssessmentId,
  selectedTopic,
}: {
  assessments: AssessmentCatalogItem[];
  assessmentTopics: AssessmentTopicMap[];
  topics: Topic[];
  answerEntries: AnswerEntry[];
  answerSheets: AnswerSheet[];
  selectedAssessmentId: string;
  selectedTopic: string;
}): AnalyticsSnapshot {
  const topicMap = buildTopicMap(topics);
  const selectedTopicLabel =
    selectedTopic === ALL_TOPICS_VALUE
      ? "All topics"
      : topicMap.get(selectedTopic)?.name ?? "Unknown topic";

  const topicScopedAssessments = assessments.filter((assessment) =>
    selectedTopic === ALL_TOPICS_VALUE
      ? true
      : assessmentMatchesTopic(assessment.id, selectedTopic, assessmentTopics),
  );

  const visibleAssessments =
    selectedAssessmentId === "all-assessments"
      ? topicScopedAssessments
      : topicScopedAssessments.filter((assessment) => assessment.id === selectedAssessmentId);

  const rows = buildAssessmentRows(visibleAssessments, assessmentTopics, topics).sort(
    (left, right) => right.participants - left.participants,
  );
  const derivedData = buildAnalyticsDerivedData({
    visibleAssessments,
    answerEntries,
    answerSheets,
  });

  return {
    questionTypeDistribution: derivedData.questionTypeDistribution,
    difficultyDistribution: derivedData.difficultyDistribution,
    questionBreakdown: derivedData.questionBreakdown,
    assessmentRows: rows,
    selectedTopicLabel,
  };
}
