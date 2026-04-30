import type {
  AssessmentCatalogItem,
  AssessmentCatalogPageData,
} from "@/src/domains/assessment/types/assessment-catalog.types";
import type {
  AssessmentDetailPageData,
  AssessmentDetailRecord,
} from "@/src/domains/assessment/types/assessment-detail.types";
import type {
  AssessmentResultsPageData,
  AssessmentResultSheetPageData,
  AssessmentScopedResultsPageData,
  ResultQuestionEntity,
} from "@/src/domains/assessment/types/assessment-results.types";
import type { AnswerEntry } from "@/src/domains/assessment/types/answer-entry.types";
import type { AnswerSheet } from "@/src/domains/assessment/types/answer-sheet.types";
import type { Participant } from "@/src/domains/assessment/types/participant.types";
import type { NewAssessmentFormData } from "@/src/domains/assessment/types/assessment-form.types";
import type {
  AssessmentTopicMap,
  Bank,
  QuestionCatalogItem,
  Topic,
} from "@/src/domains/content/types";
import { getMockBanks, getMockQuestions, getMockTopics } from "@/src/domains/content/api/content.api";

const ASSESSMENT_REFERENCE_TIMESTAMP = Date.UTC(2026, 3, 30, 0, 0, 0);

const mockAssessments: AssessmentCatalogItem[] = [
  {
    id: "assessment-1",
    owner_id: "owner-1",
    title: "Customer Satisfaction Survey - Q3 2026",
    description: "Measure satisfaction trends across active enterprise accounts.",
    status: "PUBLISHED",
    participant_identity: "EXTERNAL",
    created_at: "2026-03-01T08:00:00.000Z",
    updated_at: "2026-04-07T08:00:00.000Z",
    question_bank_name: "Survey",
    delivery_mode: "SELF_PACED",
    lifecycle: "ACTIVE",
    question_count: 23,
    participant_count: 461,
    pass_rate: "100%",
    average_score: "81%",
    starts_at: "2026-04-08T09:00:00.000Z",
  },
  {
    id: "assessment-2",
    owner_id: "owner-2",
    title: "Chemistry Quiz - Chapter 4 (Grade 11 Biology Gen. 1)",
    description: "Unit checkpoint covering organic chemistry foundations.",
    status: "PUBLISHED",
    participant_identity: "INTERNAL",
    created_at: "2026-03-12T08:00:00.000Z",
    updated_at: "2026-04-02T08:00:00.000Z",
    question_bank_name: "Grade 11",
    delivery_mode: "SELF_PACED",
    lifecycle: "DRAFT",
    question_count: 34,
    participant_count: 0,
    pass_rate: "-",
    average_score: "-",
    starts_at: "2026-04-15T08:30:00.000Z",
  },
  {
    id: "assessment-3",
    owner_id: "owner-3",
    title: "គណិតវិទ្យា - ត្រីកោណមាត្រ (វិទ្យាល័យសាន ១)",
    description: "Live assessment for trigonometry revision.",
    status: "PUBLISHED",
    participant_identity: "EXTERNAL",
    created_at: "2026-03-18T08:00:00.000Z",
    updated_at: "2026-04-08T08:00:00.000Z",
    question_bank_name: "គណិត",
    delivery_mode: "REAL_TIME",
    lifecycle: "EXAM",
    question_count: 28,
    participant_count: 0,
    pass_rate: "-",
    average_score: "-",
    starts_at: "2026-04-10T01:00:00.000Z",
  },
  {
    id: "assessment-4",
    owner_id: "owner-4",
    title: "Digital Marketing Fundamentals Quiz",
    description: "Self-paced readiness check for campaign team onboarding.",
    status: "PUBLISHED",
    participant_identity: "EXTERNAL",
    created_at: "2026-02-27T08:00:00.000Z",
    updated_at: "2026-04-05T08:00:00.000Z",
    question_bank_name: "Marketing",
    delivery_mode: "SELF_PACED",
    lifecycle: "ACTIVE",
    question_count: 18,
    participant_count: 96,
    pass_rate: "88%",
    average_score: "78%",
    starts_at: "2026-04-09T03:00:00.000Z",
  },
  {
    id: "assessment-5",
    owner_id: "owner-5",
    title: "Final Exam - Mathematics Grade 11",
    description: "Summative exam for final term evaluation.",
    status: "PUBLISHED",
    participant_identity: "INTERNAL",
    created_at: "2026-03-05T08:00:00.000Z",
    updated_at: "2026-04-06T08:00:00.000Z",
    question_bank_name: "Math",
    delivery_mode: "SELF_PACED",
    lifecycle: "EXAM",
    question_count: 42,
    participant_count: 243,
    pass_rate: "71%",
    average_score: "73%",
    starts_at: "2026-04-14T07:00:00.000Z",
  },
  {
    id: "assessment-6",
    owner_id: "owner-6",
    title: "Physics - Forces and Motion (Grade 11)",
    description: "Practice assessment for mechanics basics.",
    status: "PUBLISHED",
    participant_identity: "EXTERNAL",
    created_at: "2026-03-21T08:00:00.000Z",
    updated_at: "2026-04-01T08:00:00.000Z",
    question_bank_name: "Physics",
    delivery_mode: "SELF_PACED",
    lifecycle: "EXAM",
    question_count: 25,
    participant_count: 112,
    pass_rate: "83%",
    average_score: "76%",
    starts_at: "2026-04-18T06:30:00.000Z",
  },
  {
    id: "assessment-7",
    owner_id: "owner-7",
    title: "Tech Risk Assessment - TechCorp Q4",
    description: "Continuous learning checkpoint for compliance readiness.",
    status: "PUBLISHED",
    participant_identity: "INTERNAL",
    created_at: "2026-03-02T08:00:00.000Z",
    updated_at: "2026-04-07T08:00:00.000Z",
    question_bank_name: "Tech Risk",
    delivery_mode: "SELF_PACED",
    lifecycle: "ACTIVE",
    question_count: 23,
    participant_count: 154,
    pass_rate: "92%",
    average_score: "84%",
    starts_at: "2026-04-11T02:30:00.000Z",
  },
  {
    id: "assessment-8",
    owner_id: "owner-8",
    title: "Live Product Knowledge Quiz - Sales Team",
    description: "Timed real-time check before regional launch.",
    status: "PUBLISHED",
    participant_identity: "EXTERNAL",
    created_at: "2026-03-09T08:00:00.000Z",
    updated_at: "2026-04-03T08:00:00.000Z",
    question_bank_name: "Sales",
    delivery_mode: "REAL_TIME",
    lifecycle: "PENDING",
    question_count: 12,
    participant_count: 47,
    pass_rate: "87%",
    average_score: "-",
    starts_at: "2026-04-12T04:00:00.000Z",
  },
  {
    id: "assessment-9",
    owner_id: "owner-9",
    title: "Employee Onboarding Survey",
    description: "Feedback survey for the onboarding program.",
    status: "ARCHIVED",
    participant_identity: "ANONYMOUS",
    created_at: "2026-02-14T08:00:00.000Z",
    updated_at: "2026-03-28T08:00:00.000Z",
    question_bank_name: "Survey",
    delivery_mode: "SELF_PACED",
    lifecycle: "COMPLETED",
    question_count: 15,
    participant_count: 188,
    pass_rate: "100%",
    average_score: "-",
    starts_at: "2026-03-10T08:00:00.000Z",
  },
  {
    id: "assessment-10",
    owner_id: "owner-10",
    title: "Crypto Proficiency - Q1 Level",
    description: "Certification readiness assessment for new analysts.",
    status: "ARCHIVED",
    participant_identity: "EXTERNAL",
    created_at: "2026-01-28T08:00:00.000Z",
    updated_at: "2026-03-15T08:00:00.000Z",
    question_bank_name: "Crypto",
    delivery_mode: "SELF_PACED",
    lifecycle: "COMPLETED",
    question_count: 69,
    participant_count: 64,
    pass_rate: "-",
    average_score: "-",
    starts_at: "2026-02-01T08:00:00.000Z",
  },
];

const mockAssessmentTopics: AssessmentTopicMap[] = [
  { assessment_id: "assessment-1", topic_id: "topic-onboarding" },
  { assessment_id: "assessment-2", topic_id: "topic-chemistry" },
  { assessment_id: "assessment-3", topic_id: "topic-history" },
  { assessment_id: "assessment-4", topic_id: "topic-marketing" },
  { assessment_id: "assessment-5", topic_id: "topic-algebra" },
  { assessment_id: "assessment-5", topic_id: "topic-geometry" },
  { assessment_id: "assessment-6", topic_id: "topic-physics" },
  { assessment_id: "assessment-7", topic_id: "topic-security" },
  { assessment_id: "assessment-8", topic_id: "topic-marketing" },
  { assessment_id: "assessment-9", topic_id: "topic-onboarding" },
];


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
  const now = new Date(ASSESSMENT_REFERENCE_TIMESTAMP);
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);

  return {
    assessments: mockAssessments,
    stats: {
      totalAssessments: mockAssessments.length,
      draftCount: mockAssessments.filter((assessment) => assessment.lifecycle === "DRAFT").length,
      activeCount: mockAssessments.filter((assessment) => assessment.lifecycle === "ACTIVE").length,
      selfPacedCount: mockAssessments.filter(
        (assessment) => assessment.delivery_mode === "SELF_PACED",
      ).length,
      realTimeCount: mockAssessments.filter(
        (assessment) => assessment.delivery_mode === "REAL_TIME",
      ).length,
      startingThisWeekCount: mockAssessments.filter((assessment) => {
        const startsAt = new Date(assessment.starts_at);

        return startsAt >= startOfWeek && startsAt < endOfWeek;
      }).length,
    },
  };
}

export async function getMockAssessmentTopics(): Promise<AssessmentTopicMap[]> {
  return mockAssessmentTopics;
}

export async function getAssessmentCatalogItemById(id: string): Promise<AssessmentCatalogItem | null> {
  return mockAssessments.find((assessment) => assessment.id === id) ?? null;
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
  questions: QuestionCatalogItem[],
  banks: Bank[],
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

  const normalizedBankName = assessment.question_bank_name.trim().toLowerCase();
  const matchingBankIds = new Set(
    banks
      .filter((bank) => {
        const normalizedBankId = bank.id.trim().toLowerCase();
        const normalizedName = bank.name.trim().toLowerCase();

        return (
          normalizedName.includes(normalizedBankName) ||
          normalizedBankName.includes(normalizedName) ||
          normalizedBankId.includes(normalizedBankName)
        );
      })
      .map((bank) => bank.id),
  );

  const matchingQuestions = questions
    .filter(
      (question) =>
        question.bank_id != null && matchingBankIds.has(question.bank_id),
    )
    .slice(0, 8);

  const fallbackQuestions = questions.slice(0, 8);
  const selectedQuestions = matchingQuestions.length > 0 ? matchingQuestions : fallbackQuestions;

  return selectedQuestions.map((question, index) => ({
    id: `${assessment.id}-question-${index + 1}`,
    question: question.text,
    type: question.type,
    points: question.points,
  }));
}

export async function getAssessmentDetailPageData(
  id: string,
): Promise<AssessmentDetailPageData | null> {
  const assessment = await getAssessmentCatalogItemById(id);

  if (!assessment) {
    return null;
  }

  const [banks, questions] = await Promise.all([getMockBanks(), getMockQuestions()]);

  return {
    assessment: buildAssessmentDetailRecord(assessment),
    topPerformers: buildTopPerformers(assessment),
    recentActivity: buildRecentActivity(assessment),
    questions: buildAssessmentQuestions(assessment, questions, banks),
  };
}

function buildResultsParticipants(): Participant[] {
  return [
    {
      id: "participant-1",
      assessment_id: "assessment-5",
      display_name: "Sophea Ros",
      joined_at: "2026-03-24T07:30:00.000Z",
    },
    {
      id: "participant-2",
      assessment_id: "assessment-5",
      display_name: "Dara Mok",
      joined_at: "2026-03-16T18:00:00.000Z",
    },
    {
      id: "participant-3",
      assessment_id: "assessment-1",
      display_name: "Maly Pich",
      joined_at: "2026-03-17T18:12:00.000Z",
    },
    {
      id: "participant-4",
      assessment_id: "assessment-4",
      display_name: "Veasna Meng",
      joined_at: "2026-03-16T17:00:00.000Z",
    },
    {
      id: "participant-5",
      assessment_id: "assessment-7",
      display_name: "Sopheana Meng",
      joined_at: "2026-03-15T03:03:00.000Z",
    },
    {
      id: "participant-6",
      assessment_id: "assessment-2",
      display_name: "Sarom Lee",
      joined_at: "2026-03-25T03:23:00.000Z",
    },
    {
      id: "participant-7",
      assessment_id: "assessment-3",
      display_name: "Pisey Ngeth",
      joined_at: "2026-03-15T11:08:00.000Z",
    },
    {
      id: "participant-8",
      assessment_id: "assessment-6",
      display_name: "Thomas W.",
      joined_at: "2026-03-24T12:15:00.000Z",
    },
    {
      id: "participant-9",
      assessment_id: "assessment-6",
      display_name: "Thomas L.T.Canuto",
      joined_at: "2026-03-24T12:20:00.000Z",
    },
    {
      id: "participant-10",
      assessment_id: "assessment-8",
      display_name: "Nika Chen",
      joined_at: "2026-03-26T09:06:00.000Z",
    },
  ];
}

function buildResultsAnswerSheets(): AnswerSheet[] {
  return [
    {
      id: "sheet-1",
      participant_id: "participant-1",
      assessment_id: "assessment-5",
      status: "REVIEWED",
      total_score: 25,
      max_score: 35,
      grade: "B",
      is_passed: true,
      started_at: "2026-03-24T07:30:00.000Z",
      submitted_at: "2026-03-24T07:45:00.000Z",
      share_token: "share-1",
    },
    {
      id: "sheet-2",
      participant_id: "participant-2",
      assessment_id: "assessment-5",
      status: "REVIEWED",
      total_score: 18,
      max_score: 35,
      grade: "D",
      is_passed: false,
      started_at: "2026-03-16T18:00:00.000Z",
      submitted_at: "2026-03-16T18:45:00.000Z",
      share_token: "share-2",
    },
    {
      id: "sheet-3",
      participant_id: "participant-3",
      assessment_id: "assessment-1",
      status: "REVIEW_PENDING",
      total_score: null,
      max_score: 60,
      grade: null,
      is_passed: null,
      started_at: "2026-03-17T18:12:00.000Z",
      submitted_at: "2026-03-17T18:25:00.000Z",
      share_token: "share-3",
    },
    {
      id: "sheet-4",
      participant_id: "participant-4",
      assessment_id: "assessment-4",
      status: "REVIEWED",
      total_score: 19,
      max_score: 34,
      grade: "D",
      is_passed: false,
      started_at: "2026-03-16T17:00:00.000Z",
      submitted_at: "2026-03-16T17:46:00.000Z",
      share_token: "share-4",
    },
    {
      id: "sheet-5",
      participant_id: "participant-5",
      assessment_id: "assessment-7",
      status: "REVIEWED",
      total_score: 35,
      max_score: 35,
      grade: "A+",
      is_passed: true,
      started_at: "2026-03-15T03:03:00.000Z",
      submitted_at: "2026-03-15T03:20:00.000Z",
      share_token: "share-5",
    },
    {
      id: "sheet-6",
      participant_id: "participant-6",
      assessment_id: "assessment-2",
      status: "REVIEW_PENDING",
      total_score: null,
      max_score: 42,
      grade: null,
      is_passed: null,
      started_at: "2026-03-25T03:23:00.000Z",
      submitted_at: "2026-03-25T03:50:00.000Z",
      share_token: "share-6",
    },
    {
      id: "sheet-7",
      participant_id: "participant-7",
      assessment_id: "assessment-3",
      status: "REVIEWED",
      total_score: 25,
      max_score: 35,
      grade: "C",
      is_passed: true,
      started_at: "2026-03-15T11:08:00.000Z",
      submitted_at: "2026-03-15T11:20:00.000Z",
      share_token: "share-7",
    },
    {
      id: "sheet-8",
      participant_id: "participant-8",
      assessment_id: "assessment-6",
      status: "REVIEWED",
      total_score: 29,
      max_score: 33,
      grade: "B+",
      is_passed: true,
      started_at: "2026-03-24T12:15:00.000Z",
      submitted_at: "2026-03-24T12:45:00.000Z",
      share_token: "share-8",
    },
    {
      id: "sheet-9",
      participant_id: "participant-9",
      assessment_id: "assessment-6",
      status: "REVIEWED",
      total_score: 31,
      max_score: 33,
      grade: "A",
      is_passed: true,
      started_at: "2026-03-24T12:20:00.000Z",
      submitted_at: "2026-03-24T12:48:00.000Z",
      share_token: "share-9",
    },
    {
      id: "sheet-10",
      participant_id: "participant-10",
      assessment_id: "assessment-8",
      status: "REVIEWED",
      total_score: 22,
      max_score: 26,
      grade: "B+",
      is_passed: true,
      started_at: "2026-03-26T09:06:00.000Z",
      submitted_at: "2026-03-26T09:15:00.000Z",
      share_token: "share-10",
    },
  ];
}

type ResultQuestionSeed = ResultQuestionEntity & {
  assessment_id: string;
  options?: {
    id: string;
    text: string;
  }[];
  correct_answer: unknown;
};

function buildResultsQuestionSeeds(): ResultQuestionSeed[] {
  return [
    {
      id: "assessment-1-question-1",
      assessment_id: "assessment-1",
      question_text: "Which account journey stage had the lowest satisfaction rating this quarter?",
      type_id: "SINGLE_CHOICE",
      points: 15,
      options: [
        { id: "a1-q1-a", text: "Implementation" },
        { id: "a1-q1-b", text: "Support handoff" },
        { id: "a1-q1-c", text: "Renewal review" },
      ],
      correct_answer: "a1-q1-b",
    },
    {
      id: "assessment-1-question-2",
      assessment_id: "assessment-1",
      question_text: "Select all channels where customers reported slow response time.",
      type_id: "MULTIPLE_CHOICE",
      points: 15,
      options: [
        { id: "a1-q2-a", text: "Email" },
        { id: "a1-q2-b", text: "Chat" },
        { id: "a1-q2-c", text: "Phone" },
        { id: "a1-q2-d", text: "Community forum" },
      ],
      correct_answer: ["a1-q2-a", "a1-q2-b"],
    },
    {
      id: "assessment-1-question-3",
      assessment_id: "assessment-1",
      question_text: "Describe the main reason customers said handoff quality dropped.",
      type_id: "ESSAY",
      points: 10,
      correct_answer: null,
    },
    {
      id: "assessment-1-question-4",
      assessment_id: "assessment-1",
      question_text: "Upload a support note example that shows a better handoff.",
      type_id: "FILE_UPLOAD",
      points: 20,
      correct_answer: null,
    },
    {
      id: "assessment-2-question-1",
      assessment_id: "assessment-2",
      question_text: "Which bond type is present in methane?",
      type_id: "SINGLE_CHOICE",
      points: 10,
      options: [
        { id: "a2-q1-a", text: "Ionic" },
        { id: "a2-q1-b", text: "Covalent" },
        { id: "a2-q1-c", text: "Metallic" },
      ],
      correct_answer: "a2-q1-b",
    },
    {
      id: "assessment-2-question-2",
      assessment_id: "assessment-2",
      question_text: "List two indicators of a complete combustion reaction.",
      type_id: "SHORT_ANSWER",
      points: 10,
      correct_answer: null,
    },
    {
      id: "assessment-2-question-3",
      assessment_id: "assessment-2",
      question_text: "Choose the compounds that are hydrocarbons.",
      type_id: "MULTIPLE_CHOICE",
      points: 10,
      options: [
        { id: "a2-q3-a", text: "CH4" },
        { id: "a2-q3-b", text: "CO2" },
        { id: "a2-q3-c", text: "C2H6" },
        { id: "a2-q3-d", text: "H2O" },
      ],
      correct_answer: ["a2-q3-a", "a2-q3-c"],
    },
    {
      id: "assessment-2-question-4",
      assessment_id: "assessment-2",
      question_text: "Upload your worked solution for balancing the reaction.",
      type_id: "FILE_UPLOAD",
      points: 12,
      correct_answer: null,
    },
    {
      id: "assessment-3-question-1",
      assessment_id: "assessment-3",
      question_text: "sin(30Â°) equals:",
      type_id: "SINGLE_CHOICE",
      points: 10,
      options: [
        { id: "a3-q1-a", text: "1/2" },
        { id: "a3-q1-b", text: "âˆš3/2" },
        { id: "a3-q1-c", text: "1" },
      ],
      correct_answer: "a3-q1-a",
    },
    {
      id: "assessment-3-question-2",
      assessment_id: "assessment-3",
      question_text: "Select all true identities.",
      type_id: "MULTIPLE_CHOICE",
      points: 10,
      options: [
        { id: "a3-q2-a", text: "sinÂ²x + cosÂ²x = 1" },
        { id: "a3-q2-b", text: "tan x = sin x / cos x" },
        { id: "a3-q2-c", text: "sin x = cos x for every x" },
      ],
      correct_answer: ["a3-q2-a", "a3-q2-b"],
    },
    {
      id: "assessment-3-question-3",
      assessment_id: "assessment-3",
      question_text: "True or false: cos(0Â°) = 1.",
      type_id: "BOOLEAN",
      points: 5,
      correct_answer: true,
    },
    {
      id: "assessment-3-question-4",
      assessment_id: "assessment-3",
      question_text: "Rate your confidence in solving triangle identity questions.",
      type_id: "RATING",
      points: 10,
      correct_answer: 4,
    },
    {
      id: "assessment-4-question-1",
      assessment_id: "assessment-4",
      question_text: "Which channel delivered the highest conversion rate?",
      type_id: "SINGLE_CHOICE",
      points: 10,
      options: [
        { id: "a4-q1-a", text: "Email" },
        { id: "a4-q1-b", text: "Paid social" },
        { id: "a4-q1-c", text: "Organic search" },
      ],
      correct_answer: "a4-q1-c",
    },
    {
      id: "assessment-4-question-2",
      assessment_id: "assessment-4",
      question_text: "Select the metrics that indicate awareness-stage performance.",
      type_id: "MULTIPLE_CHOICE",
      points: 8,
      options: [
        { id: "a4-q2-a", text: "Impressions" },
        { id: "a4-q2-b", text: "Reach" },
        { id: "a4-q2-c", text: "Checkout rate" },
        { id: "a4-q2-d", text: "Video views" },
      ],
      correct_answer: ["a4-q2-a", "a4-q2-b", "a4-q2-d"],
    },
    {
      id: "assessment-4-question-3",
      assessment_id: "assessment-4",
      question_text: "Write one recommendation to improve landing-page performance.",
      type_id: "SHORT_ANSWER",
      points: 6,
      correct_answer: null,
    },
    {
      id: "assessment-4-question-4",
      assessment_id: "assessment-4",
      question_text: "Rate the quality of the campaign brief.",
      type_id: "RATING",
      points: 10,
      correct_answer: 4,
    },
    {
      id: "assessment-5-question-1",
      assessment_id: "assessment-5",
      question_text: "Which formula is correct for the quadratic discriminant?",
      type_id: "SINGLE_CHOICE",
      points: 10,
      options: [
        { id: "a5-q1-a", text: "bÂ² - 4ac" },
        { id: "a5-q1-b", text: "2a + 2b" },
        { id: "a5-q1-c", text: "aÂ² + bÂ²" },
      ],
      correct_answer: "a5-q1-a",
    },
    {
      id: "assessment-5-question-2",
      assessment_id: "assessment-5",
      question_text: "Select all equivalent fractions for 3/4.",
      type_id: "MULTIPLE_CHOICE",
      points: 10,
      options: [
        { id: "a5-q2-a", text: "6/8" },
        { id: "a5-q2-b", text: "9/12" },
        { id: "a5-q2-c", text: "12/20" },
        { id: "a5-q2-d", text: "15/20" },
      ],
      correct_answer: ["a5-q2-a", "a5-q2-b", "a5-q2-d"],
    },
    {
      id: "assessment-5-question-3",
      assessment_id: "assessment-5",
      question_text: "Explain the first step to solve 2x + 5 = 17.",
      type_id: "SHORT_ANSWER",
      points: 5,
      correct_answer: null,
    },
    {
      id: "assessment-5-question-4",
      assessment_id: "assessment-5",
      question_text: "Describe how to check a factorisation result.",
      type_id: "ESSAY",
      points: 10,
      correct_answer: null,
    },
    {
      id: "assessment-6-question-1",
      assessment_id: "assessment-6",
      question_text: "What is the SI unit of force?",
      type_id: "SINGLE_CHOICE",
      points: 8,
      options: [
        { id: "a6-q1-a", text: "Pascal" },
        { id: "a6-q1-b", text: "Newton" },
        { id: "a6-q1-c", text: "Joule" },
      ],
      correct_answer: "a6-q1-b",
    },
    {
      id: "assessment-6-question-2",
      assessment_id: "assessment-6",
      question_text: "Select all quantities that are vectors.",
      type_id: "MULTIPLE_CHOICE",
      points: 8,
      options: [
        { id: "a6-q2-a", text: "Velocity" },
        { id: "a6-q2-b", text: "Speed" },
        { id: "a6-q2-c", text: "Force" },
        { id: "a6-q2-d", text: "Mass" },
      ],
      correct_answer: ["a6-q2-a", "a6-q2-c"],
    },
    {
      id: "assessment-6-question-3",
      assessment_id: "assessment-6",
      question_text: "True or false: an object can move with constant velocity if the net force is zero.",
      type_id: "BOOLEAN",
      points: 8,
      correct_answer: true,
    },
    {
      id: "assessment-6-question-4",
      assessment_id: "assessment-6",
      question_text: "Rate how confident you are with Newton's laws.",
      type_id: "RATING",
      points: 9,
      correct_answer: 5,
    },
    {
      id: "assessment-7-question-1",
      assessment_id: "assessment-7",
      question_text: "Which scenario is a phishing attempt?",
      type_id: "SINGLE_CHOICE",
      points: 10,
      options: [
        { id: "a7-q1-a", text: "Unexpected login reset link" },
        { id: "a7-q1-b", text: "Scheduled payroll notice" },
        { id: "a7-q1-c", text: "Internal wiki update" },
      ],
      correct_answer: "a7-q1-a",
    },
    {
      id: "assessment-7-question-2",
      assessment_id: "assessment-7",
      question_text: "Select the signs of a risky vendor request.",
      type_id: "MULTIPLE_CHOICE",
      points: 10,
      options: [
        { id: "a7-q2-a", text: "Urgent payment request" },
        { id: "a7-q2-b", text: "Domain spelling mismatch" },
        { id: "a7-q2-c", text: "Existing approved contract" },
        { id: "a7-q2-d", text: "Bypasses approval workflow" },
      ],
      correct_answer: ["a7-q2-a", "a7-q2-b", "a7-q2-d"],
    },
    {
      id: "assessment-7-question-3",
      assessment_id: "assessment-7",
      question_text: "Write the first action you would take after spotting suspicious access.",
      type_id: "SHORT_ANSWER",
      points: 5,
      correct_answer: null,
    },
    {
      id: "assessment-7-question-4",
      assessment_id: "assessment-7",
      question_text: "Upload the incident note you would send to the security team.",
      type_id: "FILE_UPLOAD",
      points: 10,
      correct_answer: null,
    },
    {
      id: "assessment-8-question-1",
      assessment_id: "assessment-8",
      question_text: "Which feature is the strongest differentiator in the launch pitch?",
      type_id: "SINGLE_CHOICE",
      points: 6,
      options: [
        { id: "a8-q1-a", text: "Single sign-on" },
        { id: "a8-q1-b", text: "Automated forecasting" },
        { id: "a8-q1-c", text: "Dark mode" },
      ],
      correct_answer: "a8-q1-b",
    },
    {
      id: "assessment-8-question-2",
      assessment_id: "assessment-8",
      question_text: "Select all discovery questions that qualify urgency.",
      type_id: "MULTIPLE_CHOICE",
      points: 6,
      options: [
        { id: "a8-q2-a", text: "What happens if this issue stays unresolved?" },
        { id: "a8-q2-b", text: "How many users are affected?" },
        { id: "a8-q2-c", text: "What color theme do you prefer?" },
      ],
      correct_answer: ["a8-q2-a", "a8-q2-b"],
    },
    {
      id: "assessment-8-question-3",
      assessment_id: "assessment-8",
      question_text: "True or false: discounting should be the first negotiation move.",
      type_id: "BOOLEAN",
      points: 6,
      correct_answer: false,
    },
    {
      id: "assessment-8-question-4",
      assessment_id: "assessment-8",
      question_text: "Rate your confidence handling pricing objections.",
      type_id: "RATING",
      points: 8,
      correct_answer: 4,
    },
  ];
}

function buildResultsQuestions(): ResultQuestionEntity[] {
  return buildResultsQuestionSeeds().map(({ id, question_text, type_id, points }) => ({
    id,
    question_text,
    type_id,
    points,
  }));
}

function buildResultQuestionLookup() {
  return new Map(buildResultsQuestionSeeds().map((question) => [question.id, question] as const));
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
  }: {
    id: string;
    sheet_id: string;
    question_id: string;
    response: Record<string, unknown>;
    is_correct: boolean | null;
    score_awarded: number;
    grading_status: AnswerEntry["grading_status"];
    graded_at: string | null;
    updated_at: string;
  },
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

function buildResultsAnswerEntries(): AnswerEntry[] {
  const questionLookup = buildResultQuestionLookup();

  return [
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-1-1",
      sheet_id: "sheet-1",
      question_id: "assessment-5-question-1",
      response: { type: "single", selected_option_id: "a5-q1-a" },
      is_correct: true,
      score_awarded: 10,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T07:45:10.000Z",
      updated_at: "2026-03-24T07:45:10.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-1-2",
      sheet_id: "sheet-1",
      question_id: "assessment-5-question-2",
      response: { type: "multiple", selected_option_ids: ["a5-q2-a", "a5-q2-b", "a5-q2-d"] },
      is_correct: true,
      score_awarded: 10,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T07:45:11.000Z",
      updated_at: "2026-03-24T07:45:11.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-1-3",
      sheet_id: "sheet-1",
      question_id: "assessment-5-question-3",
      response: { type: "short", text: "Subtract 5 from both sides first." },
      is_correct: true,
      score_awarded: 3,
      grading_status: "MANUAL_REVISED",
      graded_at: "2026-03-24T08:10:00.000Z",
      updated_at: "2026-03-24T08:10:00.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-1-4",
      sheet_id: "sheet-1",
      question_id: "assessment-5-question-4",
      response: { type: "essay", text: "Expand the brackets again and compare to the original expression." },
      is_correct: false,
      score_awarded: 2,
      grading_status: "MANUAL_REVISED",
      graded_at: "2026-03-24T08:11:00.000Z",
      updated_at: "2026-03-24T08:11:00.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-2-1",
      sheet_id: "sheet-2",
      question_id: "assessment-5-question-1",
      response: { type: "single", selected_option_id: "a5-q1-b" },
      is_correct: false,
      score_awarded: 0,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-16T18:45:10.000Z",
      updated_at: "2026-03-16T18:45:10.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-2-2",
      sheet_id: "sheet-2",
      question_id: "assessment-5-question-2",
      response: { type: "multiple", selected_option_ids: ["a5-q2-a", "a5-q2-d"] },
      is_correct: false,
      score_awarded: 8,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-16T18:45:11.000Z",
      updated_at: "2026-03-16T18:45:11.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-2-3",
      sheet_id: "sheet-2",
      question_id: "assessment-5-question-3",
      response: { type: "short", text: "Move the 2 to the other side." },
      is_correct: false,
      score_awarded: 4,
      grading_status: "MANUAL_REVISED",
      graded_at: "2026-03-16T19:05:00.000Z",
      updated_at: "2026-03-16T19:05:00.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-2-4",
      sheet_id: "sheet-2",
      question_id: "assessment-5-question-4",
      response: { type: "essay", text: "Check with another example after factorising." },
      is_correct: false,
      score_awarded: 6,
      grading_status: "MANUAL_REVISED",
      graded_at: "2026-03-16T19:06:00.000Z",
      updated_at: "2026-03-16T19:06:00.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-3-1",
      sheet_id: "sheet-3",
      question_id: "assessment-1-question-1",
      response: { type: "single", selected_option_id: "a1-q1-b" },
      is_correct: true,
      score_awarded: 15,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-17T18:25:10.000Z",
      updated_at: "2026-03-17T18:25:10.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-3-2",
      sheet_id: "sheet-3",
      question_id: "assessment-1-question-2",
      response: { type: "multiple", selected_option_ids: ["a1-q2-a", "a1-q2-b"] },
      is_correct: true,
      score_awarded: 15,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-17T18:25:11.000Z",
      updated_at: "2026-03-17T18:25:11.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-3-3",
      sheet_id: "sheet-3",
      question_id: "assessment-1-question-3",
      response: { type: "essay", text: "The support team lacked enough context from implementation handoff notes." },
      is_correct: null,
      score_awarded: 0,
      grading_status: "PENDING",
      graded_at: null,
      updated_at: "2026-03-17T18:25:12.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-3-4",
      sheet_id: "sheet-3",
      question_id: "assessment-1-question-4",
      response: { type: "file", file_url: "/files/handoff-note-example.pdf" },
      is_correct: null,
      score_awarded: 0,
      grading_status: "PENDING",
      graded_at: null,
      updated_at: "2026-03-17T18:25:13.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-4-1",
      sheet_id: "sheet-4",
      question_id: "assessment-4-question-1",
      response: { type: "single", selected_option_id: "a4-q1-a" },
      is_correct: false,
      score_awarded: 0,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-16T17:46:01.000Z",
      updated_at: "2026-03-16T17:46:01.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-4-2",
      sheet_id: "sheet-4",
      question_id: "assessment-4-question-2",
      response: { type: "multiple", selected_option_ids: ["a4-q2-a", "a4-q2-d"] },
      is_correct: false,
      score_awarded: 5,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-16T17:46:02.000Z",
      updated_at: "2026-03-16T17:46:02.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-4-3",
      sheet_id: "sheet-4",
      question_id: "assessment-4-question-3",
      response: { type: "short", text: "Simplify the form and remove one field." },
      is_correct: true,
      score_awarded: 4,
      grading_status: "MANUAL_REVISED",
      graded_at: "2026-03-16T18:05:00.000Z",
      updated_at: "2026-03-16T18:05:00.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-4-4",
      sheet_id: "sheet-4",
      question_id: "assessment-4-question-4",
      response: { type: "rating", value: 10 },
      is_correct: true,
      score_awarded: 10,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-16T17:46:03.000Z",
      updated_at: "2026-03-16T17:46:03.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-5-1",
      sheet_id: "sheet-5",
      question_id: "assessment-7-question-1",
      response: { type: "single", selected_option_id: "a7-q1-a" },
      is_correct: true,
      score_awarded: 10,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-15T03:20:01.000Z",
      updated_at: "2026-03-15T03:20:01.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-5-2",
      sheet_id: "sheet-5",
      question_id: "assessment-7-question-2",
      response: { type: "multiple", selected_option_ids: ["a7-q2-a", "a7-q2-b", "a7-q2-d"] },
      is_correct: true,
      score_awarded: 10,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-15T03:20:02.000Z",
      updated_at: "2026-03-15T03:20:02.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-5-3",
      sheet_id: "sheet-5",
      question_id: "assessment-7-question-3",
      response: { type: "short", text: "Report it through the incident channel and isolate access." },
      is_correct: true,
      score_awarded: 5,
      grading_status: "MANUAL_REVISED",
      graded_at: "2026-03-15T03:36:00.000Z",
      updated_at: "2026-03-15T03:36:00.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-5-4",
      sheet_id: "sheet-5",
      question_id: "assessment-7-question-4",
      response: { type: "file", file_url: "/files/incident-note-sheet-5.pdf" },
      is_correct: true,
      score_awarded: 10,
      grading_status: "MANUAL_REVISED",
      graded_at: "2026-03-15T03:37:00.000Z",
      updated_at: "2026-03-15T03:37:00.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-6-1",
      sheet_id: "sheet-6",
      question_id: "assessment-2-question-1",
      response: { type: "single", selected_option_id: "a2-q1-b" },
      is_correct: true,
      score_awarded: 10,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-25T03:50:01.000Z",
      updated_at: "2026-03-25T03:50:01.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-6-2",
      sheet_id: "sheet-6",
      question_id: "assessment-2-question-2",
      response: { type: "short", text: "Blue flame and carbon dioxide release." },
      is_correct: null,
      score_awarded: 0,
      grading_status: "PENDING",
      graded_at: null,
      updated_at: "2026-03-25T03:50:02.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-6-3",
      sheet_id: "sheet-6",
      question_id: "assessment-2-question-3",
      response: { type: "multiple", selected_option_ids: ["a2-q3-a", "a2-q3-c"] },
      is_correct: true,
      score_awarded: 10,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-25T03:50:03.000Z",
      updated_at: "2026-03-25T03:50:03.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-6-4",
      sheet_id: "sheet-6",
      question_id: "assessment-2-question-4",
      response: { type: "file", file_url: "/files/chemistry-balancing-work.pdf" },
      is_correct: null,
      score_awarded: 0,
      grading_status: "PENDING",
      graded_at: null,
      updated_at: "2026-03-25T03:50:04.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-7-1",
      sheet_id: "sheet-7",
      question_id: "assessment-3-question-1",
      response: { type: "single", selected_option_id: "a3-q1-a" },
      is_correct: true,
      score_awarded: 10,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-15T11:20:01.000Z",
      updated_at: "2026-03-15T11:20:01.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-7-2",
      sheet_id: "sheet-7",
      question_id: "assessment-3-question-2",
      response: { type: "multiple", selected_option_ids: ["a3-q2-a", "a3-q2-c"] },
      is_correct: false,
      score_awarded: 5,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-15T11:20:02.000Z",
      updated_at: "2026-03-15T11:20:02.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-7-3",
      sheet_id: "sheet-7",
      question_id: "assessment-3-question-3",
      response: { type: "boolean", value: true },
      is_correct: true,
      score_awarded: 5,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-15T11:20:03.000Z",
      updated_at: "2026-03-15T11:20:03.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-7-4",
      sheet_id: "sheet-7",
      question_id: "assessment-3-question-4",
      response: { type: "rating", value: 5 },
      is_correct: true,
      score_awarded: 5,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-15T11:20:04.000Z",
      updated_at: "2026-03-15T11:20:04.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-8-1",
      sheet_id: "sheet-8",
      question_id: "assessment-6-question-1",
      response: { type: "single", selected_option_id: "a6-q1-b" },
      is_correct: true,
      score_awarded: 8,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T12:45:01.000Z",
      updated_at: "2026-03-24T12:45:01.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-8-2",
      sheet_id: "sheet-8",
      question_id: "assessment-6-question-2",
      response: { type: "multiple", selected_option_ids: ["a6-q2-a", "a6-q2-c"] },
      is_correct: true,
      score_awarded: 8,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T12:45:02.000Z",
      updated_at: "2026-03-24T12:45:02.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-8-3",
      sheet_id: "sheet-8",
      question_id: "assessment-6-question-3",
      response: { type: "boolean", value: true },
      is_correct: true,
      score_awarded: 8,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T12:45:03.000Z",
      updated_at: "2026-03-24T12:45:03.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-8-4",
      sheet_id: "sheet-8",
      question_id: "assessment-6-question-4",
      response: { type: "rating", value: 4 },
      is_correct: false,
      score_awarded: 5,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T12:45:04.000Z",
      updated_at: "2026-03-24T12:45:04.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-9-1",
      sheet_id: "sheet-9",
      question_id: "assessment-6-question-1",
      response: { type: "single", selected_option_id: "a6-q1-b" },
      is_correct: true,
      score_awarded: 8,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T12:48:01.000Z",
      updated_at: "2026-03-24T12:48:01.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-9-2",
      sheet_id: "sheet-9",
      question_id: "assessment-6-question-2",
      response: { type: "multiple", selected_option_ids: ["a6-q2-a", "a6-q2-c"] },
      is_correct: true,
      score_awarded: 8,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T12:48:02.000Z",
      updated_at: "2026-03-24T12:48:02.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-9-3",
      sheet_id: "sheet-9",
      question_id: "assessment-6-question-3",
      response: { type: "boolean", value: true },
      is_correct: true,
      score_awarded: 8,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T12:48:03.000Z",
      updated_at: "2026-03-24T12:48:03.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-9-4",
      sheet_id: "sheet-9",
      question_id: "assessment-6-question-4",
      response: { type: "rating", value: 5 },
      is_correct: true,
      score_awarded: 7,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-24T12:48:04.000Z",
      updated_at: "2026-03-24T12:48:04.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-10-1",
      sheet_id: "sheet-10",
      question_id: "assessment-8-question-1",
      response: { type: "single", selected_option_id: "a8-q1-b" },
      is_correct: true,
      score_awarded: 6,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-26T09:15:01.000Z",
      updated_at: "2026-03-26T09:15:01.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-10-2",
      sheet_id: "sheet-10",
      question_id: "assessment-8-question-2",
      response: { type: "multiple", selected_option_ids: ["a8-q2-a", "a8-q2-b"] },
      is_correct: true,
      score_awarded: 6,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-26T09:15:02.000Z",
      updated_at: "2026-03-26T09:15:02.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-10-3",
      sheet_id: "sheet-10",
      question_id: "assessment-8-question-3",
      response: { type: "boolean", value: false },
      is_correct: true,
      score_awarded: 6,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-26T09:15:03.000Z",
      updated_at: "2026-03-26T09:15:03.000Z",
    }),
    createAnswerEntry(questionLookup, {
      id: "entry-sheet-10-4",
      sheet_id: "sheet-10",
      question_id: "assessment-8-question-4",
      response: { type: "rating", value: 4 },
      is_correct: true,
      score_awarded: 4,
      grading_status: "AUTOMATIC",
      graded_at: "2026-03-26T09:15:04.000Z",
      updated_at: "2026-03-26T09:15:04.000Z",
    }),
  ];
}

export async function getAssessmentResultsPageData(): Promise<AssessmentResultsPageData> {
  const assessments = mockAssessments;
  const participants = buildResultsParticipants();
  const answer_sheets = buildResultsAnswerSheets();
  const answer_entries = buildResultsAnswerEntries();
  const questions = buildResultsQuestions();
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
  const assessments = mockAssessments;
  const participants = buildResultsParticipants();
  const answer_sheets = buildResultsAnswerSheets();
  const answer_entries = buildResultsAnswerEntries();
  const questions = buildResultsQuestions();

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
