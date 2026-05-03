import type {
  Bank,
  BankTopicMap,
  QuestionCatalogItem,
  QuestionCatalogPageData,
  QuestionTopicMap,
  Topic,
} from "../types";
import type { QuestionFormData, QuestionFormType } from "../types/question-form.types";
import mockData from "./mock-data.json";
import { duplicateQuestionIdPattern } from "../utils/question-duplicate-id";
import { inferAiGradingMode, syncAiGradingFormState } from "../utils/question-ai-grading";

const mockTopics = mockData.topics as Topic[];
const mockBanks = mockData.banks as Bank[];
const mockQuestions = mockData.questions as QuestionCatalogItem[];
const mockBankTopics = mockData.bankTopics as BankTopicMap[];
const mockQuestionTopics = mockData.questionTopics as QuestionTopicMap[];

export async function getMockBanks(): Promise<Bank[]> {
  "use cache";

  return mockBanks;
}

export async function getMockBankById(id: string): Promise<Bank | undefined> {
  "use cache";

  return mockBanks.find((bank) => bank.id === id);
}

export async function getMockQuestions(): Promise<QuestionCatalogItem[]> {
  "use cache";

  return mockQuestions;
}

export async function getMockTopics(): Promise<Topic[]> {
  "use cache";

  return mockTopics;
}

export async function getMockBankTopics(): Promise<BankTopicMap[]> {
  "use cache";

  return mockBankTopics;
}

export async function getMockQuestionTopics(): Promise<QuestionTopicMap[]> {
  "use cache";

  return mockQuestionTopics;
}

export async function getMockBankDetailPageData(id: string): Promise<{
  bank: Bank | undefined;
  bankQuestions: QuestionCatalogItem[];
}> {
  "use cache";

  const bank = mockBanks.find((item) => item.id === id);
  const bankQuestions = mockQuestions.filter(
    (question) => question.bank_id != null && question.bank_id === id,
  );

  return {
    bank,
    bankQuestions,
  };
}

export async function getQuestionCatalogPageData(): Promise<QuestionCatalogPageData> {
  "use cache";

  return {
    banks: mockBanks,
    questions: mockQuestions,
  };
}

import type { QuestionDetailData } from "../types/question-detail.types";

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

  const duplicateMatch = id.match(duplicateQuestionIdPattern);
  const sourceId = duplicateMatch?.[1] ?? id;
  const sourceQuestion = mockQuestions.find((item) => item.id === sourceId) ?? mockQuestions[0];
  const question =
    duplicateMatch == null
      ? sourceQuestion
      : {
          ...sourceQuestion,
          id,
          text: `${sourceQuestion.text} (Copy)`,
        };
  const bank = question.bank_id
    ? (mockBanks.find((item) => item.id === question.bank_id) ?? null)
    : null;
  const type = getQuestionTypeMeta(question.type);
  const mappedTopicIds = mockQuestionTopics
    .filter((mapping) => mapping.question_id === sourceQuestion.id)
    .map((mapping) => mapping.topic_id);
  const mappedTopics = mockTopics.filter((topic) => mappedTopicIds.includes(topic.id));

  const defaultOptions =
    question.type === "MCQ"
      ? [
          { id: "a", question_id: question.id, option_text: "Nucleophilic addition followed by elimination", is_correct: true, option_order: 1 },
          { id: "b", question_id: question.id, option_text: "Electrophilic substitution mechanism", is_correct: false, option_order: 2 },
          { id: "c", question_id: question.id, option_text: "Radical chain reaction", is_correct: false, option_order: 3 },
          { id: "d", question_id: question.id, option_text: "Concerted pericyclic reaction", is_correct: false, option_order: 4 },
        ]
      : question.type === "Multiple Choice"
        ? [
            { id: "a", question_id: question.id, option_text: "Lower bounce rate", is_correct: true, option_order: 1 },
            { id: "b", question_id: question.id, option_text: "Higher click-through rate", is_correct: true, option_order: 2 },
            { id: "c", question_id: question.id, option_text: "Random session timeout", is_correct: false, option_order: 3 },
            { id: "d", question_id: question.id, option_text: "Improved conversion path clarity", is_correct: true, option_order: 4 },
          ]
        : question.type === "True/False"
          ? [
              { id: "true", question_id: question.id, option_text: "True", is_correct: true, option_order: 1 },
              { id: "false", question_id: question.id, option_text: "False", is_correct: false, option_order: 2 },
            ]
          : [];

  const defaultCorrectAnswer =
    question.type === "MCQ"
      ? { type: "single", correct_option_ids: ["a"] }
      : question.type === "Multiple Choice"
        ? { type: "multiple", correct_option_ids: ["a", "b", "d"] }
        : question.type === "True/False"
          ? { type: "boolean", value: true }
          : question.type === "Matching"
            ? {
                type: "matching",
                pairs: [
                  { left: "Ionic", right: "Sodium chloride" },
                  { left: "Covalent", right: "Water molecule" },
                  { left: "Metallic", right: "Copper wire" },
                ],
              }
            : question.type === "Fill-in-blank"
              ? { type: "fill", answers: ["velocity"] }
              : question.type === "Ranking"
                ? { type: "ordering", correct_order: ["1", "2", "3", "4"] }
                : question.type === "Long Essay"
                  ? { type: "essay", value: null }
                  : { type: "short", expected_keywords: ["concept", "example"] };

  const defaultSettings: Record<string, boolean | number | string> =
    question.type === "MCQ" || question.type === "Multiple Choice"
      ? {
          allowPartialCredit: question.type === "Multiple Choice",
          randomizeOptions: true,
          caseSensitive: false,
        }
      : question.type === "Matching"
        ? {
            shuffleRightColumn: true,
            requireUniqueMatches: true,
            pairCount: 3,
          }
        : question.type === "File Upload"
          ? {
              maxSizeMb: 10,
              maxFiles: 1,
              allowedTypes: "pdf, docx, png",
            }
          : {
              caseSensitive: false,
              autoGrade: !type.supports_ai,
              timeSuggestedMinutes: 3,
            };

  return {
    id: question.id,
    bank_id: bank?.id ?? null,
    type_id: type.id,
    question_text: question.text,
    language: question.language,
    difficulty: question.difficulty,
    points: question.points,
    tags: question.tags,
    settings: defaultSettings,
    correct_answer: defaultCorrectAnswer,
    created_at: "2026-02-15T10:00:00Z",
    bank: bank
      ? {
          id: bank.id,
          name: bank.name,
          owner_id: "owner-1",
        }
      : null,
    type,
    topics: mappedTopics.map((topic) => ({ id: topic.id, name: topic.name })),
    answer_options: defaultOptions,
    ai_grading_config: type.supports_ai
      ? {
          mode: type.is_manual_only ? "MANUAL_AI" : "AI_ASSISTED",
          max_score: question.points,
          instruction: "Evaluate clarity, correctness, completeness, and alignment with the expected learning outcome.",
        }
      : null,
    stats: {
      createdBy: "Dr. Sarah Johnson",
      usedInAssessments: 12,
      totalAttempts: 345,
      averageScore: 78,
      correctAnswers: 269,
    },
  };
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

  return {
    banks: mockBanks,
    topics: mockTopics,
    formData: mapQuestionDetailToEditorFormData(question),
  };
}





