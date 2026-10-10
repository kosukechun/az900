import { db, type DojoDB } from "../db/database";
import type { Attempt, Question, Session } from "../types";
import { isCorrect, rebuildProgress } from "../utils/study";
import { canUseQuestionVersion } from "../utils/questionVersion";
export async function savePracticeAnswer(
  session: Session,
  q: Question,
  selected: string[],
  durationMs: number,
  database: DojoDB = db,
) {
  const a: Attempt = {
    id: `${session.id}:${q.id}`,
    questionId: q.id,
    questionVersion: q.version,
    answeredAt: Date.now(),
    selectedOptionIds: selected,
    isCorrect: isCorrect(selected, q.correctOptionIds),
    durationMs,
    mode: session.mode,
    sessionId: session.id,
  };
  await database.transaction(
    "rw",
    [
      database.answerAttempts,
      database.questionProgress,
      database.studySessions,
    ],
    async () => {
      if (await database.answerAttempts.get(a.id)) return;
      const history = await database.answerAttempts
        .where("questionId")
        .equals(q.id)
        .toArray();
      a.answeredAt = history.reduce(
        (time, previous) => Math.max(time, previous.answeredAt + 1),
        a.answeredAt,
      );
      await database.answerAttempts.add(a);
      history.push(a);
      await database.questionProgress.put(rebuildProgress(history)[0]);
      const persisted =
        (await database.studySessions.get(session.id)) ?? session;
      await database.studySessions.put({
        ...persisted,
        questionVersions: { ...persisted.questionVersions, [q.id]: q.version },
        answers: { ...persisted.answers, [q.id]: selected },
        durations: { ...persisted.durations, [q.id]: durationMs },
        updatedAt: Date.now(),
      });
    },
  );
  return a;
}
export async function gradeMock(
  session: Session,
  questions: Question[],
  database: DojoDB = db,
) {
  await database.transaction(
    "rw",
    [
      database.answerAttempts,
      database.questionProgress,
      database.studySessions,
    ],
    async () => {
      const old = await database.studySessions.get(session.id);
      if (old?.status === "completed") return;
      const now = Date.now();
      for (const id of session.questionIds) {
        const q = questions.find((q) => q.id === id);
        if (!q) throw new Error("模擬試験の問題データが見つかりません。");
        if (!canUseQuestionVersion(q, session.questionVersions[id]))
          throw new Error("問題が更新されたため、この試験は採点できません。");
        const selected = session.answers[id] ?? [];
        const history = await database.answerAttempts
          .where("questionId")
          .equals(id)
          .toArray();
        const a: Attempt = {
          id: `${session.id}:${id}`,
          questionId: id,
          questionVersion: session.questionVersions[id] ?? q.version,
          answeredAt: history.reduce(
            (time, previous) => Math.max(time, previous.answeredAt + 1),
            now,
          ),
          selectedOptionIds: selected,
          isCorrect: isCorrect(selected, q.correctOptionIds),
          durationMs: session.durations[id] ?? 0,
          mode: "mock",
          sessionId: session.id,
        };
        if (!(await database.answerAttempts.get(a.id)))
          await database.answerAttempts.add(a);
        await database.questionProgress.put(
          rebuildProgress(
            await database.answerAttempts
              .where("questionId")
              .equals(id)
              .toArray(),
          )[0],
        );
      }
      await database.studySessions.put({
        ...session,
        status: "completed",
        completedAt: now,
        elapsedMs: Math.max(
          0,
          (session.timeLimitMs ?? 0) -
            (session.pausedRemainingMs ??
              Math.max(0, (session.deadline ?? now) - now)),
        ),
        updatedAt: now,
        deadline: undefined,
        pausedRemainingMs: undefined,
      });
    },
  );
}
