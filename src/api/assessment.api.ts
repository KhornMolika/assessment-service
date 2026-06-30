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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getQuestions } from "@/src/api/question.api";
import { getTopics } from "@/src/api/topic.api";

import { apiClient } from "@/src/lib/api-client";

const ASSESSMENT_REFERENCE_TIMESTAMP = Date.now();

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<{ data: any[] }>("/assessments?limit=500");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = res.data || (res as any) || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assessments = rawData.map((a: any) => ({
      id: a.id,
      ownerId: a.ownerId || "admin",
      name: a.name,
      description: a.description,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      settings: a.settings || {},
      questionCount: a.questionCount,
      stats: {
        participantCount: a.settings?.participantCount || 0,
        passRate: a.settings?.passRate || 0,
        averageScore: a.settings?.averageScore || 0,
      }
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
        (assessment) => assessment.status === "DRAFT",
      ).length,
      activeCount: assessments.filter(
        (assessment) => assessment.status === "PUBLISHED",
      ).length,
      selfPacedCount: assessments.filter(
        (assessment) => assessment.settings?.mode === "SELF_PACED",
      ).length,
      realTimeCount: assessments.filter(
        (assessment) => assessment.settings?.mode === "REAL_TIME",
      ).length,
      startingThisWeekCount: assessments.filter((assessment) => {
        const startsAtDate = assessment.settings?.startsAt || assessment.createdAt;
        if (!startsAtDate) return false;
        const startsAt = new Date(startsAtDate);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res.data || res || null) as any as AssessmentCatalogItem | null;
  } catch {
    return null;
  }
}

export async function getAssessmentDetailPageData(
  id: string,
): Promise<AssessmentDetailPageData | null> {
  try {
    const assessmentRes = await apiClient.get<{ data: Record<string, unknown> }>(`/assessments/${id}`);
    const settingsRes = await apiClient.get<{ data: Record<string, unknown> }>(`/assessments/${id}/settings`).catch(() => null);
    const reportRes = await apiClient.get<{
      data: {
        assessment: Record<string, number>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        participants: any[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questionBreakdown: any[];
      };
    }>(`/assessments/${id}/report?limit=500`).catch(() => null);
    const questionsRes = await apiClient.get<{ data: Record<string, unknown>[] }>(`/assessments/${id}/questions`).catch(() => null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assessmentBase = (assessmentRes as any).data || (assessmentRes as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = (settingsRes as any)?.data || (settingsRes as any) || {};
    const assessment = { ...assessmentBase, settings: { ...assessmentBase.settings, ...settings } };
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
      topicId: assessment?.topic?.id || assessment?.topicId,
      topic: assessment?.topic,
      ownerId: "admin",
      name: assessment?.name || "Assessment",
      description: assessment?.description,
      status: assessment?.status,
      type: assessment?.type || "QUIZ",
      createdAt: assessment?.createdAt,
      updatedAt: assessment?.updatedAt,
      settings: assessment?.settings || {},
      detailStats: {
        completedCount: completedCount,
        inProgressCount: inProgressCount,
        averageScorePercent: report?.assessment?.averageScore ?? 0,
        passRatePercent: report?.assessment?.passRate ?? 0,
        liveSessions: assessment?.settings?.mode === "REAL_TIME" ? 1 : 0,
        activeSessions:
          assessment?.settings?.mode === "REAL_TIME"
            ? Math.max(1, inProgressCount)
            : 0,
        totalPoints:
          report?.questionBreakdown?.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, q: any) => sum + (q.maxScore || 0),
            0,
          ) || 0,
      }
    };
    // Map Questions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = ((questionsRes as any)?.data?.data || (questionsRes as any)?.data || questionsRes || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any) => {
        const questionData = q.question && typeof q.question === "object" ? q.question : q;
        return {
          id: q.id,
          question_id: q.questionId || questionData.id,
          question: questionData.questionText || questionData.text || (typeof q.question === "string" ? q.question : "Untitled Question"),
          type: questionData.type || questionData.questionType || "UNKNOWN",
          points: Number(questionData.points || q.points) || 5,
          options: questionData.options || q.options,
          correctAnswers: questionData.correctAnswers || q.correctAnswers || q.correctAnswer || questionData.correctAnswer,
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            participants: any[];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            questionBreakdown: any[];
          };
        }>(`/assessments/${a.id}/report`)
        .catch(() => null),
    );
    const reports = (await Promise.all(reportsPromises)).filter(Boolean);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allParticipants: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allAnswerSheets: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allQuestions: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          questionText: q.questionText,
          typeId: q.type,
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
          assessmentId: String(assessment.id),
          participantId: p.participantId,
          status: p.submittedAt ? "COMPLETED" : "IN_PROGRESS",
          startedAt: new Date(
            new Date(p.submittedAt || Date.now()).getTime() -
              (p.duration || 0) * 1000,
          ).toISOString(),
          submittedAt: p.submittedAt || null,
          totalScore: p.score,
          maxScore: 100, // simplified max score based on percentage or similar
          isPassed: p.isPassed,
          grade: p.isPassed ? "Pass" : "Fail",
          shareToken: p.sessionId, // mock token
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
    const assessmentTopics = await getAssessmentTopics();

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assessments: assessments as any as AssessmentCatalogItem[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participants: allParticipants as any as Participant[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answerSheets: allAnswerSheets as any as AnswerSheet[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answerEntries: allAnswerEntries as any as AnswerEntry[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions: allQuestions as any as ResultQuestionEntity[],
      topics,
      assessmentTopics,
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
      answerSheets: [],
      answerEntries: [],
      questions: [],
      topics: [],
      assessmentTopics: [],
    };
  }
}

export async function getAssessmentResultSheetPageData(
  sheetId: string, // In this new backend, sheetId acts as sessionId
): Promise<AssessmentResultSheetPageData | null> {
  try {
    const reportRes = await apiClient.get<{
      data: {
        session: {
          id: string;
          assessmentId: string;
          assessmentTitle: string | null;
          participantId: string | null;
          participantName: string | null;
          participantEmail: string | null;
          status: string;
          startedAt: string;
          submittedAt: string | null;
          totalScore: number | null;
          maxScore: number;
          grade: string | null;
          isPassed: boolean | null;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questions: any[];
      };
    }>(`/sessions/${sheetId}/report`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetReport = (reportRes as any)?.data?.data || (reportRes as any)?.data || reportRes;
    const session = targetReport.session;
    if (!session) return null;

    // Map the deep session report to the old AnswerSheet / AnswerEntry UI shape
    const participant = {
      id: session.participantId || "anonymous",
      assessment_id: session.assessmentId,
      display_name: session.participantName || "Anonymous",
      joined_at: session.submittedAt || session.startedAt || new Date().toISOString(),
    } as Participant;

    const hasPendingReview = targetReport.questions.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any) => q.gradingStatus === "PENDING",
    );

    const answerSheet = {
      id: sheetId,
      assessmentId: session.assessmentId,
      participantId: session.participantId || "anonymous",
      status: hasPendingReview ? "REVIEW_PENDING" : session.submittedAt ? "REVIEWED" : "IN_PROGRESS",
      startedAt: session.startedAt,
      submittedAt: session.submittedAt || null,
      totalScore: session.totalScore,
      maxScore: session.maxScore,
      isPassed: session.isPassed,
      grade: session.grade,
      shareToken: sheetId,
    } as AnswerSheet;

    const assessment = {
      id: session.assessmentId,
      name: session.assessmentTitle || "Untitled assessment",
      status: "PUBLISHED",
      createdAt: session.startedAt,
      updatedAt: session.submittedAt || session.startedAt,
    } as AssessmentCatalogItem;

    const questions = targetReport.questions.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any) =>
        ({
          id: q.assessmentQuestionId,
          questionText: q.questionText,
          typeId: q.type,
          points: q.maxScore || 5,
        }) as ResultQuestionEntity,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answerEntries = targetReport.questions.map((q: any) => ({
      id: q.entryId || `${sheetId}-${q.assessmentQuestionId}`,
      sheetId: sheetId,
      questionId: q.assessmentQuestionId,
      response: q.response,
      questionSnapshot: {
        questionText: q.questionText,
        typeId: q.type,
        points: q.maxScore,
        options: q.options,
        correctAnswers: q.correctAnswer,
      },
      isCorrect: q.isCorrect,
      scoreAwarded: q.scoreAwarded,
      gradingStatus: q.gradingStatus || "AUTOMATIC",
      aiGrading: q.aiGrading
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
      assessment,
      participant,
      answerSheet,
      questions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answerEntries: answerEntries as any,
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
      ).catch(() => null),
      apiClient
        .get<{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { assessment: Record<string, number>; participants: any[] };
        }>(`/assessments/${assessmentId}/report`)
        .catch(() => null),
      apiClient
        .get<{ data: Record<string, unknown>[] }>(`/assessments/${assessmentId}/questions`)
        .catch(() => null),
    ]);

    if (!assessmentRes) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assessment = (assessmentRes as any)?.data?.data || (assessmentRes as any)?.data || assessmentRes;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = (reportRes as any)?.data?.data || reportRes?.data || (reportRes as any) || { assessment: {}, participants: [] };

    const participants = (report.participants || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) =>
        ({
          id: p.participantId,
          assessment_id: String(assessmentId),
          display_name: p.name || "Anonymous",
          joined_at: p.submittedAt || new Date().toISOString(),
        }) as Participant,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = ((questionsRes as any)?.data?.data || (questionsRes as any)?.data || questionsRes || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any) =>
        ({
          id: q.id,
          questionText: q.questionText || q.questionText,
          typeId: q.type || q.typeId,
          points: q.points || 5,
        }) as ResultQuestionEntity,
    );
    const totalQuestionPoints = questions.reduce(
      (sum: number, question: ResultQuestionEntity) =>
        sum + Number(question.points || 0),
      0,
    );

    const answerSheets = (report.participants || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) =>
        ({
          id: p.sessionId,
          assessmentId: String(assessmentId),
          participantId: p.participantId,
          status: p.submittedAt ? "REVIEWED" : "IN_PROGRESS",
          startedAt: new Date(
            new Date(p.submittedAt || Date.now()).getTime() -
              (p.duration || 0) * 1000,
          ).toISOString(),
          submittedAt: p.submittedAt || null,
          totalScore: p.score,
          maxScore: totalQuestionPoints,
          isPassed: p.isPassed,
          grade: p.grade ?? (p.isPassed ? "Pass" : "Fail"),
          shareToken: p.sessionId,
        }) as AnswerSheet,
    );

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assessment: assessment as any, // TODO: map properly if needed by UI
      stats: {
        totalSubmissions: report.assessment.completed || 0,
        averageScorePercent: report.assessment.averageScore || 0,
        passRatePercent: report.assessment.passRate || 0,
        totalParticipants: report.assessment.totalParticipants || 0,
        pendingReviewCount: report.assessment.pending || 0,
      },
      participants,
      answerSheets,
      answerEntries: [], // Empty for scoped overview
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
    const banks = await getBanks();
    const assessmentRes = await apiClient.get<{ data: Record<string, unknown> }>(`/assessments/${id}`);
    const settingsRes = await apiClient.get<{ data: Record<string, unknown> }>(`/assessments/${id}/settings`).catch(() => null);
    const assignedRes = await apiClient.get<{
      data: Record<string, unknown>[];
    }>(`/assessments/${id}/questions`).catch(() => null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assessment = (assessmentRes as any).data || (assessmentRes as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = (settingsRes as any)?.data || (settingsRes as any) || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignedQs = ((assignedRes as any)?.data ||
      assignedRes ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      []) as any[];

    const selectedBankId =
      settings.selectionRules?.bankId || banks[0]?.id || "";

    return {
      assessmentId: id,
      initialFormData: {
        name: assessment.name || "",
        type: ["QUIZ", "EXAM", "SURVEY", "PRACTICE"].includes(assessment.type?.toUpperCase() || "") ? assessment.type.toUpperCase() : "QUIZ",
        description: assessment.description || "",
        ownerTopicId: assessment.topic?.id || assessment.topicId || "",
        status: ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(assessment.status?.toUpperCase() || "") ? assessment.status.toUpperCase() : "DRAFT",
        participantIdentity: settings.participantIdentity || "EXTERNAL",
        sessionMode: (settings.mode || "").toUpperCase().replace("-", "_") === "REAL_TIME" ? "REAL_TIME" : "SELF_PACED",
        questionSelection: settings.questionSelection?.toUpperCase() === "DYNAMIC" ? "DYNAMIC" : "MANUAL",
        selectedBankId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        enableTimeLimit: !!settings.timeLimit && !isNaN(Number(settings.timeLimit)) && Number(settings.timeLimit) > 0,
        timeLimitMinutes: settings.timeLimit && !isNaN(Number(settings.timeLimit)) && Number(settings.timeLimit) > 0
          ? Math.min(Math.max(Math.round(Number(settings.timeLimit) / 60), 1), 1440)
          : 60,
        startsAt: settings.startsAt && !isNaN(new Date(settings.startsAt).getTime())
          ? new Date(settings.startsAt).toISOString().slice(0, 16)
          : "",
        endsAt: settings.endsAt && !isNaN(new Date(settings.endsAt).getTime()) && (!settings.startsAt || new Date(settings.endsAt).getTime() >= new Date(settings.startsAt).getTime())
          ? new Date(settings.endsAt).toISOString().slice(0, 16)
          : "",
        passMark: Number(settings.passMark) || 70,
        shuffleQuestions: !!settings.isShuffle,
        gradeLabels: [
          { grade: "A", minPercent: 90 },
          { grade: "B", minPercent: 80 },
          { grade: "C", minPercent: 70 },
          { grade: "D", minPercent: 60 },
          { grade: "E", minPercent: 50 },
          { grade: "F", minPercent: 0 },
        ],
        showResults: (["IMMEDIATELY", "MANUAL", "NEVER"].includes(settings.showResults?.toUpperCase() || "") ? settings.showResults?.toUpperCase() : "IMMEDIATELY") as "IMMEDIATELY" | "MANUAL" | "NEVER",
        enableAiGrading: !settings.manualGradingAIQues,
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
