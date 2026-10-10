import fs from "node:fs";
import path from "node:path";
import { readContent, validateContent } from "./validate-data.mjs";
const [input, filename = "extra.json"] = process.argv.slice(2);
if (!input) {
  console.error(
    "使用法: npm run import:questions -- path/to/questions.json extra.json",
  );
  process.exit(1);
}
if (path.basename(filename) !== filename || !filename.endsWith(".json"))
  throw new Error("出力名は extra.json のようなファイル名にしてください。");
function csvRows(text) {
  const rows = [];
  let row = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (quoted) throw new Error("CSVの引用符が閉じていません");
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
const text = fs.readFileSync(input, "utf8").replace(/^\uFEFF/, ""),
  isCsv = input.toLowerCase().endsWith(".csv");
let incoming;
if (isCsv) {
  const [headers, ...rows] = csvRows(text);
  incoming = rows.map((row) =>
    Object.fromEntries(
      headers.map((h, i) => {
        const raw = row[i] ?? "";
        return [
          h,
          [
            "options",
            "correctOptionIds",
            "optionExplanations",
            "relatedTermIds",
            "referenceUrls",
            "answerCompatibleVersions",
          ].includes(h)
            ? JSON.parse(raw)
            : h === "version"
              ? Number(raw)
              : raw,
        ];
      }),
    ),
  );
} else incoming = JSON.parse(text);
if (!Array.isArray(incoming))
  throw new Error("JSONは問題オブジェクトの配列にしてください。");
const data = readContent();
const errors = validateContent(
  [...data.questions, ...incoming],
  data.terms,
  data.categories,
);
if (errors.length) throw new Error(errors.join("\n"));
const output = path.resolve("public/data/questions", filename);
if (fs.existsSync(output))
  throw new Error("出力先は既に存在します。別のファイル名を指定してください。");
const manifestPath = "public/data/question-files.json",
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
fs.writeFileSync(output, JSON.stringify(incoming, null, 2) + "\n");
try {
  fs.writeFileSync(
    manifestPath,
    JSON.stringify([...manifest, filename], null, 2) + "\n",
  );
} catch (e) {
  fs.unlinkSync(output);
  throw e;
}
console.log(`${incoming.length}問を追加しました: ${filename}`);
