import { apiClient } from "@/src/lib/api-client";
import type { QuestionTopicMap, Topic } from "@/src/types";
import type { QuestionBank, Question } from "@/src/types/api";
import type {
  QuestionFormData,
  QuestionFormType,
} from "@/src/types/question-form.types";
import type { QuestionDetailData } from "@/src/types/question-detail.types";

import { getBanks } from "./bank.api";
import { getTopics } from "./topic.api";

export interface QuestionCatalogPageData {
  banks: QuestionBank[];
  questions: Question[];
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const response = await apiClient.get<{ data: any[] }>(
      "/questions?limit=5000",
    );
    return (response.data || []).map((q) => ({
      id: String(q.id),
      questionText: String(q.questionText || q.text),
      type: String(q.type) as any,
      topicId: q.bankId ? String(q.bankId) : undefined,
      points: Number(q.points || 5),
      createdAt: String(q.createdAt || new Date().toISOString()),
      updatedAt: String(q.updatedAt || new Date().toISOString()),
      clientId: "",
      difficulty: q.difficulty || "MEDIUM",
      options: null,
      correctAnswer: null,
    }));
  } catch (_err) {
    return [];
  }
}

export async function getQuestionsummariesForBankName(
  bankName: string,
  limit: number,
): Promise<Array<Pick<Question, "questionText" | "type" | "points">>> {
  const [banks, questions] = await Promise.all([getBanks(), getQuestions()]);
  const normalizedBankName = bankName.trim().toLowerCase();
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
        question.topicId != null && matchingBankIds.has(question.topicId),
    )
    .slice(0, limit);
  const selectedQuestions =
    matchingQuestions.length > 0
      ? matchingQuestions
      : questions.slice(0, limit);

  return selectedQuestions.map(({ questionText, type, points }) => ({
    questionText,
    type,
    points,
  }));
}
export async function getQuestionTopics(): Promise<QuestionTopicMap[]> {
  return [];
}
export async function getQuestionCatalogPageData(): Promise<QuestionCatalogPageData> {
  try {
    const [banks, questionsRes] = await Promise.all([
      getBanks(),
      apiClient.get<{ data: Record<string, unknown>[] }>(
        "/questions?limit=500",
      ), // Or default pagination
    ]);
    return {
      banks,
      questions: (
        (questionsRes.data || questionsRes || []) as Record<string, unknown>[]
      ).map((q) => ({
        id: String(q.id),
        questionText: String(q.questionText || q.text),
        type: String(q.type) as any,
        topicId: q.bankId ? String(q.bankId) : undefined,
        points: Number(q.points || 5),
        createdAt: String(q.createdAt || new Date().toISOString()),
        updatedAt: String(q.updatedAt || new Date().toISOString()),
        clientId: "",
        difficulty: "MEDIUM" as any,
        options: null,
        correctAnswer: null,
      })),
    };
  } catch (err) {
    console.warn(
      "Failed to fetch question catalog page data:",
      err instanceof Error ? err.message : err,
    );
    return { banks: [], questions: [] };
  }
}
function getQuestionTypeMeta(typeName: string) {
  switch (typeName) {
    case "SINGLE_CHOICE":
    case "MCQ":
      return {
        id: "single-choice",
        name: typeName === "SINGLE_CHOICE" ? "SINGLE_CHOICE" : "MCQ",
        gradingStrategy: "BINARY",
        hasOptions: true,
        supportsAi: false,
        isManualOnly: false,
        defaultMaxScore: 1,
        description: "Single correct answer from multiple options",
      };
    case "MULTIPLE_CHOICE":
    case "Multiple Choice":
      return {
        id: "multiple-choice",
        name:
          typeName === "MULTIPLE_CHOICE"
            ? "MULTIPLE_CHOICE"
            : "Multiple Choice",
        gradingStrategy: "DEDUCTIVE",
        hasOptions: true,
        supportsAi: false,
        isManualOnly: false,
        defaultMaxScore: 1,
        description: "Multiple correct answers can be selected.",
      };
    case "TRUE_FALSE":
    case "True/False":
      return {
        id: "boolean",
        name: typeName === "TRUE_FALSE" ? "TRUE_FALSE" : "True/False",
        gradingStrategy: "BINARY",
        hasOptions: true,
        supportsAi: false,
        isManualOnly: false,
        defaultMaxScore: 1,
        description: "Binary statement validation with a single correct state.",
      };
    case "Short Answer":
      return {
        id: "short-answer",
        name: "Short Answer",
        gradingStrategy: "MANUAL_AI",
        hasOptions: false,
        supportsAi: true,
        isManualOnly: false,
        defaultMaxScore: 5,
        description: "Brief text response graded by rubric or keywords.",
      };
    case "ESSAY":
    case "Long Essay":
      return {
        id: "essay",
        name: typeName === "ESSAY" ? "ESSAY" : "Long Essay",
        gradingStrategy: "MANUAL_AI",
        hasOptions: false,
        supportsAi: true,
        isManualOnly: false,
        defaultMaxScore: 10,
        description:
          "Open-ended written response for manual or AI-assisted grading.",
      };
    case "Rating":
      return {
        id: "rating",
        name: "Rating",
        gradingStrategy: "SCALED",
        hasOptions: false,
        supportsAi: false,
        isManualOnly: false,
        defaultMaxScore: 5,
        description: "Rating response on a predefined scale.",
      };
    case "ORDERING":
    case "Ranking":
      return {
        id: "ordering",
        name: typeName === "ORDERING" ? "ORDERING" : "Ranking",
        gradingStrategy: "BINARY",
        hasOptions: false,
        supportsAi: false,
        isManualOnly: false,
        defaultMaxScore: 4,
        description: "Items arranged in the correct sequence.",
      };
    case "FILL_IN_THE_BLANK":
    case "Fill-in-blank":
      return {
        id: "fill",
        name:
          typeName === "FILL_IN_THE_BLANK"
            ? "FILL_IN_THE_BLANK"
            : "Fill-in-blank",
        gradingStrategy: "DEDUCTIVE",
        hasOptions: false,
        supportsAi: false,
        isManualOnly: false,
        defaultMaxScore: 3,
        description:
          "Learner fills one or more blanks in a sentence or template.",
      };
    case "Matching":
      return {
        id: "matching",
        name: "Matching",
        gradingStrategy: "DEDUCTIVE",
        hasOptions: false,
        supportsAi: false,
        isManualOnly: false,
        defaultMaxScore: 4,
        description: "Pairs items across two related columns.",
      };
    default:
      return {
        id: "generic",
        name: typeName,
        gradingStrategy: "BINARY",
        hasOptions: false,
        supportsAi: false,
        isManualOnly: false,
        defaultMaxScore: 1,
        description: "Question type metadata is not fully configured yet.",
      };
  }
}
export async function getQuestionDetail(
  id: string,
): Promise<QuestionDetailData> {
  try {
    const [questionRes, banks, allTopics] = await Promise.all([
      apiClient.get<any>(`/questions/${id}`),
      getBanks(),
      getTopics(),
    ]);
    const q = questionRes?.data ? questionRes.data : questionRes;

    const type = getQuestionTypeMeta(String(q.type));

    const qCorrectAnswer = (q.correctAnswer || q.correctAnswers) as
      | Record<string, unknown>
      | undefined;

    let correctOptionIds: string[] = [];
    if (q.type === "SINGLE_CHOICE" || q.type === "MCQ") {
      correctOptionIds =
        (qCorrectAnswer?.optionIds as string[]) ||
        (qCorrectAnswer?.optionId ? [qCorrectAnswer.optionId as string] : []);
    } else if (q.type === "MULTIPLE_CHOICE" || q.type === "Multiple Choice") {
      correctOptionIds = (qCorrectAnswer?.optionIds as string[]) || [];
    }

    // Map answer options from backend (if any)
    const options = Array.isArray(q.options)
      ? q.options.map((opt: Record<string, unknown>, idx: number) => {
          const optId = String(opt.id || String(idx));
          return {
            id: optId,
            questionId: id,
            optionText: String(opt.text || opt.optionText || ""),
            isCorrect: Boolean(
              opt.isCorrect || correctOptionIds.includes(optId),
            ),
            optionOrder: idx + 1,
          };
        })
      : [];

    let correctAnswerConfig: Record<string, unknown> = {
      type: "short",
      expected_keywords: [],
    };
    if (q.type === "SINGLE_CHOICE" || q.type === "MCQ") {
      correctAnswerConfig = {
        type: "single",
        correct_option_ids: correctOptionIds,
      };
    } else if (q.type === "MULTIPLE_CHOICE" || q.type === "Multiple Choice") {
      correctAnswerConfig = {
        type: "multiple",
        correct_option_ids: correctOptionIds,
      };
    } else if (q.type === "TRUE_FALSE" || q.type === "True/False") {
      correctAnswerConfig = { type: "boolean", value: qCorrectAnswer?.value };
    } else if (q.type === "MATCHING" || q.type === "Matching") {
      const leftOptions = (q.options?.leftSide || []) as Record<
        string,
        string
      >[];
      const rightOptions = (q.options?.rightSide || []) as Record<
        string,
        string
      >[];
      const pairs = (qCorrectAnswer?.pairs || []) as {
        leftId: string;
        rightId: string;
      }[];

      const mappedPairs = pairs.map((p) => {
        const leftOpt = leftOptions.find(
          (l) => String(l.id) === String(p.leftId),
        );
        const rightOpt = rightOptions.find(
          (r) => String(r.id) === String(p.rightId),
        );
        return {
          left: leftOpt?.text || p.leftId,
          right: rightOpt?.text || p.rightId,
        };
      });
      correctAnswerConfig = { type: "matching", pairs: mappedPairs };
    } else if (q.type === "FILL_IN_THE_BLANK" || q.type === "Fill-in-blank") {
      correctAnswerConfig = {
        type: "fill",
        answers: qCorrectAnswer?.answers || [],
      };
    } else if (q.type === "ORDERING" || q.type === "Ranking") {
      correctAnswerConfig = {
        type: "ordering",
        sequence: qCorrectAnswer?.sequence || [],
        correct_order: qCorrectAnswer?.order || [],
      };
    } else if (q.type === "ESSAY" || q.type === "Long Essay") {
      correctAnswerConfig = { type: "essay", value: null };
    } else {
      correctAnswerConfig = { type: "generic", ...qCorrectAnswer };
    }

    let bankId = q.bankId ? String(q.bankId) : null;
    let topicId = q.topicId
      ? String(q.topicId)
      : q.topic?.id
        ? String(q.topic.id)
        : null;

    const assignedBank = bankId
      ? banks.find((b) => String(b.id) === bankId) || null
      : null;
    const assignedTopic = topicId
      ? allTopics.find((t) => String(t.id) === topicId)
      : null;

    // For now, mapping topicId to the topics array
    const assignedTopics = assignedTopic
      ? [{ id: assignedTopic.id, name: assignedTopic.name }]
      : [];

    return {
      id: String(q.id),
      bankId: bankId,
      typeId: type.id,
      questionText: String(q.questionText || q.text || ""),
      language: "EN",
      difficulty: String(q.difficulty || "Medium") as any,
      points: Number(q.points || 5),
      tags: Array.isArray(q.tags) ? q.tags : [],
      settings: (q.settings as any) || {},
      correctAnswers: correctAnswerConfig,
      createdAt: String(q.createdAt || new Date().toISOString()),
      bank: assignedBank
        ? { id: assignedBank.id, name: assignedBank.name, ownerId: "" }
        : null,
      type,
      topics: assignedTopics,
      answerOptions: options,
      aiGradingConfig: null,
      stats: {
        createdBy: "Admin User",
        usedInAssessments: 0,
        totalAttempts: 0,
        averageScore: 0,
        correctAnswers: 0,
      },
    };
  } catch (err) {
    console.warn(
      "Failed to fetch mock question detail:",
      err instanceof Error ? err.message : err,
    );
    throw err;
  }
}
function mapCatalogTypeToEditorType(typeName: string): QuestionFormType {
  const normalized = typeName.toUpperCase();
  switch (normalized) {
    case "SINGLE_CHOICE":
      return "Single Choice";
    case "MULTIPLE_CHOICE":
      return "Multiple Choices";
    case "TRUE_FALSE":
      return "True/False";
    case "SHORT_ANSWER":
      return "Short Answer";
    case "ESSAY":
      return "Essay";
    case "RATING":
      return "Rating Scale";
    case "ORDERING":
      return "Ordering";
    case "FILL_IN_THE_BLANK":
      return "Fill in the Blank";
    case "MATCHING":
      return "Matching";
    default:
      return "Short Answer";
  }
}

function mapApiToFormData(
  question: import("@/src/types/question-detail.types").ApiQuestionResponse,
): QuestionFormData {
  const questionType = mapCatalogTypeToEditorType(question.type);
  const difficulty =
    question.difficulty === "HARD"
      ? "Hard"
      : question.difficulty === "EASY"
        ? "Easy"
        : "Medium";

  let options = question.options;
  let correctAnswers =
    question.correctAnswers || (question as any).correctAnswer || {};

  // Ensure topicId is properly captured
  const topicId = question.topic?.id || question.topicId || "";

  // Normalize old formats to new UI format if needed
  if (Array.isArray(options)) {
    options = options.map((opt: any, index: number) => ({
      id: opt.id || `opt_${index}`,
      text: opt.text || opt.optionText || opt.optionText || "",
    }));
  }

  // Handle specific question types if they are missing required UI structure
  if (questionType === "True/False" && !options) {
    options = { trueLabel: "True", falseLabel: "False" };
  } else if (
    questionType === "Fill in the Blank" &&
    (!options || !options.template)
  ) {
    options = {
      template: typeof options === "string" ? options : options?.template || "",
    };
  } else if (
    (questionType === "Single Choice" || questionType === "Multiple Choices") &&
    Array.isArray(question.options)
  ) {
    // Legacy support: extract correct answers from options if correctAnswers is empty
    if (Object.keys(correctAnswers).length === 0) {
      const correctOpts = question.options.filter(
        (opt: any) => opt.isCorrect || opt.isCorrect,
      );
      if (questionType === "Single Choice" && correctOpts.length > 0) {
        correctAnswers = { optionId: correctOpts[0].id || "opt_0" };
      } else if (
        questionType === "Multiple Choices" &&
        correctOpts.length > 0
      ) {
        correctAnswers = {
          optionIds: correctOpts.map((o: any, i: number) => o.id || `opt_${i}`),
        };
      }
    }
  }

  return {
    questionText: question.questionText || (question as any).text || "",
    questionType,
    bank: question.bankId || "",
    ownerTopicId: topicId,
    points: String(question.points || 1),
    difficulty,
    options,
    correctAnswers,
  };
}

export async function getQuestionEditPageData(id: string): Promise<{
  banks: QuestionBank[];
  topics: Topic[];
  formData: QuestionFormData;
}> {
  const question = await getQuestionDetailRaw(id);
  const [banks, topics] = await Promise.all([getBanks(), getTopics()]);

  return {
    banks,
    topics,
    formData: mapApiToFormData(question),
  };
}

export async function getQuestionDetailRaw(
  id: string,
): Promise<import("@/src/types/question-detail.types").ApiQuestionResponse> {
  try {
    const response = await apiClient.get<any>(`/questions/${id}`);
    const data = response?.data ? response.data : response;
    return data;
  } catch (err) {
    console.warn(
      "Failed to fetch raw question detail:",
      err instanceof Error ? err.message : err,
    );
    throw err;
  }
}
