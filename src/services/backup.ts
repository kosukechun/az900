import { z } from "zod";
import { db, type DojoDB } from "../db/database";
import { rebuildProgress } from "../utils/study";
const id = z.string().min(1).max(200),
  stamp = z.number().finite().nonnegative(),
  ids = z.array(id).max(10);
const modes = z.enum([
  "random",
  "domain",
  "unanswered",
  "ever-wrong",
  "unresolved",
  "bookmarks",
  "weak",
  "daily",
  "mock",
  "individual",
]);
const attempt = z
  .object({
    id,
    questionId: id,
    questionVersion: z.number().int().positive(),
    answeredAt: stamp,
    selectedOptionIds: ids,
    isCorrect: z.boolean(),
    durationMs: stamp,
    mode: modes,
    sessionId: id,
  })
  .strict();
const progress = z
  .object({
    questionId: id,
    attempts: z.number().int().nonnegative(),
    wrongCount: z.number().int().nonnegative(),
    isUnresolved: z.boolean(),
    lastAnsweredAt: stamp,
    lastWrongAt: stamp.optional(),
    lastIsCorrect: z.boolean(),
  })
  .strict();
const session = z
  .object({
    id,
    mode: modes,
    questionIds: z.array(id).max(10000),
    questionVersions: z.record(z.number().int().positive()),
    index: z.number().int().nonnegative(),
    startedAt: stamp,
    updatedAt: stamp,
    completedAt: stamp.optional(),
    elapsedMs: stamp.optional(),
    answers: z.record(ids),
    durations: z.record(stamp),
    flags: z.array(id),
    status: z.enum(["active", "completed"]),
    timeLimitMs: stamp.optional(),
    deadline: stamp.optional(),
    pausedRemainingMs: stamp.optional(),
    notice: z.string().max(1000).optional(),
  })
  .strict()
  .superRefine((s, c) => {
    if (
      !s.questionIds.length ||
      s.index >= s.questionIds.length ||
      new Set(s.questionIds).size !== s.questionIds.length
    )
      c.addIssue({
        code: "custom",
        message: "セッションの問題一覧または位置が不正です",
      });
    if (
      Object.keys(s.answers).some((id) => !s.questionIds.includes(id)) ||
      s.flags.some((id) => !s.questionIds.includes(id))
    )
      c.addIssue({ code: "custom", message: "セッションに含まれない問題です" });
  });
const bookmark = z.object({ id, createdAt: stamp }).strict();
const settings = z
  .object({
    id: z.literal("preferences"),
    theme: z.enum(["light", "dark", "system"]),
    questionCount: z.number().int().min(0).max(10000),
    autoAdvance: z.boolean(),
    autoAdvanceSeconds: z.number().int().min(2).max(60),
  })
  .strict();
export const backupSchema = z
  .object({
    format: z.literal("az900-dojo"),
    version: z.literal(1),
    createdAt: z.string().datetime(),
    answerAttempts: z.array(attempt).max(500000),
    questionProgress: z.array(progress).max(100000),
    studySessions: z.array(session).max(100000),
    bookmarks: z.array(bookmark),
    glossaryBookmarks: z.array(bookmark),
    userSettings: z.array(settings).max(1),
    studyGoals: z
      .array(
        z
          .object({
            id: z.literal("daily"),
            count: z.number().int().min(1).max(500),
          })
          .strict(),
      )
      .max(1),
  })
  .strict()
  .superRefine((b, c) => {
    for (const key of [
      "answerAttempts",
      "studySessions",
      "bookmarks",
      "glossaryBookmarks",
    ] as const) {
      if (new Set(b[key].map((x) => x.id)).size !== b[key].length)
        c.addIssue({ code: "custom", message: `${key} のIDが重複しています` });
    }
    for (const a of b.answerAttempts) {
      if (
        a.id !== `${a.sessionId}:${a.questionId}` ||
        new Set(a.selectedOptionIds).size !== a.selectedOptionIds.length
      )
        c.addIssue({
          code: "custom",
          message: "回答イベントIDまたは選択肢が不正です",
        });
    }
  });
export type Backup = z.infer<typeof backupSchema>;
export async function exportBackup(database: DojoDB = db): Promise<Backup> {
  return database.transaction(
    "r",
    [
      database.answerAttempts,
      database.questionProgress,
      database.studySessions,
      database.bookmarks,
      database.glossaryBookmarks,
      database.userSettings,
      database.studyGoals,
    ],
    async () => ({
      format: "az900-dojo",
      version: 1,
      createdAt: new Date().toISOString(),
      answerAttempts: await database.answerAttempts.toArray(),
      questionProgress: await database.questionProgress.toArray(),
      studySessions: await database.studySessions.toArray(),
      bookmarks: await database.bookmarks.toArray(),
      glossaryBookmarks: await database.glossaryBookmarks.toArray(),
      userSettings: await database.userSettings.toArray(),
      studyGoals: await database.studyGoals.toArray(),
    }),
  );
}
export function parseBackup(input: unknown) {
  return backupSchema.parse(input);
}
export async function importBackup(
  input: unknown,
  mode: "merge" | "replace",
  database: DojoDB = db,
) {
  const b = parseBackup(input);
  const tables = [
    database.answerAttempts,
    database.questionProgress,
    database.studySessions,
    database.bookmarks,
    database.glossaryBookmarks,
    database.userSettings,
    database.studyGoals,
  ];
  await database.transaction("rw", tables, async () => {
    if (mode === "replace") for (const table of tables) await table.clear();
    for (const a of b.answerAttempts) {
      const old = await database.answerAttempts.get(a.id);
      if (old) {
        if (JSON.stringify(old) !== JSON.stringify(a)) {
          const keys = [
            "questionId",
            "questionVersion",
            "answeredAt",
            "selectedOptionIds",
            "isCorrect",
            "durationMs",
            "mode",
            "sessionId",
          ] as const;
          if (keys.some((k) => JSON.stringify(old[k]) !== JSON.stringify(a[k])))
            throw new Error(
              "同じ回答IDに異なる内容があります。統合を中止しました。",
            );
        }
      } else await database.answerAttempts.add(a);
    }
    for (const s of b.studySessions) {
      const old = await database.studySessions.get(s.id);
      if (
        old &&
        (JSON.stringify(old.questionIds) !== JSON.stringify(s.questionIds) ||
          old.mode !== s.mode ||
          Object.keys(old.questionVersions).some(
            (id) => old.questionVersions[id] !== s.questionVersions[id],
          ))
      )
        throw new Error(
          "同じセッションIDに異なる問題構成があります。統合を中止しました。",
        );
      if (
        !old ||
        (s.status === "completed" && old.status !== "completed") ||
        (s.updatedAt > old.updatedAt &&
          !(old.status === "completed" && s.status === "active"))
      )
        await database.studySessions.put(s);
    }
    await database.bookmarks.bulkPut(b.bookmarks);
    await database.glossaryBookmarks.bulkPut(b.glossaryBookmarks);
    await database.userSettings.bulkPut(b.userSettings);
    await database.studyGoals.bulkPut(b.studyGoals);
    const attempts = await database.answerAttempts.toArray();
    const bySession = new Map<string, typeof attempts>();
    for (const a of attempts)
      bySession.set(a.sessionId, [...(bySession.get(a.sessionId) ?? []), a]);
    for (const s of await database.studySessions.toArray()) {
      const events = bySession.get(s.id) ?? [];
      for (const a of events) {
        s.answers[a.questionId] = a.selectedOptionIds;
        s.durations[a.questionId] = a.durationMs;
      }
      if (events.length) await database.studySessions.put(s);
    }
    await database.questionProgress.clear();
    await database.questionProgress.bulkPut(rebuildProgress(attempts));
  });
  return b;
}
export function downloadJson(data: unknown, filename: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
