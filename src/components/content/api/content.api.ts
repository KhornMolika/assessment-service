import { apiClient } from "@/src/lib/api-client";
import type {
  Bank,
  BankTopicMap,
  QuestionCatalogItem,
  QuestionCatalogPageData,
  QuestionTopicMap,
  Topic,
} from "@/src/types";
import type { QuestionFormData, QuestionFormType } from "@/src/types/question-form.types";
import { duplicateQuestionIdPattern } from "../utils/question-duplicate-id";
import { inferAiGradingMode, syncAiGradingFormState } from "../utils/question-ai-grading";

export async function getMockBanks(): Promise<Bank[]> {
  "use cache";
  try {
    const response = await apiClient.get<{ data: Bank[] }>('/banks?limit=100');
    return response.data || (response as any);
  } catch (err) {
    console.error("Failed to fetch banks", err);
    return [];
  }
}

export async function getMockBankById(id: string): Promise<Bank | undefined> {
  "use cache";
  try {
    const response = await apiClient.get<Bank>(`/banks/${id}`);
    return response;
  } catch (err) {
    return undefined;
  }
}

export async function getMockQuestions(): Promise<QuestionCatalogItem[]> {
  "use cache";
  try {
    const response = await apiClient.get<{ data: QuestionCatalogItem[] }>('/questions?limit=100');
    return response.data || (response as any);
  } catch (err) {
    return [];
  }
}

export async function getMockQuestionSummariesForBankName(
  bankName: string,
  limit: number,
): Promise<Array<Pick<QuestionCatalogItem, "text" | "type" | "points">>> {
  "use cache";
  const [banks, questions] = await Promise.all([
    getMockBanks(),
    getMockQuestions(),
  ]);
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
        question.bank_id != null && matchingBankIds.has(question.bank_id),
    )
    .slice(0, limit);
  const selectedQuestions =
    matchingQuestions.length > 0 ? matchingQuestions : questions.slice(0, limit);

  return selectedQuestions.map(({ text, type, points }) => ({
    text,
    type,
    points,
  }));
}

export async function getMockTopics(): Promise<Topic[]> {
  "use cache";
  try {
    const response = await apiClient.get<{ data: Topic[] }>('/topics?limit=100');
    return response.data || (response as any);
  } catch (err) {
    return [];
  }
}

export async function getMockBankTopics(): Promise<BankTopicMap[]> {
  "use cache";
  // If the backend doesn't have this exact junction route yet, return empty array for now
  return [];
}

export async function getMockQuestionTopics(): Promise<QuestionTopicMap[]> {
  "use cache";
  return [];
}

export async function getMockBankDetailPageData(id: string): Promise<{
  bank: Bank | undefined;
  bankQuestions: QuestionCatalogItem[];
}> {
  "use cache";
  try {
    const [bankRes, questionsRes] = await Promise.all([
      apiClient.get<Bank>(`/banks/${id}`),
      apiClient.get<any>(`/banks/${id}/questions`),
    ]);
    
    return {
      bank: bankRes,
      bankQuestions: (questionsRes.data || questionsRes || []).map((q: any) => ({
        id: q.id,
        text: q.questionText || q.text,
        type: q.type,
        bank_id: id,
        points: q.points || 5,
        created_at: q.createdAt || new Date().toISOString()
      })),
    };
  } catch (err) {
    console.error("Failed to fetch bank detail page data", err);
    return { bank: undefined, bankQuestions: [] };
  }
}

export async function getQuestionCatalogPageData(): Promise<QuestionCatalogPageData> {
  "use cache";
  try {
    const [banks, questionsRes] = await Promise.all([
      getMockBanks(),
      apiClient.get<any>('/questions?limit=500'), // Or default pagination
    ]);
    return {
      banks,
      questions: (questionsRes.data || questionsRes || []).map((q: any) => ({
        id: q.id,
        text: q.questionText || q.text,
        type: q.type,
        bank_id: q.bankId || null,
        points: q.points || 5,
        created_at: q.createdAt || new Date().toISOString()
      })),
    };
  } catch (err) {
    console.error("Failed to fetch question catalog page data", err);
    return { banks: [], questions: [] };
  }
}

import type { QuestionDetailData } from "@/src/types/question-detail.types";

function getQuestionTypeMeta(typeName: string) {
  switch (typeName) {
    case "MCQ":
      return {
        id: "single-choice",
        name: "MCQ",
        grading_strategy: "BINARY",
        has_options: true,
        supports_ai: false,
        is_manual_only: false,
        default_max_score: 1,
        description: "Single correct answer from multiple options",
      };
    case "Multiple Choice":
      return {
        id: "multiple-choice",
        name: "Multiple Choice",
        grading_strategy: "DEDUCTIVE",
        has_options: true,
        supports_ai: false,
        is_manual_only: false,
        default_max_score: 1,
        description: "Multiple correct answers can be selected.",
      };
    case "True/False":
      return {
        id: "boolean",
        name: "True/False",
        grading_strategy: "BINARY",
        has_options: true,
        supports_ai: false,
        is_manual_only: false,
        default_max_score: 1,
        description: "Binary statement validation with a single correct state.",
      };
    case "Short Answer":
      return {
        id: "short-answer",
        name: "Short Answer",
        grading_strategy: "MANUAL_AI",
        has_options: false,
        supports_ai: true,
        is_manual_only: false,
        default_max_score: 5,
        description: "Brief text response graded by rubric or keywords.",
      };
    case "Long Essay":
      return {
        id: "essay",
        name: "Long Essay",
        grading_strategy: "MANUAL_AI",
        has_options: false,
        supports_ai: true,
        is_manual_only: false,
        default_max_score: 10,
        description: "Open-ended written response for manual or AI-assisted grading.",
      };
    case "Rating":
      return {
        id: "rating",
        name: "Rating",
        grading_strategy: "SCALED",
        has_options: false,
        supports_ai: false,
        is_manual_only: false,
        default_max_score: 5,
        description: "Rating response on a predefined scale.",
      };
    case "Ranking":
      return {
        id: "ordering",
        name: "Ranking",
        grading_strategy: "BINARY",
        has_options: false,
        supports_ai: false,
        is_manual_only: false,
        default_max_score: 4,
        description: "Items arranged in the correct sequence.",
      };
    case "Fill-in-blank":
      return {
        id: "fill",
        name: "Fill-in-blank",
        grading_strategy: "DEDUCTIVE",
        has_options: false,
        supports_ai: false,
        is_manual_only: false,
        default_max_score: 3,
        description: "Learner fills one or more blanks in a sentence or template.",
      };
    case "File Upload":
      return {
        id: "file",
        name: "File Upload",
        grading_strategy: "MANUAL_AI",
        has_options: false,
        supports_ai: true,
        is_manual_only: true,
        default_max_score: 5,
        description: "Learner uploads one or more files for review.",
      };
    case "Matching":
      return {
        id: "matching",
        name: "Matching",
        grading_strategy: "DEDUCTIVE",
        has_options: false,
        supports_ai: false,
        is_manual_only: false,
        default_max_score: 4,
        description: "Pairs items across two related columns.",
      };
    default:
      return {
        id: "generic",
        name: typeName,
        grading_strategy: "BINARY",
        has_options: false,
        supports_ai: false,
        is_manual_only: false,
        default_max_score: 1,
        description: "Question type metadata is not fully configured yet.",
      };
  }
}

export async function getMockQuestionDetail(id: string): Promise<QuestionDetailData> {
  "use cache";
  try {
    const questionRes = await apiClient.get<any>(`/questions/${id}`);
    const q = questionRes;

    const type = getQuestionTypeMeta(q.type);
    
    // Map answer options from backend (if any)
    const options = Array.isArray(q.options) ? q.options.map((opt: any, idx: number) => ({
      id: opt.id || String(idx),
      question_id: id,
      option_text: opt.text || opt.option_text || "",
      is_correct: opt.isCorrect || false,
      option_order: idx + 1
    })) : [];

    // Construct the standard UI correctAnswer shape based on question type
    let correctAnswerConfig: any = { type: "short", expected_keywords: [] };
    if (q.type === "MCQ") {
      correctAnswerConfig = { type: "single", correct_option_ids: q.correctAnswer?.optionIds || [] };
    } else if (q.type === "Multiple Choice") {
      correctAnswerConfig = { type: "multiple", correct_option_ids: q.correctAnswer?.optionIds || [] };
    } else if (q.type === "True/False") {
      correctAnswerConfig = { type: "boolean", value: q.correctAnswer?.value };
    } else if (q.type === "Matching") {
      correctAnswerConfig = { type: "matching", pairs: q.correctAnswer?.pairs || [] };
    } else if (q.type === "Fill-in-blank") {
      correctAnswerConfig = { type: "fill", answers: q.correctAnswer?.answers || [] };
    } else if (q.type === "Ranking") {
      correctAnswerConfig = { type: "ordering", correct_order: q.correctAnswer?.order || [] };
    } else if (q.type === "Long Essay") {
      correctAnswerConfig = { type: "essay", value: null };
    }

    return {
      id: q.id,
      bank_id: q.bankId || null,
      type_id: type.id,
      question_text: q.questionText,
      language: "EN",
      difficulty: q.difficulty || "Medium",
      points: q.points || 5,
      tags: [],
      settings: q.settings || {},
      correct_answer: correctAnswerConfig,
      created_at: q.createdAt || new Date().toISOString(),
      bank: null,
      type,
      topics: [],
      answer_options: options,
      ai_grading_config: null,
      stats: {
        createdBy: "Admin User",
        usedInAssessments: 0,
        totalAttempts: 0,
        averageScore: 0,
        correctAnswers: 0,
      },
    };
  } catch (err) {
    console.error("Failed to fetch mock question detail", err);
    throw err;
  }
}


function mapCatalogTypeToEditorType(typeName: QuestionCatalogItem["type"]): QuestionFormType {
  switch (typeName) {
    case "MCQ":
      return "Single Choice";
    case "Multiple Choice":
      return "Multiple Choices";
    case "True/False":
      return "True/False";
    case "Short Answer":
      return "Short Answer";
    case "Long Essay":
      return "Essay";
    case "Rating":
      return "Rating Scale";
    case "Ranking":
      return "Ordering";
    case "Fill-in-blank":
      return "Fill in the Blank";
    case "File Upload":
      return "File Upload";
    case "Matching":
      return "Matching";
    default:
      return "Short Answer";
  }
}

function mapQuestionDetailToEditorFormData(question: QuestionDetailData): QuestionFormData {
  const optionIndexById = new Map(
    question.answer_options.map((option, index) => [option.id, index]),
  );
  const correctOptionIds = Array.isArray(question.correct_answer.correct_option_ids)
    ? question.correct_answer.correct_option_ids.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  const correctAnswers = correctOptionIds
    .map((optionId) => optionIndexById.get(optionId))
    .filter((value): value is number => value !== undefined);
  const matchingPairs = Array.isArray(question.correct_answer.pairs)
    ? question.correct_answer.pairs
        .filter(
          (pair): pair is { left: string; right: string } =>
            typeof pair === "object" &&
            pair !== null &&
            typeof pair.left === "string" &&
            typeof pair.right === "string",
        )
    : [];
  const fillInBlankAnswers = Array.isArray(question.correct_answer.answers)
    ? question.correct_answer.answers.filter(
        (answer): answer is string => typeof answer === "string",
      )
    : [];
  const shortAnswerKeywords = Array.isArray(question.correct_answer.expected_keywords)
    ? question.correct_answer.expected_keywords.filter(
        (keyword): keyword is string => typeof keyword === "string",
      )
    : [];
  const orderSeed = Array.isArray(question.correct_answer.correct_order)
    ? question.correct_answer.correct_order.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const allowedTypes =
    typeof question.settings.allowedTypes === "string"
      ? question.settings.allowedTypes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : ["pdf"];

  const questionType = mapCatalogTypeToEditorType(question.type.name as QuestionCatalogItem["type"]);
  const formData: QuestionFormData = {
    questionText: question.question_text,
    questionType,
    bank: question.bank?.id ?? "",
    ownerTopicId: question.topics[0]?.id ?? "",
    topicIds: question.topics.map((topic) => topic.id),
    points: String(question.points),
    difficulty: question.difficulty,
    language: question.language === "KH" ? "Khmer (KH)" : "English (EN)",
    tags: question.tags.join(", "),
    explanation: question.ai_grading_config?.instruction ?? "",
    mediaUrl: "",
    options:
      question.answer_options.length > 0
        ? question.answer_options.map((option) => option.option_text)
        : ["", "", "", ""],
    correctAnswers: correctAnswers.length > 0 ? correctAnswers : [0],
    trueFalseAnswer: question.correct_answer.value === false ? false : true,
    shortAnswerKeywords: shortAnswerKeywords.length > 0 ? shortAnswerKeywords : [""],
    fillInBlankText:
      question.type.name === "Fill-in-blank"
        ? `${question.question_text} _____`
        : "",
    fillInBlankAnswers: fillInBlankAnswers.length > 0 ? fillInBlankAnswers : [""],
    matchingPairs:
      matchingPairs.length > 0
        ? matchingPairs
        : [
            { left: "", right: "" },
            { left: "", right: "" },
            { left: "", right: "" },
          ],
    orderItems:
      orderSeed.length > 0
        ? orderSeed.map((item, index) => `Step ${index + 1} (${item})`)
        : ["", "", ""],
    ratingScale:
      typeof question.correct_answer.scale === "number" ? question.correct_answer.scale : 5,
    ratingLabels: {
      min:
        typeof question.settings.minLabel === "string"
          ? question.settings.minLabel
          : "Poor",
      max:
        typeof question.settings.maxLabel === "string"
          ? question.settings.maxLabel
          : "Excellent",
    },
    fileUploadTypes: allowedTypes.length > 0 ? allowedTypes : ["pdf"],
    fileUploadMaxSize:
      typeof question.settings.maxSizeMb === "number" ? question.settings.maxSizeMb : 10,
    fileUploadMaxFiles:
      typeof question.settings.maxFiles === "number" ? question.settings.maxFiles : 1,
    fileUploadInstructions:
      question.type.name === "File Upload"
        ? question.ai_grading_config?.instruction ?? "Upload your response file."
        : "",
    aiScoring: question.type.supports_ai,
    aiGradingMode: inferAiGradingMode(questionType, question.ai_grading_config?.instruction),
    manualModeration: question.type.is_manual_only,
    rubric: question.ai_grading_config?.instruction ?? "",
  };

  return syncAiGradingFormState(formData);
}
export async function getMockQuestionEditPageData(id: string): Promise<{
  banks: Bank[];
  topics: Topic[];
  formData: QuestionFormData;
}> {
  "use cache";

  const question = await getMockQuestionDetail(id);
  const [banks, topics] = await Promise.all([
    getMockBanks(),
    getMockTopics(),
  ]);

  return {
    banks,
    topics,
    formData: mapQuestionDetailToEditorFormData(question),
  };
}





