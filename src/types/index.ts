export type Domain = "cloud" | "services" | "management";
export interface Category {
  id: Domain;
  name: string;
  weight: number;
  subcategories: string[];
}
export interface Question {
  id: string;
  version: number;
  answerCompatibleVersions?: number[];
  compatibilityAnswerKey?: string;
  domain: Domain;
  subcategory: string;
  difficulty: string;
  questionType: "single" | "multiple";
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  explanation: string;
  optionExplanations: Record<string, string>;
  keyPoint: string;
  relatedTermIds: string[];
  referenceUrls: string[];
  originType: string;
  license: string;
  lastVerifiedAt: string;
}
export interface Term {
  id: string;
  japaneseName: string;
  englishName: string;
  abbreviation: string;
  category: Domain;
  summary: string;
  description: string;
  example: string;
  keyPoint: string;
  relatedTermIds: string[];
  officialUrl: string;
  lastVerifiedAt: string;
  examScope?: "core" | "supplementary";
}
export type Mode =
  | "random"
  | "domain"
  | "unanswered"
  | "ever-wrong"
  | "unresolved"
  | "bookmarks"
  | "weak"
  | "daily"
  | "mock"
  | "individual";
export interface Attempt {
  id: string;
  questionId: string;
  questionVersion: number;
  answeredAt: number;
  selectedOptionIds: string[];
  isCorrect: boolean;
  durationMs: number;
  mode: Mode;
  sessionId: string;
}
export interface Progress {
  questionId: string;
  attempts: number;
  wrongCount: number;
  isUnresolved: boolean;
  lastAnsweredAt: number;
  lastWrongAt?: number;
  lastIsCorrect: boolean;
}
export interface Session {
  id: string;
  mode: Mode;
  questionIds: string[];
  questionVersions: Record<string, number>;
  index: number;
  startedAt: number;
  updatedAt: number;
  completedAt?: number;
  elapsedMs?: number;
  answers: Record<string, string[]>;
  durations: Record<string, number>;
  flags: string[];
  status: "active" | "completed";
  timeLimitMs?: number;
  deadline?: number;
  pausedRemainingMs?: number;
  notice?: string;
}
export interface Bookmark {
  id: string;
  createdAt: number;
}
export interface Settings {
  id: "preferences";
  theme: "light" | "dark" | "system";
  questionCount: number;
  autoAdvance: boolean;
  autoAdvanceSeconds: number;
}
export interface Goal {
  id: "daily";
  count: number;
}
export const defaultSettings: Settings = {
  id: "preferences",
  theme: "system",
  questionCount: 10,
  autoAdvance: false,
  autoAdvanceSeconds: 5,
};
