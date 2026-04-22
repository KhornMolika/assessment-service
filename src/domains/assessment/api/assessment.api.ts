import type {
  AssessmentCatalogItem,
  AssessmentCatalogPageData,
} from "@/src/domains/assessment/types/assessment-catalog.types";
import type {
  AssessmentDetailPageData,
  AssessmentDetailRecord,
} from "@/src/domains/assessment/types/assessment-detail.types";
import type { NewAssessmentFormData } from "@/src/domains/assessment/types/assessment-form.types";
import type {
  AssessmentTopicMap,
  Bank,
  QuestionCatalogItem,
} from "@/src/domains/content/types";
import { getMockBanks, getMockQuestions } from "@/src/domains/content/api/content.api";

const mockAssessments: AssessmentCatalogItem[] = [
  {
    id: "assessment-1",
    owner_id: "owner-1",
    title: "Customer Satisfaction Survey - Q3 2026",
    description: "Measure satisfaction trends across active enterprise accounts.",
    status: "PUBLISHED",
    participant_identity: "REGISTERED",
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
    participant_identity: "REGISTERED",
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
    participant_identity: "REGISTERED",
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
    participant_identity: "REGISTERED",
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
    participant_identity: "REGISTERED",
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
    participant_identity: "REGISTERED",
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
    participant_identity: "REGISTERED",
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
    participant_identity: "REGISTERED",
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
    participant_identity: "REGISTERED",
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
  const now = new Date();
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
      titleEN: "Customer Satisfaction Survey - Q3 2026",
      titleKH: "",
      descriptionEN: "Measure satisfaction trends across active enterprise accounts.",
      descriptionKH: "",
      status: "PUBLISHED",
      participantIdentity: "NAME",
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
