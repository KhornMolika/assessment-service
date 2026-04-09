import type { Bank, QuestionCatalogItem, QuestionCatalogPageData } from "../types";
import type { QuestionFormData, QuestionFormType } from "../types/question-form.types";
import { inferAiGradingMode, syncAiGradingFormState } from "../utils/question-ai-grading";
const mockBanks: Bank[] = [
  {
    id: "bank-math-grade-10",
    name: "Mathematics - Grade 10",
    description: "Core algebra, geometry, and introductory statistics for grade 10.",
    subject: "Mathematics",
    language: "EN",
    question_count: 24,
    created_at: "2026-03-10T08:00:00Z",
    updated_at: "2026-04-08T09:30:00Z",
  },
  {
    id: "bank-chem-bonding",
    name: "Chemistry - Bonding",
    description: "Chemical bonding concepts, valence rules, and molecular structure.",
    subject: "Chemistry",
    language: "EN",
    question_count: 18,
    created_at: "2026-03-11T08:00:00Z",
    updated_at: "2026-04-07T10:15:00Z",
  },
  {
    id: "bank-biology-botany",
    name: "9-Biology/Botany",
    description: "Plant systems, photosynthesis, and classification topics.",
    subject: "Biology",
    language: "EN",
    question_count: 11,
    created_at: "2026-03-12T08:00:00Z",
    updated_at: "2026-04-06T11:00:00Z",
  },
  {
    id: "bank-khmer-stem",
    name: "History",
    description: "Khmer-language mixed STEM assessment content.",
    subject: "STEM",
    language: "KH",
    question_count: 8,
    created_at: "2026-03-15T08:00:00Z",
    updated_at: "2026-04-05T13:20:00Z",
  },
  {
    id: "bank-hr-onboarding",
    name: "HR Onboarding Feedback",
    description: "Feedback and pulse checks for onboarding experience.",
    subject: "Human Resources",
    language: "EN",
    question_count: 9,
    created_at: "2026-03-18T08:00:00Z",
    updated_at: "2026-04-04T09:00:00Z",
  },
  {
    id: "bank-it-security",
    name: "IT Security Awareness",
    description: "Security hygiene, phishing, and workplace device handling.",
    subject: "Information Technology",
    language: "EN",
    question_count: 16,
    created_at: "2026-03-20T08:00:00Z",
    updated_at: "2026-04-07T15:30:00Z",
  },
  {
    id: "bank-physics-motion",
    name: "Physics - Forces & Motion",
    description: "Newtonian motion, force calculations, and real-world applications.",
    subject: "Physics",
    language: "EN",
    question_count: 21,
    created_at: "2026-03-22T08:00:00Z",
    updated_at: "2026-04-08T14:00:00Z",
  },
  {
    id: "bank-digital-marketing",
    name: "Digital Marketing Fundamentals",
    description: "Channel strategy, campaign planning, and acquisition basics.",
    subject: "Marketing",
    language: "EN",
    question_count: 13,
    created_at: "2026-03-25T08:00:00Z",
    updated_at: "2026-04-08T16:10:00Z",
  },
];

const mockQuestions: QuestionCatalogItem[] = [
  {
    id: "q-001",
    bank_id: "bank-math-grade-10",
    text: "Describe the reaction mechanism for adding an F-base catalyze?",
    type: "MCQ",
    difficulty: "Medium",
    points: 2,
    language: "EN",
    tags: ["Equation"],
  },
  {
    id: "q-002",
    bank_id: "bank-chem-bonding",
    text: "Which of the following is an example of exothermic reaction? Select all that apply.",
    type: "Multiple Choice",
    difficulty: "Hard",
    points: 3,
    language: "EN",
    tags: [],
  },
  {
    id: "q-003",
    bank_id: "bank-biology-botany",
    text: "True or False: Photosynthesis always converts carbon dioxide into glucose in the presence of light.",
    type: "True/False",
    difficulty: "Easy",
    points: 1,
    language: "EN",
    tags: ["Botany"],
  },
  {
    id: "q-004",
    bank_id: "bank-khmer-stem",
    text: "Describe the main causes of the fall of the Roman Empire in C5.",
    type: "Long Essay",
    difficulty: "Hard",
    points: 10,
    language: "EN",
    tags: [],
  },
  {
    id: "q-005",
    bank_id: "bank-hr-onboarding",
    text: "What is your overall satisfaction with the onboarding process?",
    type: "Rating",
    difficulty: "Easy",
    points: 0,
    language: "EN",
    tags: [],
  },
  {
    id: "q-006",
    bank_id: "bank-it-security",
    text: "Rank the following parameters from highest to lowest risk in server access management.",
    type: "Ranking",
    difficulty: "Medium",
    points: 4,
    language: "EN",
    tags: [],
  },
  {
    id: "q-007",
    bank_id: "bank-physics-motion",
    text: "Remember ____ test items that the direction states and the instructions identify.",
    type: "Fill-in-blank",
    difficulty: "Easy",
    points: 3,
    language: "EN",
    tags: [],
  },
  {
    id: "q-008",
    bank_id: "bank-chem-bonding",
    text: "Upload a photo of your completed worksheet to confirm the bonding exercise submission.",
    type: "File Upload",
    difficulty: "Medium",
    points: 5,
    language: "EN",
    tags: [],
  },
  {
    id: "q-009",
    bank_id: "bank-math-grade-10",
    text: "List the difference between mean, median, and mode with examples.",
    type: "Short Answer",
    difficulty: "Medium",
    points: 3,
    language: "EN",
    tags: [],
  },
  {
    id: "q-010",
    bank_id: "bank-physics-motion",
    text: "Which of the following best exemplifies acceleration in rectilinear motion terms?",
    type: "Multiple Choice",
    difficulty: "Medium",
    points: 2,
    language: "EN",
    tags: [],
  },
  {
    id: "q-011",
    bank_id: "bank-physics-motion",
    text: "What is the solution configuration of Coulomb force in a two-body system?",
    type: "MCQ",
    difficulty: "Easy",
    points: 2,
    language: "EN",
    tags: [],
  },
  {
    id: "q-012",
    bank_id: "bank-digital-marketing",
    text: "Calculate the expected conversion lift of an object campaign with acceleration in reach.",
    type: "Short Answer",
    difficulty: "Medium",
    points: 5,
    language: "EN",
    tags: [],
  },
    {
    id: "q-013",
    bank_id: "bank-digital-marketing",
    text: "What marketing channels are most effective for lead generation in emerging markets?",
    type: "Multiple Choice",
    difficulty: "Medium",
    points: 4,
    language: "KH",
    tags: [],
  },
  {
    id: "q-014",
    bank_id: "bank-chem-bonding",
    text: "Match each bonding type with its most representative real-world example.",
    type: "Matching",
    difficulty: "Medium",
    points: 4,
    language: "EN",
    tags: ["Bonding"],
  },
  {
    id: "q-015",
    bank_id: "bank-math-grade-10",
    text: "Solve the quadratic equation x^2 - 7x + 12 = 0.",
    type: "Short Answer",
    difficulty: "Easy",
    points: 2,
    language: "EN",
    tags: ["Algebra"],
  },
  {
    id: "q-016",
    bank_id: "bank-math-grade-10",
    text: "Which graph best represents a linear function with a negative slope?",
    type: "MCQ",
    difficulty: "Medium",
    points: 2,
    language: "EN",
    tags: ["Graphs"],
  },
  {
    id: "q-017",
    bank_id: "bank-math-grade-10",
    text: "Match each statistical measure with the description that best defines it.",
    type: "Matching",
    difficulty: "Medium",
    points: 4,
    language: "EN",
    tags: ["Statistics"],
  },
  {
    id: "q-018",
    bank_id: "bank-math-grade-10",
    text: "Arrange these fractions from smallest to largest: 1/2, 3/4, 2/3, 5/6.",
    type: "Ranking",
    difficulty: "Medium",
    points: 3,
    language: "EN",
    tags: ["Fractions"],
  },
  {
    id: "q-019",
    bank_id: "bank-math-grade-10",
    text: "The sum of the interior angles of a triangle is always 180 degrees.",
    type: "True/False",
    difficulty: "Easy",
    points: 1,
    language: "EN",
    tags: ["Geometry"],
  },
  {
    id: "q-020",
    bank_id: "bank-chem-bonding",
    text: "Which particle is shared in a covalent bond?",
    type: "MCQ",
    difficulty: "Easy",
    points: 1,
    language: "EN",
    tags: ["Covalent"],
  },
  {
    id: "q-021",
    bank_id: "bank-chem-bonding",
    text: "Select all substances that primarily exhibit ionic bonding.",
    type: "Multiple Choice",
    difficulty: "Medium",
    points: 3,
    language: "EN",
    tags: ["Ionic"],
  },
  {
    id: "q-022",
    bank_id: "bank-chem-bonding",
    text: "Complete the sentence: A metallic bond forms because valence electrons are ____.",
    type: "Fill-in-blank",
    difficulty: "Medium",
    points: 2,
    language: "EN",
    tags: ["Metallic"],
  },
  {
    id: "q-023",
    bank_id: "bank-chem-bonding",
    text: "Explain why water is considered a polar molecule.",
    type: "Long Essay",
    difficulty: "Medium",
    points: 6,
    language: "EN",
    tags: ["Polarity"],
  },
  {
    id: "q-024",
    bank_id: "bank-chem-bonding",
    text: "Upload your Lewis structure worksheet for ammonia and methane.",
    type: "File Upload",
    difficulty: "Medium",
    points: 5,
    language: "EN",
    tags: ["Lewis Structure"],
  },
  {
    id: "q-025",
    bank_id: "bank-biology-botany",
    text: "Which plant tissue is primarily responsible for transporting water?",
    type: "MCQ",
    difficulty: "Easy",
    points: 1,
    language: "EN",
    tags: ["Plant Tissue"],
  },
  {
    id: "q-026",
    bank_id: "bank-biology-botany",
    text: "Select all structures that are part of a flower's reproductive system.",
    type: "Multiple Choice",
    difficulty: "Medium",
    points: 3,
    language: "EN",
    tags: ["Flowers"],
  },
  {
    id: "q-027",
    bank_id: "bank-biology-botany",
    text: "Photosynthesis occurs only in the roots of higher plants.",
    type: "True/False",
    difficulty: "Easy",
    points: 1,
    language: "EN",
    tags: ["Photosynthesis"],
  },
  {
    id: "q-028",
    bank_id: "bank-biology-botany",
    text: "Match each plant adaptation with the environment where it is most useful.",
    type: "Matching",
    difficulty: "Medium",
    points: 4,
    language: "EN",
    tags: ["Adaptation"],
  },
  {
    id: "q-029",
    bank_id: "bank-biology-botany",
    text: "Describe the role of stomata in plant survival.",
    type: "Short Answer",
    difficulty: "Medium",
    points: 2,
    language: "EN",
    tags: ["Stomata"],
  },
  {
    id: "q-030",
    bank_id: "bank-khmer-stem",
    text: "????????????????????????????????",
    type: "MCQ",
    difficulty: "Easy",
    points: 1,
    language: "KH",
    tags: ["Physics"],
  },
  {
    id: "q-031",
    bank_id: "bank-khmer-stem",
    text: "??????????????????????????????????????????????????",
    type: "Multiple Choice",
    difficulty: "Medium",
    points: 3,
    language: "KH",
    tags: ["Astronomy"],
  },
  {
    id: "q-032",
    bank_id: "bank-khmer-stem",
    text: "???????????? ??????????? ____ ??????????????",
    type: "Fill-in-blank",
    difficulty: "Medium",
    points: 2,
    language: "KH",
    tags: ["Energy"],
  },
  {
    id: "q-033",
    bank_id: "bank-khmer-stem",
    text: "????????????????????????????????????????????????????????????",
    type: "Long Essay",
    difficulty: "Hard",
    points: 8,
    language: "KH",
    tags: ["Technology"],
  },
  {
    id: "q-034",
    bank_id: "bank-khmer-stem",
    text: "????????????????????????????????????????????????????????????????????",
    type: "Matching",
    difficulty: "Medium",
    points: 4,
    language: "KH",
    tags: ["Lab"],
  },
  {
    id: "q-035",
    bank_id: "bank-hr-onboarding",
    text: "Which onboarding step helped you feel most prepared for your role?",
    type: "Short Answer",
    difficulty: "Easy",
    points: 0,
    language: "EN",
    tags: ["Feedback"],
  },
  {
    id: "q-036",
    bank_id: "bank-hr-onboarding",
    text: "Rate the clarity of the first-week schedule you received.",
    type: "Rating",
    difficulty: "Easy",
    points: 0,
    language: "EN",
    tags: ["Schedule"],
  },
  {
    id: "q-037",
    bank_id: "bank-hr-onboarding",
    text: "Select all onboarding resources you actually used during your first week.",
    type: "Multiple Choice",
    difficulty: "Easy",
    points: 0,
    language: "EN",
    tags: ["Resources"],
  },
  {
    id: "q-038",
    bank_id: "bank-hr-onboarding",
    text: "Match each onboarding activity with the team that typically owns it.",
    type: "Matching",
    difficulty: "Medium",
    points: 2,
    language: "EN",
    tags: ["Ownership"],
  },
  {
    id: "q-039",
    bank_id: "bank-hr-onboarding",
    text: "The onboarding checklist was easy to understand and complete.",
    type: "True/False",
    difficulty: "Easy",
    points: 0,
    language: "EN",
    tags: ["Checklist"],
  },
  {
    id: "q-040",
    bank_id: "bank-it-security",
    text: "Which password practice is the most secure for workplace systems?",
    type: "MCQ",
    difficulty: "Easy",
    points: 2,
    language: "EN",
    tags: ["Passwords"],
  },
  {
    id: "q-041",
    bank_id: "bank-it-security",
    text: "Select all behaviors that may indicate a phishing attempt.",
    type: "Multiple Choice",
    difficulty: "Medium",
    points: 3,
    language: "EN",
    tags: ["Phishing"],
  },
  {
    id: "q-042",
    bank_id: "bank-it-security",
    text: "Place these incident response steps in the correct order after identifying a suspicious email.",
    type: "Ranking",
    difficulty: "Medium",
    points: 4,
    language: "EN",
    tags: ["Incident Response"],
  },
  {
    id: "q-043",
    bank_id: "bank-it-security",
    text: "Match each security threat with the most appropriate first response.",
    type: "Matching",
    difficulty: "Hard",
    points: 5,
    language: "EN",
    tags: ["Threats"],
  },
  {
    id: "q-044",
    bank_id: "bank-it-security",
    text: "Uploading a confidential file to a personal cloud drive is acceptable if it speeds up work.",
    type: "True/False",
    difficulty: "Easy",
    points: 1,
    language: "EN",
    tags: ["Data Handling"],
  },
  {
    id: "q-045",
    bank_id: "bank-physics-motion",
    text: "What is the SI unit of force?",
    type: "MCQ",
    difficulty: "Easy",
    points: 1,
    language: "EN",
    tags: ["Force"],
  },
  {
    id: "q-046",
    bank_id: "bank-physics-motion",
    text: "Select all quantities that are vectors.",
    type: "Multiple Choice",
    difficulty: "Medium",
    points: 3,
    language: "EN",
    tags: ["Vectors"],
  },
  {
    id: "q-047",
    bank_id: "bank-physics-motion",
    text: "Fill in the blank: Momentum equals mass multiplied by ____.",
    type: "Fill-in-blank",
    difficulty: "Easy",
    points: 1,
    language: "EN",
    tags: ["Momentum"],
  },
  {
    id: "q-048",
    bank_id: "bank-physics-motion",
    text: "Match each motion graph with the situation it best represents.",
    type: "Matching",
    difficulty: "Hard",
    points: 5,
    language: "EN",
    tags: ["Graphs"],
  },
  {
    id: "q-049",
    bank_id: "bank-physics-motion",
    text: "Explain how friction affects the distance required to stop a moving object.",
    type: "Long Essay",
    difficulty: "Medium",
    points: 6,
    language: "EN",
    tags: ["Friction"],
  },
  {
    id: "q-050",
    bank_id: "bank-digital-marketing",
    text: "Which metric best reflects how expensive it is to acquire a customer?",
    type: "MCQ",
    difficulty: "Easy",
    points: 2,
    language: "EN",
    tags: ["Metrics"],
  },
  {
    id: "q-051",
    bank_id: "bank-digital-marketing",
    text: "Select all channels that are typically classified as paid acquisition channels.",
    type: "Multiple Choice",
    difficulty: "Medium",
    points: 3,
    language: "EN",
    tags: ["Channels"],
  },
  {
    id: "q-052",
    bank_id: "bank-digital-marketing",
    text: "Rank these campaign metrics in order of funnel flow from awareness to conversion.",
    type: "Ranking",
    difficulty: "Medium",
    points: 4,
    language: "EN",
    tags: ["Funnel"],
  },
  {
    id: "q-053",
    bank_id: "bank-digital-marketing",
    text: "Match each marketing objective with the KPI that most directly measures success.",
    type: "Matching",
    difficulty: "Medium",
    points: 4,
    language: "EN",
    tags: ["KPI"],
  },
  {
    id: "q-054",
    bank_id: "bank-digital-marketing",
    text: "Upload a one-page campaign brief for a seasonal product launch.",
    type: "File Upload",
    difficulty: "Medium",
    points: 5,
    language: "EN",
    tags: ["Campaign Brief"],
  },
];

export async function getMockBanks(): Promise<Bank[]> {
  return mockBanks;
}

export async function getMockQuestions(): Promise<QuestionCatalogItem[]> {
  return mockQuestions;
}

export async function getQuestionCatalogPageData(): Promise<QuestionCatalogPageData> {
  return {
    banks: mockBanks,
    questions: mockQuestions,
  };
}

const duplicateQuestionIdPattern = /^(q-\d+)-copy(?:-(\d+))?$/;

export function createMockQuestionDuplicateId(id: string): string {
  const matchedDuplicate = id.match(duplicateQuestionIdPattern);

  if (matchedDuplicate) {
    const baseId = matchedDuplicate[1];
    const copyIndex = Number(matchedDuplicate[2] ?? "1") + 1;

    return `${baseId}-copy-${copyIndex}`;
  }

  return `${id}-copy`;
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
  const bank = mockBanks.find((item) => item.id === question.bank_id) ?? mockBanks[0];
  const type = getQuestionTypeMeta(question.type);

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
    bank_id: bank.id,
    type_id: type.id,
    question_text: question.text,
    language: question.language,
    difficulty: question.difficulty,
    points: question.points,
    tags: question.tags.length > 0 ? question.tags : [bank.subject],
    settings: defaultSettings,
    correct_answer: defaultCorrectAnswer,
    created_at: "2026-02-15T10:00:00Z",
    bank: {
      id: bank.id,
      name: bank.name,
      owner_id: "owner-1",
    },
    type,
    topics: [
      { id: `${bank.id}-topic-1`, name: bank.subject },
      { id: `${bank.id}-topic-2`, name: question.type },
    ],
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
    bank: question.bank.id,
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
  formData: QuestionFormData;
}> {
  const question = await getMockQuestionDetail(id);

  return {
    banks: mockBanks,
    formData: mapQuestionDetailToEditorFormData(question),
  };
}



