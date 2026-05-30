import type {
  AssessmentCatalogItem,
  AssessmentDetailQuestionItem,
} from "@/src/types";
import type { QuestionRendererValue } from "../renderers/types";
import type {
  LeaderboardEntry,
  RoomParticipant,
  QuestionOption,
  QuestionRound,
  ResultReleaseMode,
} from "./session.types";

export function normalizeQuestionRendererType(type: string) {
  const normalized = type.trim().toLowerCase();

  if (
    normalized.includes("single") ||
    normalized === "mcq" ||
    normalized.includes("multiple choice")
  ) {
    return "single";
  }

  if (normalized.includes("multiple")) {
    return "multiple";
  }

  if (normalized.includes("true/false") || normalized.includes("boolean")) {
    return "boolean";
  }

  if (normalized.includes("short")) {
    return "short";
  }

  if (normalized.includes("essay") || normalized.includes("long")) {
    return "essay";
  }

  if (normalized.includes("rating")) {
    return "rating";
  }

  if (normalized.includes("order")) {
    return "ordering";
  }

  if (normalized.includes("fill")) {
    return "fill";
  }

  if (normalized.includes("match")) {
    return "matching";
  }

  if (normalized.includes("file")) {
    return "file";
  }

  return "single";
}

export function formatStartDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getParticipantIdentityLabel(
  identity: AssessmentCatalogItem["participant_identity"],
) {
  if (identity === "ANONYMOUS") {
    return "Anonymous access";
  }

  if (identity === "INTERNAL") {
    return "Internal participant";
  }

  return "External display name";
}

export function requiresParticipantDisplayName(
  identity: AssessmentCatalogItem["participant_identity"],
) {
  return identity === "EXTERNAL";
}

export function getResultReleaseMode(showResults: string): ResultReleaseMode {
  const normalized = showResults.toLowerCase();

  if (normalized.includes("immediately")) {
    return "immediate";
  }

  if (normalized.includes("later") || normalized.includes("manual")) {
    return "manual";
  }

  return "hidden";
}

export function buildQuestionRounds(
  questions: AssessmentDetailQuestionItem[],
): QuestionRound[] {
  return questions.map((question, index) => {
    const optionLetters = ["A", "B", "C", "D"];
    const options = optionLetters.map((letter, optionIndex) => ({
      id: `${question.id}-option-${letter.toLowerCase()}`,
      label: letter,
      text: `${letter}. Candidate answer ${optionIndex + 1} for question ${index + 1}`,
    }));

    return {
      ...question,
      options,
      correctOptionId: options[index % options.length]?.id ?? options[0].id,
    };
  });
}

export function buildParticipantRoster(): RoomParticipant[] {
  return [
    { id: "p-1", name: "Sokha Ly", status: "READY" },
    { id: "p-2", name: "Dara Chen", status: "READY" },
    { id: "p-3", name: "Mina Park", status: "WAITING" },
    { id: "p-4", name: "Rith Kim", status: "READY" },
    { id: "p-5", name: "Nita Vong", status: "CONNECTED" },
    { id: "p-6", name: "Sophy Tan", status: "READY" },
  ];
}

export function buildLeaderboard() {
  return [
    { id: "lb-1", name: "Sokha Ly", score: 940, streak: 1, lastGain: 0, rank: 1, previousRank: 1 },
    { id: "lb-2", name: "Dara Chen", score: 870, streak: 0, lastGain: 0, rank: 2, previousRank: 2 },
    { id: "lb-3", name: "Mina Park", score: 820, streak: 2, lastGain: 0, rank: 3, previousRank: 3 },
    { id: "lb-4", name: "Rith Kim", score: 790, streak: 1, lastGain: 0, rank: 4, previousRank: 4 },
    { id: "lb-5", name: "Nita Vong", score: 740, streak: 0, lastGain: 0, rank: 5, previousRank: 5 },
    { id: "lb-6", name: "Sophy Tan", score: 710, streak: 1, lastGain: 0, rank: 6, previousRank: 6 },
  ];
}

export function resolveLeaderboardRound(
  leaderboard: LeaderboardEntry[],
  roundIndex: number,
): LeaderboardEntry[] {
  const updated = leaderboard.map((entry, index) => {
    const answeredCorrectly = ((index * 2 + roundIndex + 1) % 4) !== 0;
    const streak = answeredCorrectly ? entry.streak + 1 : 0;
    const streakBonus = streak >= 2 ? 35 + (streak - 2) * 15 : 0;
    const speedBonus = answeredCorrectly ? Math.max(15, 70 - index * 8 - roundIndex * 6) : 0;
    const lastGain = answeredCorrectly ? 100 + roundIndex * 20 + speedBonus + streakBonus : 0;

    return {
      ...entry,
      score: entry.score + lastGain,
      streak,
      lastGain,
      previousRank: entry.rank,
    };
  });

  return updated
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export function buildDistribution(
  options: QuestionOption[],
  answeredCount: number,
  correctOptionId: string,
) {
  const base = options.map((option, index) => {
    const weight = option.id === correctOptionId ? 0.38 : 0.18 + index * 0.06;
    return {
      optionId: option.id,
      count: Math.max(0, Math.round(answeredCount * weight)),
    };
  });

  const total = base.reduce((sum, item) => sum + item.count, 0);
  const remainder = Math.max(0, answeredCount - total);

  if (base[0]) {
    base[0].count += remainder;
  }

  return base;
}

export function formatDurationClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function hasAnswerResponse(value: QuestionRendererValue) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).some((item) => String(item).trim().length > 0);
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  return false;
}

export function isCorrectAnswerResponse(question: QuestionRound, value: QuestionRendererValue) {
  const rendererType = normalizeQuestionRendererType(question.type);

  if (rendererType === "ordering") {
    return (
      Array.isArray(value) &&
      value.length === question.options.length &&
      value.every((optionId, index) => optionId === question.options[index]?.id)
    );
  }

  if (rendererType === "matching") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }

    const midpoint = Math.ceil(question.options.length / 2);
    const leftOptions = question.options.slice(0, midpoint);
    const rightOptions = question.options.slice(midpoint);

    return leftOptions.every(
      (leftOption, index) => value[leftOption.id] === rightOptions[index]?.id,
    );
  }

  return typeof value === "string" && value === question.correctOptionId;
}

export function getAnswerResponseText(question: QuestionRound, value: QuestionRendererValue) {
  if (typeof value === "string") {
    const selectedOption = question.options.find((option) => option.id === value);
    return selectedOption ? `${selectedOption.label} ${selectedOption.text}` : value;
  }

  if (Array.isArray(value)) {
    return value
      .map((id) => question.options.find((option) => option.id === id)?.text ?? id)
      .join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (typeof value === "number") {
    return `${value}`;
  }

  if (typeof value === "object" && value !== null) {
    const rendererType = normalizeQuestionRendererType(question.type);

    if (rendererType === "matching") {
      const midpoint = Math.ceil(question.options.length / 2);
      const leftOptions = question.options.slice(0, midpoint);

      return leftOptions
        .map((leftOption) => {
          const rightId = value[leftOption.id];
          const rightOption = question.options.find((option) => option.id === rightId);
          return `${leftOption.text} -> ${rightOption?.text ?? "No match"}`;
        })
        .join(", ");
    }

    return Object.values(value).join(", ");
  }

  return "No answer";
}

export function buildPreviewAnswerValue(question: QuestionRound, index: number): QuestionRendererValue {
  const rendererType = normalizeQuestionRendererType(question.type);

  switch (rendererType) {
    case "multiple":
      return question.options.slice(0, 2).map((option) => option.id);
    case "boolean":
      return index % 2 === 0;
    case "short":
      return "Sample short response";
    case "essay":
      return "Sample long-form response describing the participant's thinking.";
    case "rating":
      return 4;
    case "ordering":
      return [...question.options].reverse().map((option) => option.id);
    case "fill":
      return { "0": "contact", "1": "24" };
    case "matching":
      return {
        [question.options[0]?.id ?? ""]: question.options[2]?.id ?? "",
        [question.options[1]?.id ?? ""]: question.options[3]?.id ?? "",
      };
    case "file":
      return "supporting-evidence.pdf";
    default:
      return question.options[index % question.options.length]?.id ?? null;
  }
}
