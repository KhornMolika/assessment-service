"use server";

import { fetchWithAuth } from "./fetch-utils";

export type CreateQuestionPayload = 
  | {
      type: "SINGLE_CHOICE";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: { id: string; text: string }[];
      correctAnswers: { optionId: string };
    }
  | {
      type: "MULTIPLE_CHOICE";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: { id: string; text: string }[];
      correctAnswers: { optionIds: string[] };
    }
  | {
      type: "TRUE_FALSE";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: { trueLabel: string; falseLabel: string };
      correctAnswers: { value: boolean };
    }
  | {
      type: "ORDERING";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: { id: string; text: string }[];
      correctAnswers: { sequence: string[] };
    }
  | {
      type: "FILL_IN_THE_BLANK";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: { template: string };
      correctAnswers: { answers: string[][] };
    }
  | {
      type: "MATCHING";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: {
        leftSide: { id: string; text: string }[];
        rightSide: { id: string; text: string }[];
      };
      correctAnswers: { pairs: { leftId: string; rightId: string }[] };
    }
  | {
      type: "RATING";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: {
        min: number;
        max: number;
        lowLabel: string;
        highLabel: string;
      };
    }
  | {
      type: "SHORT_ANSWER";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: { minWords: number; maxWords: number };
      correctAnswers: {
        modelAnswerReference: string;
        keyPointsExpected: string[];
      };
    }
  | {
      type: "ESSAY";
      questionText: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      points: number;
      options: { minWords: number; maxWords: number };
      correctAnswers: {
        modelAnswerReference: string;
        keyPointsExpected: string[];
      };
    };

export interface Question {
  id: string;
  type: string;
  questionText: string;
  difficulty: string;
  points: number;
  options: any;
  correctAnswers: any;
}

export async function createQuestion(topicId: string, payload: CreateQuestionPayload): Promise<Question> {
  const data = await fetchWithAuth(`/topics/${topicId}/questions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function updateQuestion(id: string, payload: Partial<Omit<CreateQuestionPayload, 'type'>>): Promise<Question> {
  const data = await fetchWithAuth(`/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await fetchWithAuth(`/questions/${id}`, {
    method: "DELETE",
  });
}

export async function fetchTopicQuestions(topicId: string): Promise<Question[]> {
  const data = await fetchWithAuth(`/topics/${topicId}/questions?page=1&limit=100`);
  return Array.isArray(data.data) ? data.data : data;
}

export async function fetchGlobalQuestions(): Promise<Question[]> {
  const data = await fetchWithAuth(`/questions?page=1&limit=100`);
  return Array.isArray(data.data) ? data.data : data;
}
