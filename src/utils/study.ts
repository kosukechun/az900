import type { Attempt, Category, Mode, Progress, Question } from "../types";
export const isCorrect = (selected: string[], correct: string[]) =>
  selected.length === correct.length &&
  [...selected].sort().every((v, i) => v === [...correct].sort()[i]);
export const dateKey = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function rebuildProgress(attempts: Attempt[]): Progress[] {
  const map = new Map<string, Progress>();
  for (const a of [...attempts].sort(
    (a, b) => a.answeredAt - b.answeredAt || a.id.localeCompare(b.id),
  )) {
    const old = map.get(a.questionId);
    map.set(a.questionId, {
      questionId: a.questionId,
      attempts: (old?.attempts ?? 0) + 1,
      wrongCount: (old?.wrongCount ?? 0) + (a.isCorrect ? 0 : 1),
      isUnresolved: !a.isCorrect,
      lastAnsweredAt: a.answeredAt,
      lastWrongAt: a.isCorrect ? old?.lastWrongAt : a.answeredAt,
      lastIsCorrect: a.isCorrect,
    });
  }
  return [...map.values()];
}
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export function selectQuestions(
  questions: Question[],
  mode: Mode,
  count: number,
  progress: Progress[],
  bookmarks: string[],
  domain: string | readonly string[] = [],
  subcategory: string | readonly string[] = [],
  random = Math.random,
): Question[] {
  const pm = new Map(progress.map((p) => [p.questionId, p]));
  const domains =
    typeof domain === "string" ? (domain ? [domain] : []) : domain;
  const subcategories =
    typeof subcategory === "string"
      ? subcategory
        ? [subcategory]
        : []
      : subcategory;
  let pool = questions.filter(
    (q) =>
      (!domains.length || domains.includes(q.domain)) &&
      (!subcategories.length || subcategories.includes(q.subcategory)),
  );
  if (mode === "unanswered") pool = pool.filter((q) => !pm.has(q.id));
  if (mode === "ever-wrong")
    pool = pool.filter((q) => (pm.get(q.id)?.wrongCount ?? 0) > 0);
  if (mode === "unresolved")
    pool = pool.filter((q) => pm.get(q.id)?.isUnresolved);
  if (mode === "bookmarks") pool = pool.filter((q) => bookmarks.includes(q.id));
  if (mode === "weak") {
    const stats = new Map<string, { wrong: number; total: number }>();
    for (const q of pool) {
      const p = pm.get(q.id);
      if (p) {
        const s = stats.get(q.domain) ?? { wrong: 0, total: 0 };
        s.wrong += p.wrongCount;
        s.total += p.attempts;
        stats.set(q.domain, s);
      }
    }
    const weak = [...stats].sort(
      (a, b) => b[1].wrong / b[1].total - a[1].wrong / a[1].total,
    )[0]?.[0];
    if (weak) pool = pool.filter((q) => q.domain === weak);
  }
  let result = shuffle(pool, random);
  if (mode === "unresolved")
    result.sort((a, b) => {
      const pa = pm.get(a.id)!,
        pb = pm.get(b.id)!;
      return (
        pb.wrongCount - pa.wrongCount ||
        (pb.lastWrongAt ?? 0) - (pa.lastWrongAt ?? 0)
      );
    });
  return result.slice(0, count || result.length);
}
export function mockQuestions(
  questions: Question[],
  count: number,
  categories: Category[],
  weights: number[],
): Question[] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return [];
  const selected: Question[] = [];
  categories.forEach((c, i) =>
    selected.push(
      ...shuffle(questions.filter((q) => q.domain === c.id)).slice(
        0,
        Math.floor((count * weights[i]) / total),
      ),
    ),
  );
  const ids = new Set(selected.map((q) => q.id));
  selected.push(
    ...shuffle(
      questions.filter(
        (q) =>
          !ids.has(q.id) &&
          weights[categories.findIndex((c) => c.id === q.domain)] > 0,
      ),
    ).slice(0, count - selected.length),
  );
  return shuffle(selected);
}
export function streak(attempts: Attempt[], now = Date.now()) {
  const days = new Set(attempts.map((a) => dateKey(a.answeredAt)));
  const d = new Date(now);
  if (!days.has(dateKey(+d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dateKey(+d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
export const percent = (correct: number, total: number) =>
  total ? Math.round((correct / total) * 100) : 0;
export const modeNames: Record<Mode, string> = {
  random: "ランダム演習",
  domain: "分野別演習",
  unanswered: "未回答",
  "ever-wrong": "過去に間違えた問題",
  unresolved: "未克服の復習",
  bookmarks: "ブックマーク",
  weak: "苦手分野",
  daily: "デイリーチャレンジ",
  mock: "模擬試験",
  individual: "個別演習",
};
