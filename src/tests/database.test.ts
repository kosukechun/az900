import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { DojoDB } from "../db/database";
import { savePracticeAnswer, gradeMock } from "../services/learning";
import { exportBackup, importBackup, parseBackup } from "../services/backup";
import { question, session } from "./factories";
import { questionAnswerKey } from "../utils/questionVersion";
let db: DojoDB;
beforeEach(() => {
  db = new DojoDB(`test-${crypto.randomUUID()}`);
});
afterEach(async () => {
  await db.delete();
});
describe("回答の保存と復習", () => {
  it("正答が同じと確認した旧版の中断模試は採点でき、元の回答版を記録", async () => {
    const s = { ...session("legacy-mock", "mock"), answers: { Q001: ["A"] } };
    const revised = {
      ...question,
      version: 2,
      answerCompatibleVersions: [1],
      compatibilityAnswerKey: questionAnswerKey(question),
    };
    await db.studySessions.add(s);
    await gradeMock(s, [revised], db);
    const a = (await db.answerAttempts.toArray())[0];
    expect(a.isCorrect).toBe(true);
    expect(a.questionVersion).toBe(1);
    expect((await db.studySessions.get(s.id))?.status).toBe("completed");
  });
  it("進捗の保存に失敗すると回答も戻り、再試行で1件だけ保存", async () => {
    const s = session("retry");
    const spy = vi
      .spyOn(db.questionProgress, "put")
      .mockRejectedValueOnce(new Error("quota"));
    await expect(
      savePracticeAnswer(s, question, ["B"], 100, db),
    ).rejects.toThrow("quota");
    expect(await db.answerAttempts.count()).toBe(0);
    spy.mockRestore();
    await savePracticeAnswer(s, question, ["B"], 100, db);
    expect(await db.answerAttempts.count()).toBe(1);
    expect((await db.questionProgress.get("Q001"))?.isUnresolved).toBe(true);
  });
  it("不正解→正解→不正解→正解、4件の履歴を保持", async () => {
    for (const [i, correct] of [false, true, false, true].entries()) {
      const s = session(`session-${i}`);
      await db.studySessions.add(s);
      await savePracticeAnswer(s, question, [correct ? "A" : "B"], 100, db);
      const p = await db.questionProgress.get(question.id);
      expect(p?.isUnresolved).toBe(!correct);
      expect(await db.answerAttempts.count()).toBe(i + 1);
    }
    expect((await db.questionProgress.get("Q001"))?.wrongCount).toBe(2);
  });
  it("同時二重保存をイベントIDで排除", async () => {
    const s = session();
    await Promise.all([
      savePracticeAnswer(s, question, ["A"], 50, db),
      savePracticeAnswer(s, question, ["B"], 50, db),
    ]);
    expect(await db.answerAttempts.count()).toBe(1);
    expect((await db.questionProgress.get("Q001"))?.attempts).toBe(1);
  });
  it("DBを閉じて再度開いても履歴・途中回答が残る", async () => {
    const s = session();
    await savePracticeAnswer(s, question, ["A"], 50, db);
    db.close();
    await db.open();
    expect(await db.answerAttempts.count()).toBe(1);
    expect((await db.studySessions.get(s.id))?.answers.Q001).toEqual(["A"]);
  });
  it("模試は終了時にまとめて採点し未回答を記録、再採点で追加しない", async () => {
    const q2 = { ...question, id: "Q002" };
    const s = {
      ...session(crypto.randomUUID(), "mock"),
      questionIds: ["Q001", "Q002"],
      questionVersions: { Q001: 1, Q002: 1 },
      answers: { Q001: ["A"] },
      timeLimitMs: 60000,
      deadline: Date.now() + 30000,
    };
    await db.studySessions.add(s);
    expect(await db.answerAttempts.count()).toBe(0);
    await gradeMock(s, [question, q2], db);
    await gradeMock(s, [question, q2], db);
    expect(await db.answerAttempts.count()).toBe(2);
    expect((await db.questionProgress.get("Q002"))?.isUnresolved).toBe(true);
    expect((await db.studySessions.get(s.id))?.status).toBe("completed");
  });
  it("問題バージョンが変わった模試は履歴を作らない", async () => {
    const s = session(crypto.randomUUID(), "mock");
    await expect(
      gradeMock(s, [{ ...question, version: 2 }], db),
    ).rejects.toThrow();
    expect(await db.answerAttempts.count()).toBe(0);
  });
});
describe("バックアップ", () => {
  it("全ストアを含めてエクスポート、置換復元", async () => {
    await savePracticeAnswer(session("one"), question, ["B"], 50, db);
    await db.bookmarks.put({ id: "Q001", createdAt: 1 });
    await db.studyGoals.put({ id: "daily", count: 20 });
    const b = await exportBackup(db);
    expect(
      parseBackup(JSON.parse(JSON.stringify(b))).answerAttempts,
    ).toHaveLength(1);
    await savePracticeAnswer(session("two"), question, ["A"], 50, db);
    await importBackup(b, "replace", db);
    expect(await db.answerAttempts.count()).toBe(1);
    expect((await db.questionProgress.get("Q001"))?.isUnresolved).toBe(true);
    expect((await db.studyGoals.get("daily"))?.count).toBe(20);
  });
  it("統合はID重複を排除し履歴から進捗を再計算", async () => {
    await savePracticeAnswer(session("one"), question, ["B"], 50, db);
    const b = await exportBackup(db);
    await savePracticeAnswer(session("two"), question, ["A"], 50, db);
    b.questionProgress[0].isUnresolved = true;
    await importBackup(b, "merge", db);
    await importBackup(b, "merge", db);
    expect(await db.answerAttempts.count()).toBe(2);
    expect((await db.questionProgress.get("Q001"))?.isUnresolved).toBe(false);
    expect((await db.questionProgress.get("Q001"))?.wrongCount).toBe(1);
  });
  it("不正なJSON・不明版・イベントID・選択肢重複を拒否", async () => {
    await savePracticeAnswer(session("one"), question, ["A"], 50, db);
    const b = await exportBackup(db);
    expect(() => parseBackup({})).toThrow();
    expect(() => parseBackup({ ...b, version: 999 })).toThrow();
    expect(() =>
      parseBackup({
        ...b,
        answerAttempts: [{ ...b.answerAttempts[0], id: "fake" }],
      }),
    ).toThrow();
    expect(() =>
      parseBackup({
        ...b,
        answerAttempts: [
          { ...b.answerAttempts[0], selectedOptionIds: ["A", "A"] },
        ],
      }),
    ).toThrow();
    expect(await db.answerAttempts.count()).toBe(1);
  });
  it("統合時のID衝突ではトランザクション全体をロールバック", async () => {
    await savePracticeAnswer(session("one"), question, ["A"], 50, db);
    const b = await exportBackup(db);
    b.answerAttempts[0].isCorrect = false;
    await expect(importBackup(b, "merge", db)).rejects.toThrow();
    expect((await db.answerAttempts.toArray())[0].isCorrect).toBe(true);
  });
  it("旧IndexedDBスキーマからv2へ移行", async () => {
    const Dexie = (await import("dexie")).default;
    const name = `old-${crypto.randomUUID()}`,
      old = new Dexie(name);
    old.version(1).stores({
      answerAttempts: "id,questionId,answeredAt,sessionId,mode",
      questionProgress: "questionId,lastAnsweredAt",
      studySessions: "id,status,updatedAt",
      bookmarks: "id",
      glossaryBookmarks: "id",
      userSettings: "id",
      studyGoals: "id",
    });
    await old.table("userSettings").put({
      id: "preferences",
      theme: "dark",
      questionCount: 10,
      autoAdvance: false,
    });
    old.close();
    const migrated = new DojoDB(name);
    await migrated.open();
    expect(
      (await migrated.userSettings.get("preferences"))?.autoAdvanceSeconds,
    ).toBe(5);
    expect(await migrated.privateMaterials.count()).toBe(0);
    await migrated.delete();
  });
});
