import { it, expect } from "vitest";
import { question } from "./factories";
import {
  canUseQuestionVersion,
  questionAnswerKey,
} from "../utils/questionVersion";
it("明示的に検証した旧版だけを使い、正答・選択肢・形式の変更時は拒否", () => {
  const revised = {
    ...question,
    version: 2,
    answerCompatibleVersions: [1],
    compatibilityAnswerKey: questionAnswerKey(question),
  };
  expect(canUseQuestionVersion(revised, 1)).toBe(true);
  expect(canUseQuestionVersion(revised, 2)).toBe(true);
  expect(canUseQuestionVersion(revised, 99)).toBe(false);
  expect(
    canUseQuestionVersion({ ...revised, correctOptionIds: ["B"] }, 1),
  ).toBe(false);
  expect(
    canUseQuestionVersion(
      {
        ...revised,
        options: revised.options.map((o) =>
          o.id === "A" ? { ...o, text: "別の選択肢" } : o,
        ),
      },
      1,
    ),
  ).toBe(false);
  expect(
    canUseQuestionVersion({ ...revised, questionType: "multiple" }, 1),
  ).toBe(false);
  expect(canUseQuestionVersion({ ...question, version: 2 }, 1)).toBe(false);
});
