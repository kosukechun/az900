import { describe, it, expect } from "vitest";
// @ts-expect-error Developer validation is a reusable JavaScript module.
import { readContent, validateContent } from "../../scripts/validate-data.mjs";
describe("教材の形式検証", () => {
  it("正答・選択肢が変わった教材に旧版互換の宣言を残すと検証で拒否", () => {
    const q = data.questions.find(
      (q: { answerCompatibleVersions?: number[] }) =>
        q.answerCompatibleVersions?.length,
    );
    expect(q).toBeTruthy();
    const changed = {
      ...q,
      correctOptionIds: [
        q.options.find(
          (o: { id: string }) => !q.correctOptionIds.includes(o.id),
        ).id,
      ],
    };
    expect(
      validateContent([changed], data.terms, data.categories).some(
        (e: string) => e.includes("互換性を確認した"),
      ),
    ).toBe(true);
  });
  const data = readContent();
  it("全収録問題・用語を検証", () => {
    expect(data.questions.length).toBeGreaterThanOrEqual(120);
    expect(data.terms.length).toBeGreaterThanOrEqual(150);
    expect(
      validateContent(data.questions, data.terms, data.categories),
    ).toEqual([]);
  });
  it("ID/本文重複・不整合・欠落・関連語・URL・ライセンスを検出", () => {
    const q = {
      ...data.questions[0],
      correctOptionIds: ["Z"],
      explanation: "",
      relatedTermIds: ["missing"],
      referenceUrls: ["http://example.com"],
      license: "",
    };
    expect(
      validateContent([data.questions[0], q], data.terms, data.categories)
        .length,
    ).toBeGreaterThanOrEqual(6);
  });
});
