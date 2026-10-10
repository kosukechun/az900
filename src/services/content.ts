import type { Question, Term, Category } from "../types";
async function json<T>(path: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${path}`);
  if (!response.ok)
    throw new Error(
      "学習データを読み込めません。接続を確認して再読み込みしてください。",
    );
  return response.json();
}
export async function loadContent() {
  const [files, terms, categories] = await Promise.all([
    json<string[]>("question-files.json"),
    json<Term[]>("glossary.json"),
    json<Category[]>("categories.json"),
  ]);
  const groups = await Promise.all(
    files.map((f) => json<Question[]>(`questions/${f}`)),
  );
  return { questions: groups.flat(), terms, categories };
}
