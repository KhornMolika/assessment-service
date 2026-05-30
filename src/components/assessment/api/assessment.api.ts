import type {
  AssessmentCatalogItem,
  AssessmentCatalogPageData,
} from "@/src/types/assessment-catalog.types";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  AssessmentDetailPageData,
  AssessmentDetailRecord,
} from "@/src/types/assessment-detail.types";
import type {
  AssessmentResultsPageData,
  AssessmentResultSheetPageData,
  AssessmentScopedResultsPageData,
  ResultQuestionEntity,
} from "@/src/types/assessment-results.types";
import type { AnswerEntry } from "@/src/types/answer-entry.types";
import type { AnswerSheet } from "@/src/types/answer-sheet.types";
import type { Participant } from "@/src/types/participant.types";
import type { NewAssessmentFormData } from "@/src/types/assessment-form.types";
import type {
  AssessmentTopicMap,
  Bank,
  QuestionCatalogItem,
  Topic,
} from "@/src/types";
import {
  getMockBanks,
  getMockQuestionSummariesForBankName,
  getMockQuestions,
  getMockTopics,
} from "@/src/components/content/api/content.api";

type AnswerEntrySeed = {
  id: string;
  sheet_id: string;
  question_id: string;
  response: Record<string, unknown>;
  is_correct: boolean | null;
  score_awarded: number;
  grading_status: AnswerEntry["grading_status"];
  graded_at: string | null;
  updated_at: string;
};

const ASSESSMENT_REFERENCE_TIMESTAMP = Date.UTC(2026, 3, 30, 0, 0, 0);
const assessmentJsonPromises = new Map<string, Promise<unknown>>();

function loadAssessmentJson<T>(fileName: string): Promise<T> {
  if (!assessmentJsonPromises.has(fileName)) {
    assessmentJsonPromises.set(
      fileName,
      readFile(
        path.join(process.cwd(), "src/data", fileName),
        "utf8",
      ).then((value) => JSON.parse(value.replace(/^\uFEFF/, "")) as T),
    );
  }

  return assessmentJsonPromises.get(fileName) as Promise<T>;
}

function getMockAssessmentsSeed() {
  return loadAssessmentJson<AssessmentCatalogItem[]>("assessments.json");
}

function getMockAssessmentTopicsSeed() {
  return loadAssessmentJson<AssessmentTopicMap[]>("assessmentTopics.json");
}

function getMockResultParticipantsSeed() {
  return loadAssessmentJson<Participant[]>("resultParticipants.json");
}

function getMockResultAnswerSheetsSeed() {
  return loadAssessmentJson<AnswerSheet[]>("resultAnswerSheets.json");
}

function getMockResultQuestionSeedsSeed() {
  return loadAssessmentJson<ResultQuestionSeed[]>("resultQuestionSeeds.json");
}

function getMockResultAnswerEntrySeedsSeed() {
  return loadAssessmentJson<AnswerEntrySeed[]>("resultAnswerEntrySeeds.json");
}

type AssessmentResultsSeedData = {
  assessments: AssessmentCatalogItem[];
  resultParticipants: Participant[];
  resultAnswerSheets: AnswerSheet[];
  resultQuestionSeeds: ResultQuestionSeed[];
  resultAnswerEntrySeeds: AnswerEntrySeed[];
};

async function getAssessmentResultsSeedData(): Promise<AssessmentResultsSeedData> {
  const [
    assessments,
    resultParticipants,
    resultAnswerSheets,
    resultQuestionSeeds,
    resultAnswerEntrySeeds,
  ] = await Promise.all([
    getMockAssessmentsSeed(),
    getMockResultParticipantsSeed(),
    getMockResultAnswerSheetsSeed(),
    getMockResultQuestionSeedsSeed(),
    getMockResultAnswerEntrySeedsSeed(),
  ]);

  return {
    assessments,
    resultParticipants,
    resultAnswerSheets,
    resultQuestionSeeds,
    resultAnswerEntrySeeds,
  };
}

function getStartOfWeek(date: Date) {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

function getEndOfWeek(date: Date) {
  const endOfWeek = getStartOfWeek(date);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return endOfWeek;
}

export async function getAssessmentCatalogPageData(): Promise<AssessmentCatalogPageData> {
  "use cache";

  const now = new Date(ASSESSMENT_REFERENCE_TIMESTAMP);
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);
  const assessments = await getMockAssessmentsSeed();

  return {
    assessments,
    stats: {
      totalAssessments: assessments.length,
      draftCount: assessments.filter((assessment) => assessment.lifecycle === "DRAFT").length,
      activeCount: assessments.filter((assessment) => assessment.lifecycle === "ACTIVE").length,
      selfPacedCount: assessments.filter(
        (assessment) => assessment.delivery_mode === "SELF_PACED",
      ).length,
      realTimeCount: assessments.filter(
        (assessment) => assessment.delivery_mode === "REAL_TIME",
      ).length,
      startingThisWeekCount: assessments.filter((assessment) => {
        const startsAt = new Date(assessment.starts_at);

        return startsAt >= startOfWeek && startsAt < endOfWeek;
      }).length,
    },
  };
}

export async function getMockAssessmentTopics(): Promise<AssessmentTopicMap[]> {
  "use cache";

  return getMockAssessmentTopicsSeed();
}

export async function getAssessmentCatalogItemById(id: string): Promise<AssessmentCatalogItem | null> {
  "use cache";

  const assessments = await getMockAssessmentsSeed();
  return assessments.find((assessment) => assessment.id === id) ?? null;
}

function buildAssessmentDetailRecord(assessment: AssessmentCatalogItem): AssessmentDetailRecord {
  const participantCount = assessment.participant_count;
  const completedCount =
    participantCount === 0
      ? 0
      : Math.max(0, Math.min(participantCount, participantCount - Math.max(1, Math.round(participantCount * 0.09))));
  const inProgressCount = Math.max(0, participantCount - completedCount);
  const averageScorePercent =
    assessment.average_score === "-" ? 0 : Number.parseInt(assessment.average_score, 10);
  const passRatePercent =
    assessment.pass_rate === "-" ? 0 : Number.parseInt(assessment.pass_rate, 10);
  const sourceBank = assessment.question_bank_name;

  return {
    ...assessment,
    subtitle:
      assessment.description ?? `${assessment.title} delivery details and performance overview.`,
    source_bank: sourceBank,
    completed_count: completedCount,
    in_progress_count: inProgressCount,
    average_score_percent: averageScorePercent,
    pass_rate_percent: passRatePercent,
    live_sessions: assessment.delivery_mode === "REAL_TIME" ? 1 : 0,
    active_sessions: assessment.delivery_mode === "REAL_TIME" ? Math.max(1, inProgressCount) : 0,
    total_points: assessment.question_count * 4,
    time_limit_minutes: assessment.delivery_mode === "REAL_TIME" ? 60 : 45,
    created_by: "Admin User",
    question_selection: assessment.delivery_mode === "REAL_TIME" ? "Dynamic" : "Manual",
    shuffle_questions: true,
    allow_going_back: assessment.delivery_mode === "SELF_PACED",
    pass_mark: assessment.delivery_mode === "REAL_TIME" ? 70 : 60,
    show_results:
      assessment.delivery_mode === "SELF_PACED"
        ? "Immediately after submit"
        : "After the live session closes",
    is_allowed_share: assessment.delivery_mode === "SELF_PACED",
    is_showed_answers: assessment.delivery_mode === "SELF_PACED",
    grade_scale: [
      { grade: "A", minPercent: 90 },
      { grade: "B", minPercent: 80 },
      { grade: "C", minPercent: 70 },
      { grade: "D", minPercent: 60 },
      { grade: "E", minPercent: 50 },
      { grade: "F", minPercent: 0 },
    ],
  };
}

function buildTopPerformers(assessment: AssessmentCatalogItem) {
  return [
    { name: "Emma Wilson", score: 98, time: "45 min" },
    { name: "David Park", score: 95, time: "52 min" },
    { name: "Lisa Zhang", score: 92, time: "48 min" },
    { name: "Michael Kim", score: 90, time: "55 min" },
    { name: "Sarah Chen", score: assessment.delivery_mode === "REAL_TIME" ? 88 : 91, time: "60 min" },
  ];
}

function buildRecentActivity(assessment: AssessmentCatalogItem) {
  return [
    { name: "John Smith", action: "completed" as const, time: "5 min ago", score: 85 },
    { name: "Anna Lee", action: "started" as const, time: "12 min ago", score: null },
    { name: "Tom Brown", action: "completed" as const, time: "25 min ago", score: 92 },
    { name: "Jane Doe", action: "completed" as const, time: "1 hour ago", score: assessment.delivery_mode === "REAL_TIME" ? 78 : 83 },
  ];
}

function buildAssessmentQuestions(
  assessment: AssessmentCatalogItem,
  questionSummaries: Array<Pick<QuestionCatalogItem, "text" | "type" | "points">>,
): AssessmentDetailPageData["questions"] {
  if (assessment.id === "assessment-1" && assessment.delivery_mode === "SELF_PACED") {
    return [
      {
        id: `${assessment.id}-question-1`,
        question: "Which customer journey stage needs the most improvement this quarter?",
        type: "Single Choice",
        points: 5,
      },
      {
        id: `${assessment.id}-question-2`,
        question: "Select all channels where customers said response time felt slow.",
        type: "Multiple Choice",
        points: 5,
      },
      {
        id: `${assessment.id}-question-3`,
        question: "True or false: most customers said onboarding expectations were clearly explained.",
        type: "Boolean",
        points: 5,
      },
      {
        id: `${assessment.id}-question-4`,
        question: "In one sentence, what is the main reason customers gave for churn risk?",
        type: "Short Answer",
        points: 5,
      },
      {
        id: `${assessment.id}-question-5`,
        question: "Describe how your team would improve the support handoff experience next month.",
        type: "Essay",
        points: 10,
      },
      {
        id: `${assessment.id}-question-6`,
        question: "Rate the clarity of the latest account health dashboard update.",
        type: "Rating",
        points: 5,
      },
      {
        id: `${assessment.id}-question-7`,
        question: "Arrange the follow-up workflow in the correct order after a detractor response.",
        type: "Ordering",
        points: 5,
      },
      {
        id: `${assessment.id}-question-8`,
        question: "Fill in the blank: The best first response to a detractor is to ___ within ___ hours.",
        type: "Fill In The Blank",
        points: 5,
      },
      {
        id: `${assessment.id}-question-9`,
        question: "Match each feedback theme with the team that should own the next action.",
        type: "Matching",
        points: 5,
      },
      {
        id: `${assessment.id}-question-10`,
        question: "Upload a sample improvement note or screenshot that supports your proposed action.",
        type: "File Upload",
        points: 5,
      },
    ];
  }

  return questionSummaries.map((question, index) => ({
    id: `${assessment.id}-question-${index + 1}`,
    question: question.text,
    type: question.type,
    points: question.points,
  }));
}

export async function getAssessmentDetailPageData(
  id: string,
): Promise<AssessmentDetailPageData | null> {
  "use cache";

  const assessment = await getAssessmentCatalogItemById(id);

  if (!assessment) {
    return null;
  }

  const questionSummaries = await getMockQuestionSummariesForBankName(
    assessment.question_bank_name,
    8,
  );

  return {
    assessment: buildAssessmentDetailRecord(assessment),
    topPerformers: buildTopPerformers(assessment),
    recentActivity: buildRecentActivity(assessment),
    questions: buildAssessmentQuestions(assessment, questionSummaries),
  };
}

type ResultQuestionSeed = ResultQuestionEntity & {
  assessment_id: string;
  options?: {
    id: string;
    text: string;
  }[];
  correct_answer: unknown;
};

function buildResultsQuestions(data: AssessmentResultsSeedData): ResultQuestionEntity[] {
  return buildResultsQuestionSeeds(data).map(({ id, question_text, type_id, points }) => ({
    id,
    question_text,
    type_id,
    points,
  }));
}

function buildResultQuestionLookup(data: AssessmentResultsSeedData) {
  return new Map(buildResultsQuestionSeeds(data).map((question) => [question.id, question] as const));
}

function createAnswerEntry(
  questionLookup: Map<string, ResultQuestionSeed>,
  {
    id,
    sheet_id,
    question_id,
    response,
    is_correct,
    score_awarded,
    grading_status,
    graded_at,
    updated_at,
  }: AnswerEntrySeed,
): AnswerEntry {
  const question = questionLookup.get(question_id);

  if (!question) {
    throw new Error(`Missing result question seed for ${question_id}`);
  }

  return {
    id,
    sheet_id,
    question_id,
    response: JSON.stringify(response),
    question_snapshot: {
      id: question.id,
      question_text: question.question_text,
      type_id: question.type_id,
      points: question.points,
      options: question.options,
      correct_answer: question.correct_answer,
    },
    is_correct,
    score_awarded,
    grading_status,
    graded_at,
    updated_at,
  };
}

function buildResultsParticipants(data: AssessmentResultsSeedData): Participant[] {
  return data.resultParticipants;
}

function buildResultsAnswerSheets(data: AssessmentResultsSeedData): AnswerSheet[] {
  return data.resultAnswerSheets;
}

function buildResultsQuestionSeeds(data: AssessmentResultsSeedData): ResultQuestionSeed[] {
  return data.resultQuestionSeeds;
}

function buildResultsAnswerEntries(data: AssessmentResultsSeedData): AnswerEntry[] {
  const questionLookup = buildResultQuestionLookup(data);

  return data.resultAnswerEntrySeeds.map((seed) => createAnswerEntry(questionLookup, seed));
}

export async function getAssessmentResultsPageData(): Promise<AssessmentResultsPageData> {
  "use cache";

  const mockData = await getAssessmentResultsSeedData();
  const assessments = mockData.assessments;
  const participants = buildResultsParticipants(mockData);
  const answer_sheets = buildResultsAnswerSheets(mockData);
  const answer_entries = buildResultsAnswerEntries(mockData);
  const questions = buildResultsQuestions(mockData);
  const topics: Topic[] = await getMockTopics();
  const assessment_topics = await getMockAssessmentTopics();
  const submittedSheets = answer_sheets.filter((sheet) => sheet.submitted_at != null);
  const scoredSheets = submittedSheets.filter((sheet) => sheet.total_score != null);
  const passedSheets = submittedSheets.filter((sheet) => sheet.is_passed === true);

  return {
    stats: {
      totalSubmissions: submittedSheets.length,
      averageScorePercent:
        scoredSheets.length > 0
          ? Math.round(
              scoredSheets.reduce(
                (sum, sheet) => sum + Math.round(((sheet.total_score ?? 0) / sheet.max_score) * 100),
                0,
              ) / scoredSheets.length,
            )
          : 0,
      passRatePercent:
        submittedSheets.length > 0
          ? Math.round((passedSheets.length / submittedSheets.length) * 100)
          : 0,
      totalParticipants: participants.length,
    },
    assessments,
    participants,
    answer_sheets,
    answer_entries,
    questions,
    topics,
    assessment_topics,
  };
}

export async function getAssessmentResultSheetPageData(
  sheetId: string,
): Promise<AssessmentResultSheetPageData | null> {
  "use cache";

  const mockData = await getAssessmentResultsSeedData();
  const assessments = mockData.assessments;
  const participants = buildResultsParticipants(mockData);
  const answer_sheets = buildResultsAnswerSheets(mockData);
  const answer_entries = buildResultsAnswerEntries(mockData);
  const questions = buildResultsQuestions(mockData);

  const answer_sheet = answer_sheets.find((sheet) => sheet.id === sheetId);

  if (!answer_sheet) {
    return null;
  }

  const participant = participants.find((item) => item.id === answer_sheet.participant_id);
  const assessment = assessments.find((item) => item.id === answer_sheet.assessment_id);

  if (!participant || !assessment) {
    return null;
  }

  return {
    assessment,
    participant,
    answer_sheet,
    questions: questions.filter((question) =>
      answer_entries.some(
        (entry) => entry.sheet_id === answer_sheet.id && entry.question_id === question.id,
      ),
    ),
    answer_entries: answer_entries.filter((entry) => entry.sheet_id === answer_sheet.id),
  };
}

export async function getAssessmentScopedResultsPageData(
  assessmentId: string,
): Promise<AssessmentScopedResultsPageData | null> {
  "use cache";

  const data = await getAssessmentResultsPageData();
  const assessment = data.assessments.find((item) => item.id === assessmentId);

  if (!assessment) {
    return null;
  }

  const participants = data.participants.filter((item) => item.assessment_id === assessmentId);
  const answer_sheets = data.answer_sheets.filter((item) => item.assessment_id === assessmentId);
  const sheetIds = new Set(answer_sheets.map((item) => item.id));
  const answer_entries = data.answer_entries.filter((item) => sheetIds.has(item.sheet_id));
  const questionIds = new Set(answer_entries.map((item) => item.question_id));
  const questions = data.questions.filter((item) => questionIds.has(item.id));
  const submittedSheets = answer_sheets.filter((item) => item.submitted_at != null);
  const scoredSheets = submittedSheets.filter((item) => item.total_score != null);
  const passedSheets = submittedSheets.filter((item) => item.is_passed === true);
  const pendingReviewCount = answer_sheets.filter(
    (item) =>
      item.status === "REVIEW_PENDING" ||
      answer_entries.some(
        (entry) => entry.sheet_id === item.id && entry.grading_status === "PENDING",
      ),
  ).length;

  return {
    assessment,
    stats: {
      totalSubmissions: submittedSheets.length,
      averageScorePercent:
        scoredSheets.length > 0
          ? Math.round(
              scoredSheets.reduce(
                (sum, sheet) => sum + Math.round(((sheet.total_score ?? 0) / sheet.max_score) * 100),
                0,
              ) / scoredSheets.length,
            )
          : 0,
      passRatePercent:
        submittedSheets.length > 0
          ? Math.round((passedSheets.length / submittedSheets.length) * 100)
          : 0,
      totalParticipants: participants.length,
      pendingReviewCount,
    },
    participants,
    answer_sheets,
    answer_entries,
    questions,
  };
}

export async function getNewAssessmentPageData(): Promise<{
  banks: Bank[];
  questions: QuestionCatalogItem[];
}> {
  "use cache";

  const [banks, questions] = await Promise.all([getMockBanks(), getMockQuestions()]);

  return {
    banks,
    questions,
  };
}

export async function getEditAssessmentPageData(id: string): Promise<{
  assessmentId: string;
  banks: Bank[];
  questions: QuestionCatalogItem[];
  initialFormData: NewAssessmentFormData;
}> {
  "use cache";

  const [banks, questions] = await Promise.all([getMockBanks(), getMockQuestions()]);
  const selectedBank = banks[0];
  const selectedQuestions = questions
    .filter((question) => question.bank_id === selectedBank?.id)
    .slice(0, 3);

  return {
    assessmentId: id,
    banks,
    questions,
    initialFormData: {
      title: "Customer Satisfaction Survey - Q3 2026",
      description: "Measure satisfaction trends across active enterprise accounts.",
      ownerTopicId: "topic-onboarding",
      status: "PUBLISHED",
      participantIdentity: "EXTERNAL",
      sessionMode: "SELF_PACED",
      questionSelection: "MANUAL",
      selectedBankId: selectedBank?.id ?? "",
      selectedQuestionIds: selectedQuestions.map((question) => question.id),
      totalQuestions: 23,
      selectionRules: [
        { difficulty: "Easy", count: 8 },
        { difficulty: "Medium", count: 10 },
        { difficulty: "Hard", count: 5 },
      ],
      enableTimeLimit: true,
      timeLimitMinutes: 60,
      startsAt: "2026-03-01T09:00",
      endsAt: "2026-03-31T17:00",
      passMark: 70,
      shuffleQuestions: true,
      allowGoingBack: false,
      gradeLabels: [
        { grade: "A", minPercent: 90 },
        { grade: "B", minPercent: 80 },
        { grade: "C", minPercent: 70 },
        { grade: "D", minPercent: 60 },
        { grade: "E", minPercent: 50 },
        { grade: "F", minPercent: 0 },
      ],
      showResults: "IMMEDIATELY",
    },
  };
}
