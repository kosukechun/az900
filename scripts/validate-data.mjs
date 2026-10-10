import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export function validateContent(questions, terms, categories) {
  const errors = [],
    ids = new Set(),
    texts = new Set(),
    termIds = new Set(terms.map((t) => t.id)),
    categoryIds = new Set(categories.map((c) => c.id));
  const nonempty = (v) => typeof v === "string" && v.trim().length > 0;
  const url = (v) => {
    try {
      const u = new URL(v);
      return (
        u.protocol === "https:" &&
        ["learn.microsoft.com", "azure.microsoft.com"].includes(u.hostname)
      );
    } catch {
      return false;
    }
  };
  for (const q of questions) {
    if (!nonempty(q.id) || ids.has(q.id)) errors.push(`問題ID重複/空: ${q.id}`);
    ids.add(q.id);
    const normalized = q.questionText?.normalize("NFKC").replace(/\s/g, "");
    if (!normalized || texts.has(normalized))
      errors.push(`問題文重複/空: ${q.id}`);
    texts.add(normalized);
    for (const field of [
      "subcategory",
      "difficulty",
      "explanation",
      "keyPoint",
      "originType",
      "license",
    ])
      if (!nonempty(q[field])) errors.push(`${q.id}: ${field}必須`);
    if (!Number.isInteger(q.version) || q.version < 1)
      errors.push(`${q.id}: version`);
    if (!categoryIds.has(q.domain)) errors.push(`${q.id}: domain`);
    if (!["single", "multiple"].includes(q.questionType))
      errors.push(`${q.id}: questionType`);
    if (
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      q.options.length > 4
    ) {
      errors.push(`${q.id}: options`);
      continue;
    }
    const optionIds = q.options.map((o) => o.id);
    if (
      new Set(optionIds).size !== optionIds.length ||
      q.options.some((o) => !nonempty(o.text) || !nonempty(o.id))
    )
      errors.push(`${q.id}: 選択肢ID/本文`);
    if (
      !Array.isArray(q.correctOptionIds) ||
      !q.correctOptionIds.length ||
      q.correctOptionIds.some((id) => !optionIds.includes(id)) ||
      new Set(q.correctOptionIds).size !== q.correctOptionIds.length ||
      (q.questionType === "single" && q.correctOptionIds.length !== 1) ||
      (q.questionType === "multiple" && q.correctOptionIds.length < 2)
    )
      errors.push(`${q.id}: 正答不整合`);
    if (optionIds.some((id) => !nonempty(q.optionExplanations?.[id])))
      errors.push(`${q.id}: 選択肢解説必須`);
    if (
      !Array.isArray(q.relatedTermIds) ||
      q.relatedTermIds.some((id) => !termIds.has(id))
    )
      errors.push(`${q.id}: 関連語不明`);
    if (
      !Array.isArray(q.referenceUrls) ||
      !q.referenceUrls.length ||
      q.referenceUrls.some((v) => !url(v))
    )
      errors.push(`${q.id}: 公式参考URL必須`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(q.lastVerifiedAt) ||
      Number.isNaN(Date.parse(q.lastVerifiedAt))
    )
      errors.push(`${q.id}: 確認日`);
    if (q.originType === "original" && q.license !== "CC-BY-4.0")
      errors.push(`${q.id}: 独自教材ライセンス`);
  }
  if (termIds.size !== terms.length) errors.push("用語ID重複");
  for (const t of terms) {
    for (const field of [
      "id",
      "japaneseName",
      "englishName",
      "summary",
      "description",
      "example",
      "keyPoint",
      "lastVerifiedAt",
    ])
      if (!nonempty(t[field])) errors.push(`用語 ${t.id}: ${field}`);
    if (
      !categoryIds.has(t.category) ||
      !url(t.officialUrl) ||
      !Array.isArray(t.relatedTermIds) ||
      t.relatedTermIds.some((id) => !termIds.has(id))
    )
      errors.push(`用語 ${t.id}: 分類/URL/関連語`);
  }
  if (
    categoryIds.size !== categories.length ||
    categories.some(
      (c) =>
        !nonempty(c.name) ||
        !Array.isArray(c.subcategories) ||
        !Number.isFinite(c.weight) ||
        c.weight < 0,
    )
  )
    errors.push("分類定義不正");
  return errors;
}
export function readContent() {
  const dir = path.resolve("public/data");
  const files = JSON.parse(
    fs.readFileSync(path.join(dir, "question-files.json"), "utf8"),
  );
  if (files.some((f) => path.basename(f) !== f || !f.endsWith(".json")))
    throw new Error("問題ファイル名はJSONのbasenameだけを指定してください。");
  return {
    questions: files.flatMap((f) =>
      JSON.parse(fs.readFileSync(path.join(dir, "questions", f), "utf8")),
    ),
    terms: JSON.parse(fs.readFileSync(path.join(dir, "glossary.json"), "utf8")),
    categories: JSON.parse(
      fs.readFileSync(path.join(dir, "categories.json"), "utf8"),
    ),
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const data = readContent(),
    errors = validateContent(data.questions, data.terms, data.categories);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      `データ検証成功: ${data.questions.length}問 / ${data.terms.length}語 / ${data.categories.length}分野`,
    );
}
