import type { Question, Session, Attempt } from "../types";
export const question: Question = {
  id: "Q001",
  version: 1,
  domain: "cloud",
  subcategory: "サービスモデル",
  difficulty: "basic",
  questionType: "single",
  questionText: "OSを利用者が管理するサービスモデルは？",
  options: [
    { id: "A", text: "IaaS" },
    { id: "B", text: "PaaS" },
    { id: "C", text: "SaaS" },
    { id: "D", text: "全部同じ" },
  ],
  correctOptionIds: ["A"],
  explanation: "IaaSではゲストOSを利用者が管理します。",
  optionExplanations: {
    A: "OS管理責任が残る",
    B: "OSは事業者が管理する",
    C: "アプリも事業者が管理する",
    D: "責任範囲は異なる",
  },
  keyPoint: "物理基盤は事業者、ゲストOSは利用者。",
  relatedTermIds: [],
  referenceUrls: [
    "https://learn.microsoft.com/ja-jp/azure/security/fundamentals/shared-responsibility",
  ],
  originType: "original",
  license: "CC-BY-4.0",
  lastVerifiedAt: "2026-10-10",
};
export const session = (
  id: string = crypto.randomUUID(),
  mode: Session["mode"] = "random",
): Session => ({
  id,
  mode,
  questionIds: [question.id],
  questionVersions: { [question.id]: 1 },
  index: 0,
  startedAt: Date.now(),
  updatedAt: Date.now(),
  answers: {},
  durations: {},
  flags: [],
  status: "active",
});
export const attempt = (
  sid: string,
  correct: boolean,
  time: number,
): Attempt => ({
  id: `${sid}:Q001`,
  questionId: "Q001",
  questionVersion: 1,
  answeredAt: time,
  selectedOptionIds: [correct ? "A" : "B"],
  isCorrect: correct,
  durationMs: 500,
  mode: "random",
  sessionId: sid,
});
