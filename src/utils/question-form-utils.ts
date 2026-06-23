import type { QuestionFormData, QuestionFormType } from "@/src/types/question-form.types";

export function getDefaultOptionsAndAnswers(type: QuestionFormType) {
  switch (type) {
    case "Single Choice":
      return {
        options: [{ id: "opt_1", text: "" }, { id: "opt_2", text: "" }],
        correctAnswers: { optionId: "opt_1" }
      };
    case "Multiple Choices":
      return {
        options: [{ id: "opt_1", text: "" }, { id: "opt_2", text: "" }],
        correctAnswers: { optionIds: ["opt_1"] }
      };
    case "True/False":
      return {
        options: { trueLabel: "True", falseLabel: "False" },
        correctAnswers: { value: true }
      };
    case "Short Answer":
    case "Essay":
      return {
        options: { minWords: 0, maxWords: 500 },
        correctAnswers: { keyPointsExpected: [""] }
      };
    case "Fill in the Blank":
      return {
        options: { template: "The capital of France is [blank_1]." },
        correctAnswers: { answers: [["Paris"]] }
      };
    case "Matching":
      return {
        options: {
          leftSide: [{ id: "l1", text: "" }, { id: "l2", text: "" }],
          rightSide: [{ id: "r1", text: "" }, { id: "r2", text: "" }]
        },
        correctAnswers: { pairs: [{ leftId: "l1", rightId: "r1" }, { leftId: "l2", rightId: "r2" }] }
      };
    case "Ordering":
      return {
        options: [{ id: "opt_1", text: "" }, { id: "opt_2", text: "" }],
        correctAnswers: { sequence: ["opt_1", "opt_2"] }
      };
    case "Rating Scale":
      return {
        options: { min: 1, max: 5, lowLabel: "Poor", highLabel: "Excellent" },
        correctAnswers: null
      };
    default:
      return { options: [], correctAnswers: null };
  }
}

export function mapToApiPayload(formData: QuestionFormData, removeType: boolean = false) {
  const typeMapping: Record<string, string> = {
    "Single Choice": "SINGLE_CHOICE",
    "Multiple Choices": "MULTIPLE_CHOICE",
    "True/False": "TRUE_FALSE",
    "Short Answer": "SHORT_ANSWER",
    "Essay": "ESSAY",
    "Fill in the Blank": "FILL_IN_THE_BLANK",
    "Matching": "MATCHING",
    "Ordering": "ORDERING",
    "Rating Scale": "RATING"
  };

  let payloadCorrectAnswers = formData.correctAnswers;

  if (formData.questionType === "Fill in the Blank" && payloadCorrectAnswers?.answers) {
    const cleanedAnswers = payloadCorrectAnswers.answers.map((group: string[]) => 
      group.map((s: string) => s.trim()).filter((s: string) => s !== "")
    );
    if (cleanedAnswers.some((group: string[]) => group.length === 0)) {
      throw new Error("Each blank must have at least one valid answer.");
    }
    payloadCorrectAnswers = { ...payloadCorrectAnswers, answers: cleanedAnswers };
  } else if ((formData.questionType === "Short Answer" || formData.questionType === "Essay") && payloadCorrectAnswers) {
    const cleanedKeywords = (payloadCorrectAnswers.keyPointsExpected || [])
      .map((k: string) => k.trim())
      .filter((k: string) => k !== "");
    if (!payloadCorrectAnswers.modelAnswerReference?.trim()) {
      throw new Error("A model answer reference is required for Short Answer and Essay questions.");
    }
    if (cleanedKeywords.length === 0) {
      throw new Error("At least one expected key point is required.");
    }
    payloadCorrectAnswers = { ...payloadCorrectAnswers, keyPointsExpected: cleanedKeywords };
  }

  const payload: any = {
    questionText: formData.questionText,
    difficulty: formData.difficulty.toUpperCase(),
    points: parseInt(formData.points, 10),
    options: formData.options,
    correctAnswers: payloadCorrectAnswers,
  };

  if (!removeType) {
    payload.type = typeMapping[formData.questionType] || "SINGLE_CHOICE";
  }

  return payload;
}
