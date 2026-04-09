import type {
  AssessmentCatalogItem,
  AssessmentCatalogPageData,
} from "@/src/domains/assessment/types/assessment-catalog.types";

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
