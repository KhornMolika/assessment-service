import type {
  AssessmentCatalogItem,
  AssessmentCatalogPageData,
} from "@/src/types/assessment-catalog.types";

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
import type { AssessmentTopicMap, Topic } from "@/src/types";
import { getBanks } from "@/src/api/bank.api";
import { getQuestions } from "@/src/api/question.api";
import { getTopics } from "@/src/api/topic.api";

import { apiClient } from "@/src/lib/api-client";

const ASSESSMENT_REFERENCE_TIMESTAMP = Date.UTC(2026, 3, 30, 0, 0, 0);

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
  let assessments: AssessmentCatalogItem[] = [];
  try {
    const res = await apiClient.get<{ data: any[] }>("/assessments?limit=500");
    const rawData = res.data || (res as any) || [];

    assessments = rawData.map((a: any) => ({
      id: a.id,
      owner_id: "admin", // Backend doesn't return owner_id currently
      title: a.name,
      description: a.description,
      status: a.status,
      participant_identity: a.settings?.participantIdentity || "EXTERNAL",
      created_at: a.createdAt,
      updated_at: a.updatedAt,
      question_bank_name: "General Bank", // We don't have this in assessment root
      delivery_mode: a.settings?.mode || "SELF_PACED",
      lifecycle: a.status === "PUBLISHED" ? "ACTIVE" : a.status,
      question_count: a.settings?.numQuestions || 0,
      participant_count: 0, // Could fetch from report, but catalog doesn't include it yet
      pass_rate: "0%",
      average_score: "0",
      starts_at: a.settings?.startsAt || a.createdAt,
    }));
  } catch (e) {
    console.warn(
      "Failed to fetch assessments:",
      e instanceof Error ? e.message : e,
    );
  }

  return {
    assessments,
    stats: {
      totalAssessments: assessments.length,
      draftCount: assessments.filter(
        (assessment) => assessment.lifecycle === "DRAFT",
      ).length,
      activeCount: assessments.filter(
        (assessment) => assessment.lifecycle === "PUBLISHED",
      ).length,
      selfPacedCount: assessments.filter(
        (assessment) => assessment.delivery_mode === "SELF_PACED",
      ).length,
      realTimeCount: assessments.filter(
        (assessment) => assessment.delivery_mode === "REAL_TIME",
      ).length,
      startingThisWeekCount: assessments.filter((assessment) => {
        if (!assessment.starts_at) return false;
        const startsAt = new Date(assessment.starts_at);
        return startsAt >= startOfWeek && startsAt < endOfWeek;
      }).length,
    },
  };
}

export async function getAssessmentTopics(): Promise<AssessmentTopicMap[]> {
  return [];
}

export async function getAssessmentCatalogItemById(
  id: string,
): Promise<AssessmentCatalogItem | null> {
  try {
    const res = await apiClient.get<{ data: Record<string, unknown> }>(
      `/assessments/${id}`,
    );
    return (res.data || res || null) as any as AssessmentCatalogItem | null;
  } catch {
    return null;
  }
}

export async function getAssessmentDetailPageData(
  id: string,
): Promise<AssessmentDetailPageData | null> {
  try {
    const [assessmentRes, reportRes, questionsRes] = await Promise.all([
      apiClient.get<{ data: Record<string, unknown> }>(`/assessments/${id}`),
      apiClient
        .get<{
          data: {
            assessment: Record<string, number>;
            participants: any[];
            questionBreakdown: any[];
          };
        }>(`/assessments/${id}/report?limit=5000`)
        .catch(() => null),
      apiClient
        .get<{ data: Record<string, unknown>[] }>(`/assessments/${id}/questions`)
        .catch(() => null),
    ]);

    const assessment = (assessmentRes as any).data || (assessmentRes as any);
    const report = reportRes?.data || {
      assessment: { completed: 0, pending: 0, passRate: 0, averageScore: 0 },
      participants: [],
      questionBreakdown: [],
    };

    // Build assessment detail record using report stats
    const completedCount = report?.assessment?.completed || 0;
    const inProgressCount = report?.assessment?.pending || 0;

    const record: AssessmentDetailRecord = {
      id: assessment?.id,
      owner_id: "admin",
      title: assessment?.name,
      description: assessment?.description,
      status: assessment?.status,
      participant_identity:
        assessment?.settings?.participantIdentity || "EXTERNAL",
      created_at: assessment?.createdAt,
      updated_at: assessment?.updatedAt,
      question_bank_name: "General Bank",
      delivery_mode: assessment?.settings?.mode || "SELF_PACED",
      lifecycle: assessment?.status,
      question_count: assessment?.settings?.numQuestions || 0,
      participant_count: completedCount + inProgressCount,
      pass_rate: `${report?.assessment?.passRate ?? 0}%`,
      average_score: `${report?.assessment?.averageScore ?? 0}`,
      starts_at: assessment?.settings?.startsAt || assessment?.createdAt,

      subtitle:
        assessment?.description ??
        `${assessment?.name || "Assessment"} delivery details and performance overview.`,
      source_bank: "Custom Questions",
      completed_count: completedCount,
      in_progress_count: inProgressCount,
      average_score_percent: report?.assessment?.averageScore ?? 0,
      pass_rate_percent: report?.assessment?.passRate ?? 0,
      live_sessions: assessment?.settings?.mode === "REAL_TIME" ? 1 : 0,
      active_sessions:
        assessment?.settings?.mode === "REAL_TIME"
          ? Math.max(1, inProgressCount)
          : 0,
      total_points:
        report?.questionBreakdown?.reduce(
          (sum: number, q: any) => sum + (q.maxScore || 0),
          0,
        ) || 0,
      time_limit_minutes: assessment?.settings?.timeLimit
        ? Math.round(assessment.settings.timeLimit / 60)
        : assessment?.settings?.mode === "REAL_TIME"
          ? 60
          : 45,
      created_by: "Admin User",
      question_selection:
        assessment?.settings?.questionSelection === "DYNAMIC"
          ? "Dynamic"
          : "Manual",
      shuffle_questions: assessment?.settings?.isShuffle ?? true,
      allow_going_back:
        assessment?.settings?.allowReview ??
        assessment?.settings?.mode === "SELF_PACED",
      pass_mark: assessment?.settings?.passMark ?? 70,
      show_results:
        assessment?.settings?.showResults === "NEVER"
          ? "Never"
          : "Immediately after submit",
      is_allowed_share: false,
      is_showed_answers: assessment?.settings?.showResults === "IMMEDIATELY",
      grade_scale: [
        { grade: "A", minPercent: 90 },
        { grade: "B", minPercent: 80 },
        { grade: "C", minPercent: 70 },
        { grade: "D", minPercent: 60 },
        { grade: "E", minPercent: 50 },
        { grade: "F", minPercent: 0 },
      ],
    };
    // Map Questions
    const questions = ((questionsRes as any)?.data?.data || (questionsRes as any)?.data || questionsRes || []).map(
      (q: any) => {
        const questionData = q.question && typeof q.question === "object" ? q.question : q;
        return {
          id: questionData.id || q.id,
          question: questionData.questionText || questionData.text || (typeof q.question === "string" ? q.question : "Untitled Question"),
          type: questionData.type || questionData.questionType || "UNKNOWN",
          points: questionData.points || q.points || 5,
        };
      }
    );

    return {
      assessment: record,
      questions,
    };
  } catch (err) {
    console.warn(
      "Failed to fetch AssessmentDetailPageData:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
// Removed dead mock parsing logic

export async function getAssessmentResultsPageData(): Promise<AssessmentResultsPageData> {
  try {
    const assessmentsRes = await apiClient.get<{
      data: Record<string, unknown>[];
    }>("/assessments?limit=500");
    let assessments =
      assessmentsRes.data ||
      (assessmentsRes as unknown as Record<string, unknown>[]);

    // Sort descending and limit to 15 to avoid massive N+1 delays
    assessments = assessments
      .sort(
        (a, b) =>
          new Date(String(b.updated_at || 0)).getTime() -
          new Date(String(a.updated_at || 0)).getTime(),
      )
      .slice(0, 15);

    const reportsPromises = assessments.map((a) =>
      apiClient
        .get<{
          data: {
            assessment: Record<string, number>;
            participants: any[];
            questionBreakdown: any[];
          };
        }>(`/assessments/${a.id}/report`)
        .catch(() => null),
    );
    const reports = (await Promise.all(reportsPromises)).filter(Boolean);

    const allParticipants: any[] = [];
    const allAnswerSheets: any[] = [];
    const allQuestions: any[] = [];
    const allAnswerEntries: any[] = [];

    let totalSubmissions = 0;
    let totalScoreSum = 0;
    let totalScoreCount = 0;
    let totalPassCount = 0;
    let totalMaxScore = 0;

    for (const report of reports) {
      if (!report || !report.data) continue;
      const { assessment, participants, questionBreakdown } = report.data;

      totalSubmissions += assessment.completed || 0;

      for (const q of questionBreakdown || []) {
        allQuestions.push({
          id: q.assessmentQuestionId,
          question_text: q.questionText,
          type_id: q.type,
          points: q.maxScore,
        } as ResultQuestionEntity);
      }

      for (const p of participants || []) {
        if (!allParticipants.find((x) => x.id === p.participantId)) {
          allParticipants.push({
            id: p.participantId,
            assessment_id: String(assessment.id),
            display_name: p.name || "Anonymous",
            joined_at: p.submittedAt || new Date().toISOString(),
          } as Participant);
        }

        allAnswerSheets.push({
          id: p.sessionId,
          assessment_id: String(assessment.id),
          participant_id: p.participantId,
          status: p.submittedAt ? "COMPLETED" : "IN_PROGRESS",
          started_at: new Date(
            new Date(p.submittedAt || Date.now()).getTime() -
              (p.duration || 0) * 1000,
          ).toISOString(),
          submitted_at: p.submittedAt || null,
          total_score: p.score,
          max_score: 100, // simplified max score based on percentage or similar
          is_passed: p.isPassed,
          grade: p.isPassed ? "Pass" : "Fail",
          share_token: p.sessionId, // mock token
        } as AnswerSheet);

        if (p.score != null) {
          totalScoreSum += p.score;
          totalMaxScore += 100;
          totalScoreCount++;
          if (p.isPassed) totalPassCount++;
        }
      }
    }

    const topics: Topic[] = await getTopics();
    const assessment_topics = await getAssessmentTopics();

    return {
      stats: {
        totalSubmissions,
        averageScorePercent:
          totalScoreCount > 0
            ? Math.round((totalScoreSum / totalMaxScore) * 100)
            : 0,
        passRatePercent:
          totalSubmissions > 0
            ? Math.round((totalPassCount / totalSubmissions) * 100)
            : 0,
        totalParticipants: allParticipants.length,
      },
      assessments: assessments as any as AssessmentCatalogItem[],
      participants: allParticipants as any as Participant[],
      answer_sheets: allAnswerSheets as any as AnswerSheet[],
      answer_entries: allAnswerEntries as any as AnswerEntry[],
      questions: allQuestions as any as ResultQuestionEntity[],
      topics,
      assessment_topics,
    };
  } catch (err) {
    console.warn(
      "Failed getAssessmentResultsPageData:",
      err instanceof Error ? err.message : err,
    );
    return {
      stats: {
        totalSubmissions: 0,
        averageScorePercent: 0,
        passRatePercent: 0,
        totalParticipants: 0,
      },
      assessments: [],
      participants: [],
      answer_sheets: [],
      answer_entries: [],
      questions: [],
      topics: [],
      assessment_topics: [],
    };
  }
}

export async function getAssessmentResultSheetPageData(
  sheetId: string, // In this new backend, sheetId acts as sessionId
): Promise<AssessmentResultSheetPageData | null> {
  // The backend endpoint `GET /assessments/:assessmentId/sessions/:sessionId/report` requires assessmentId.
  // We'll need to figure out assessmentId. For now, since the global results page loads all sheets, we can
  // find the assessmentId by scanning reports, or we assume the UI will be updated to pass assessmentId.
  // For the sake of this deep integration, we will scan the assessments.
  try {
    const assessmentsRes = await apiClient.get<{
      data: Record<string, unknown>[];
    }>("/assessments?limit=500");
    let assessments =
      assessmentsRes.data ||
      (assessmentsRes as unknown as Record<string, unknown>[]);

    // Sort descending and take top 30. We scan recent ones for the session.
    assessments = assessments
      .sort(
        (a, b) =>
          new Date(String(b.updated_at || 0)).getTime() -
          new Date(String(a.updated_at || 0)).getTime(),
      )
      .slice(0, 30);

    const reportPromises = assessments.map((a) =>
      apiClient
        .get<{
          data: {
            participantId: string;
            name: string;
            email: string;
            submittedAt: string;
            duration: number;
            score: number;
            isPassed: boolean;
            questions: any[];
          };
        }>(`/assessments/${a.id}/sessions/${sheetId}/report`)
        .then((res) => ({
          assessmentId: a.id,
          report: res.data || (res as any),
        }))
        .catch(() => null),
    );

    const reports = await Promise.all(reportPromises);
    const targetMatch = reports.find((r) => r != null);

    if (!targetMatch) return null;

    const { assessmentId: targetAssessmentId, report: targetReport } =
      targetMatch;
    const assessment = assessments.find(
      (a: Record<string, unknown>) => a.id === targetAssessmentId,
    );

    // Map the deep session report to the old AnswerSheet / AnswerEntry UI shape
    const participant = {
      id: targetReport.participantId,
      assessment_id: String(targetAssessmentId),
      display_name: targetReport.name || "Anonymous",
      joined_at: targetReport.submittedAt || new Date().toISOString(),
    } as Participant;

    const answer_sheet = {
      id: sheetId,
      assessment_id: String(targetAssessmentId),
      participant_id: targetReport.participantId,
      status: targetReport.submittedAt ? "COMPLETED" : "IN_PROGRESS",
      started_at: new Date(
        new Date(targetReport.submittedAt || Date.now()).getTime() -
          (targetReport.duration || 0) * 1000,
      ).toISOString(),
      submitted_at: targetReport.submittedAt || null,
      total_score: targetReport.score,
      max_score: 100,
      is_passed: targetReport.isPassed,
      grade: targetReport.isPassed ? "Pass" : "Fail",
      share_token: sheetId,
    } as AnswerSheet;

    const questions = targetReport.questions.map(
      (q: any) =>
        ({
          id: q.assessmentQuestionId,
          question_text: q.questionText,
          type_id: q.type,
          points: q.maxScore || 5,
        }) as ResultQuestionEntity,
    );

    const answer_entries = targetReport.questions.map((q: any) => ({
      id: q.entryId || `${sheetId}-${q.assessmentQuestionId}`,
      sheet_id: sheetId,
      question_id: q.assessmentQuestionId,
      response: q.response,
      question_snapshot: {
        question_text: q.questionText,
        type_id: q.type,
        points: q.maxScore,
        options: q.options,
        correct_answer: q.correctAnswer,
      },
      is_correct: q.isCorrect,
      score_awarded: q.scoreAwarded,
      grading_status: q.gradingStatus || "AUTOMATIC",
      ai_grading: q.aiGrading
        ? {
            suggestedScore: q.aiGrading.suggestedScore,
            reasoning: q.aiGrading.reasoning,
            keyPointsAddressed: q.aiGrading.keyPointsAddressed || [],
            keyPointsMissed: q.aiGrading.keyPointsMissed || [],
            confidence: q.aiGrading.confidence,
            flagForReview: q.aiGrading.flagForReview || false,
          }
        : undefined,
    }));

    return {
      assessment: assessment as any,
      participant,
      answer_sheet,
      questions,
      answer_entries: answer_entries as any,
    };
  } catch {
    return null;
  }
}

export async function getAssessmentScopedResultsPageData(
  assessmentId: string,
): Promise<AssessmentScopedResultsPageData | null> {
  try {
    const [assessmentRes, reportRes, questionsRes] = await Promise.all([
      apiClient.get<{ data: Record<string, unknown> }>(
        `/assessments/${assessmentId}`,
      ),
      apiClient
        .get<{
          data: { assessment: Record<string, number>; participants: any[] };
        }>(`/assessments/${assessmentId}/report`)
        .catch(() => null),
      apiClient
        .get<{ data: Record<string, unknown>[] }>(`/assessments/${assessmentId}/questions`)
        .catch(() => null),
    ]);

    const assessment = assessmentRes;
    const report = reportRes?.data || { assessment: {}, participants: [] };

    const participants = (report.participants || []).map(
      (p: any) =>
        ({
          id: p.participantId,
          assessment_id: String(assessmentId),
          display_name: p.name || "Anonymous",
          joined_at: p.submittedAt || new Date().toISOString(),
        }) as Participant,
    );

    const answer_sheets = (report.participants || []).map(
      (p: any) =>
        ({
          id: p.sessionId,
          assessment_id: String(assessmentId),
          participant_id: p.participantId,
          status: p.submittedAt ? "COMPLETED" : "IN_PROGRESS",
          started_at: new Date(
            new Date(p.submittedAt || Date.now()).getTime() -
              (p.duration || 0) * 1000,
          ).toISOString(),
          submitted_at: p.submittedAt || null,
          total_score: p.score,
          max_score: 100,
          is_passed: p.isPassed,
          grade: p.isPassed ? "Pass" : "Fail",
          share_token: p.sessionId,
        }) as AnswerSheet,
    );

    const questions = ((questionsRes as any)?.data || questionsRes || []).map(
      (q: any) =>
        ({
          id: q.id,
          question_text: q.questionText || q.question_text,
          type_id: q.type || q.type_id,
          points: q.points || 5,
        }) as ResultQuestionEntity,
    );

    return {
      assessment: assessment as any, // TODO: map properly if needed by UI
      stats: {
        totalSubmissions: report.assessment.completed || 0,
        averageScorePercent: report.assessment.averageScore || 0,
        passRatePercent: report.assessment.passRate || 0,
        totalParticipants: report.assessment.totalParticipants || 0,
        pendingReviewCount: report.assessment.pending || 0,
      },
      participants,
      answer_sheets,
      answer_entries: [], // Empty for scoped overview
      questions,
    };
  } catch (err) {
    console.warn(
      "Failed getAssessmentScopedResultsPageData:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

// Removed getNewAssessmentPageData

export async function getEditAssessmentPageData(id: string): Promise<{
  assessmentId: string;
  initialFormData: NewAssessmentFormData;
}> {
  try {
    const [banks, assessmentRes, settingsRes, assignedRes] = await Promise.all([
      getBanks(),
      apiClient.get<{ data: Record<string, unknown> }>(`/assessments/${id}`),
      apiClient
        .get<{ data: Record<string, unknown> }>(`/assessments/${id}/settings`)
        .catch(() => null),
      apiClient
        .get<{
          data: Record<string, unknown>[];
        }>(`/assessments/${id}/questions`)
        .catch(() => null),
    ]);

    const assessment = (assessmentRes as any).data || (assessmentRes as any);
    const settings = (settingsRes as any)?.data || (settingsRes as any) || {};
    const assignedQs = ((assignedRes as any)?.data ||
      assignedRes ||
      []) as any[];

    const selectedBankId =
      settings.selectionRules?.bankId || banks[0]?.id || "";

    return {
      assessmentId: id,
      initialFormData: {
        name: assessment.name || "",
        type: assessment.type || "QUIZ",
        description: assessment.description || "",
        ownerTopicId: assessment.topicId || "",
        status: assessment.status || "DRAFT",
        participantIdentity: settings.participantIdentity || "EXTERNAL",
        sessionMode: settings.mode || "SELF_PACED",
        questionSelection: settings.questionSelection || "MANUAL",
        selectedBankId,
        selectedQuestionIds: assignedQs.map((q: any) => q.questionId || q.id),
        totalQuestions: settings.numQuestions || assignedQs.length || 0,
        selectionRules: settings.selectionRules?.distribution
          ? Object.entries(settings.selectionRules.distribution).map(
              ([k, v]) => ({
                difficulty: k as "Easy" | "Medium" | "Hard",
                count: v as number,
              }),
            )
          : [],
        enableTimeLimit: !!settings.timeLimit,
        timeLimitMinutes: settings.timeLimit
          ? Math.round(settings.timeLimit / 60)
          : 60,
        startsAt: settings.startsAt
          ? new Date(settings.startsAt).toISOString().slice(0, 16)
          : "",
        endsAt: settings.endsAt
          ? new Date(settings.endsAt).toISOString().slice(0, 16)
          : "",
        passMark: settings.passMark || 70,
        shuffleQuestions: !!settings.isShuffle,
        gradeLabels: [
          { grade: "A", minPercent: 90 },
          { grade: "B", minPercent: 80 },
          { grade: "C", minPercent: 70 },
          { grade: "D", minPercent: 60 },
          { grade: "E", minPercent: 50 },
          { grade: "F", minPercent: 0 },
        ],
        showResults: settings.showResults || "IMMEDIATELY",
      },
    };
  } catch (err) {
    console.warn(
      "Failed getEditAssessmentPageData:",
      err instanceof Error ? err.message : err,
    );
    throw err;
  }
}

export async function retryAIGrading(
  assessmentId: string,
  sessionId: string,
  entryId: string,
): Promise<boolean> {
  try {
    const res = await apiClient.post<{ data: { status: string } }>(
      `/assessments/${sessionId}/entries/${entryId}/ai-grading/retry`,
      {},
    );
    return res.data?.status === "queued";
  } catch (err) {
    console.warn(
      "Failed to retry AI grading:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
