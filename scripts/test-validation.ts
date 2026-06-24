import { assessmentFormSchema } from "../src/schemas/assessment-form.schema";

const formData = {
  name: "ljlkn (Copy)",
  type: "practice",
  description: "",
  ownerTopicId: "TEMP_TOPIC",
  status: "DRAFT",
  participantIdentity: "EXTERNAL",
  sessionMode: "SELF_PACED",
  questionSelection: "MANUAL",
  selectedBankId: "",
  selectedQuestionIds: [],
  totalQuestions: 0,
  selectionRules: [],
  enableTimeLimit: false,
  timeLimitMinutes: 60,
  startsAt: "",
  endsAt: "",
  passMark: 70,
  shuffleQuestions: false,
  gradeLabels: [
    { grade: "A", minPercent: 90 },
    { grade: "B", minPercent: 80 },
    { grade: "C", minPercent: 70 },
    { grade: "D", minPercent: 60 },
    { grade: "E", minPercent: 50 },
    { grade: "F", minPercent: 0 },
  ],
  showResults: "IMMEDIATELY",
};

const stepValidationFields: Record<1 | 2 | 3, string[]> = {
  1: ["name"],
  2: [
    "sessionMode",
    "questionSelection",
    "participantIdentity",
    "timeLimitMinutes",
    "startsAt",
    "endsAt",
    "passMark",
    "gradeLabels",
    "showResults",
  ],
  3: [
    "selectedBankId",
    "selectedQuestionIds",
    "totalQuestions",
    "selectionRules",
  ],
};

const getStepValidationMessages = (step: 1 | 2 | 3) => {
  const validationResult = assessmentFormSchema.safeParse(formData);

  if (validationResult.success) {
    return [];
  }

  const allowedFields = stepValidationFields[step];

  return Array.from(
    new Set(
      validationResult.error.issues
        .filter((issue) => allowedFields.includes(String(issue.path[0] ?? "")))
        .map((issue) => issue.message)
    )
  );
};

console.log("Step 1 messages:", getStepValidationMessages(1));
console.log("Step 2 messages:", getStepValidationMessages(2));
console.log("Step 3 messages:", getStepValidationMessages(3));
