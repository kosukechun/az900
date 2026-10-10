import type { Question } from "../types";
/** An explicitly reviewed older version is usable only while its answer key stays unchanged. */
export const questionAnswerKey = (q: Question) =>
  JSON.stringify({
    type: q.questionType,
    options: q.options.map((o) => [o.id, o.text]),
    correct: [...q.correctOptionIds].sort(),
  });
export function canUseQuestionVersion(q: Question, version: number) {
  return (
    q.version === version ||
    !!(
      q.answerCompatibleVersions?.includes(version) &&
      q.compatibilityAnswerKey === questionAnswerKey(q)
    )
  );
}
