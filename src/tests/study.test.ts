import { describe, it, expect } from "vitest";
import {
  isCorrect,
  rebuildProgress,
  selectQuestions,
  mockQuestions,
  streak,
} from "../utils/study";
import { question, attempt } from "./factories";
import type { Category } from "../types";
describe("出題・判定", () => {
  it("単一選択の正誤", () => {
    expect(isCorrect(["A"], ["A"])).toBe(true);
    expect(isCorrect(["B"], ["A"])).toBe(false);
    expect(isCorrect([], ["A"])).toBe(false);
  });
  it("複数選択は順不同・完全一致", () => {
    expect(isCorrect(["C", "A"], ["A", "C"])).toBe(true);
    expect(isCorrect(["A"], ["A", "C"])).toBe(false);
    expect(isCorrect(["A", "B", "C"], ["A", "C"])).toBe(false);
  });
  const qs = Array.from({ length: 20 }, (_, i) => ({
    ...question,
    id: `Q${i}`,
    domain: i < 10 ? ("cloud" as const) : ("services" as const),
  }));
  it("ランダム出題の問題数・重複なし", () => {
    const selected = selectQuestions(qs, "random", 10, [], []);
    expect(selected).toHaveLength(10);
    expect(new Set(selected.map((q) => q.id)).size).toBe(10);
    expect(selectQuestions(qs, "random", 50, [], [])).toHaveLength(20);
    expect(selectQuestions(qs, "random", 0, [], [])).toHaveLength(20);
  });
  it("分野・テーマのフィルタ", () => {
    expect(
      selectQuestions(qs, "domain", 5, [], [], "services").every(
        (q) => q.domain === "services",
      ),
    ).toBe(true);
    expect(
      selectQuestions(qs, "domain", 5, [], [], "cloud", "ないテーマ"),
    ).toHaveLength(0);
  });
  it("未回答・未克服・間違い履歴・ブックマークを分離", () => {
    const p = rebuildProgress([
      attempt("s1", false, 1),
      attempt("s2", true, 2),
    ]);
    expect(selectQuestions([question], "unanswered", 10, p, [])).toHaveLength(
      0,
    );
    expect(selectQuestions([question], "unresolved", 10, p, [])).toHaveLength(
      0,
    );
    expect(selectQuestions([question], "ever-wrong", 10, p, [])).toHaveLength(
      1,
    );
    expect(
      selectQuestions([question], "bookmarks", 10, p, ["Q001"]),
    ).toHaveLength(1);
  });
  it("模試比率・重複なし・ゼロ比率分野を除外", () => {
    const c: Category[] = [
      { id: "cloud", name: "c", weight: 50, subcategories: [] },
      { id: "services", name: "s", weight: 50, subcategories: [] },
    ];
    const out = mockQuestions(qs, 10, c, [30, 70]);
    expect(out.filter((q) => q.domain === "cloud")).toHaveLength(3);
    expect(out).toHaveLength(10);
    expect(new Set(out.map((q) => q.id)).size).toBe(10);
    expect(
      mockQuestions(qs, 10, c, [0, 100]).every((q) => q.domain === "services"),
    ).toBe(true);
  });
  it("最新時刻で未克服状態を決定", () => {
    const p = rebuildProgress([
      attempt("later", true, 20),
      attempt("earlier", false, 10),
    ])[0];
    expect(p.isUnresolved).toBe(false);
    expect(p.wrongCount).toBe(1);
  });
  it("日付境界の連続学習日数", () => {
    const now = new Date(2026, 9, 10, 12).getTime();
    expect(
      streak(
        [
          attempt("s1", true, now),
          attempt("s2", true, new Date(2026, 9, 9, 12).getTime()),
        ],
        now,
      ),
    ).toBe(2);
    expect(streak([], now)).toBe(0);
  });
});
