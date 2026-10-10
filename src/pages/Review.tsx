import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RotateCcw, Bookmark, CheckCircle2 } from "lucide-react";
import { db } from "../db/database";
import { useContent } from "../context";
import { useStudyData } from "../hooks/useStudyData";
import { PageHeading, Empty, Explanation } from "../components/ui";
export function Review({ bookmarks = false }: { bookmarks?: boolean }) {
  const d = useStudyData(),
    { questions, categories } = useContent();
  const [domain, setDomain] = useState(""),
    [history, setHistory] = useState(false),
    [expanded, setExpanded] = useState<string>(),
    [error, setError] = useState("");
  if (!d) return <p>読み込み中…</p>;
  const progress = new Map(d.progress.map((p) => [p.questionId, p])),
    ids = new Set(d.bookmarks.map((b) => b.id));
  const all = questions
      .filter((q) =>
        bookmarks
          ? ids.has(q.id)
          : history
            ? (progress.get(q.id)?.wrongCount ?? 0) > 0
            : progress.get(q.id)?.isUnresolved,
      )
      .sort(
        (a, b) =>
          (progress.get(b.id)?.wrongCount ?? 0) -
            (progress.get(a.id)?.wrongCount ?? 0) ||
          (progress.get(b.id)?.lastWrongAt ?? 0) -
            (progress.get(a.id)?.lastWrongAt ?? 0),
      ),
    filtered = all.filter((q) => !domain || q.domain === domain);
  return (
    <>
      <PageHeading
        eyebrow={bookmarks ? "BOOKMARKS" : "REVIEW"}
        title={bookmarks ? "ブックマーク" : "間違えた問題を、得意に。"}
        description={
          bookmarks
            ? "あとで解きたい問題を、ここにまとめよう。"
            : "次に正解すると未克服リストから自動で外れます。過去の間違い履歴は残ります。"
        }
        action={
          !bookmarks && (
            <Link className="btn primary" to="/practice?quick=unresolved">
              <RotateCcw size={17} />
              未克服問題をまとめて復習
            </Link>
          )
        }
      />
      {!bookmarks && (
        <div className="tabs">
          <button
            className={!history ? "active" : ""}
            onClick={() => setHistory(false)}
          >
            現在の未克服（{d.progress.filter((p) => p.isUnresolved).length}）
          </button>
          <button
            className={history ? "active" : ""}
            onClick={() => setHistory(true)}
          >
            過去に間違えた問題（
            {d.progress.filter((p) => p.wrongCount > 0).length}）
          </button>
        </div>
      )}
      <div className="domain-cards">
        {categories.map((c) => (
          <button
            className={`card domain-choice ${domain === c.id ? "selected" : ""}`}
            key={c.id}
            onClick={() => setDomain(domain === c.id ? "" : c.id)}
          >
            <small>{c.name}</small>
            <strong>
              {all.filter((q) => q.domain === c.id).length}
              <em>問</em>
            </strong>
          </button>
        ))}
      </div>
      <div className="section-title">
        <h2>
          {filtered.length}問の
          {bookmarks ? "ブックマーク" : history ? "間違い履歴" : "未克服問題"}
        </h2>
        <label className="sr-only" htmlFor="review-domain">
          分野
        </label>
        <select
          id="review-domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        >
          <option value="">すべての分野</option>
          {categories.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {filtered.length ? (
        filtered.map((q) => {
          const p = progress.get(q.id);
          return (
            <article className="card review-item" key={q.id}>
              <div className="question-meta">
                <span className="chip">{q.subcategory}</span>
                {p && !p.isUnresolved && (
                  <span className="success-text small">
                    <CheckCircle2 size={14} />
                    克服済み
                  </span>
                )}
                {bookmarks && (
                  <button
                    className="icon-btn bookmarked"
                    aria-label="ブックマークを解除"
                    onClick={() =>
                      void db.bookmarks
                        .delete(q.id)
                        .catch(() =>
                          setError("解除に失敗しました。再試行してください。"),
                        )
                    }
                  >
                    <Bookmark size={18} fill="currentColor" />
                  </button>
                )}
              </div>
              <h3>{q.questionText}</h3>
              <p className="small muted">
                過去の不正解 {p?.wrongCount ?? 0}回 · 最後に間違えた日{" "}
                {p?.lastWrongAt
                  ? new Date(p.lastWrongAt).toLocaleDateString("ja-JP")
                  : "—"}{" "}
                · 最終回答{" "}
                {p ? (p.lastIsCorrect ? "正解" : "不正解") : "未回答"}
              </p>
              <div className="button-row">
                <Link
                  className="btn primary small-btn"
                  to={`/practice?question=${q.id}`}
                >
                  この問題を解く
                  <ArrowRight size={15} />
                </Link>
                <Link
                  className="btn secondary small-btn"
                  to={`/domains?domain=${q.domain}`}
                >
                  同じ分野を練習
                </Link>
                <button
                  className="text-link"
                  onClick={() =>
                    setExpanded(expanded === q.id ? undefined : q.id)
                  }
                >
                  {expanded === q.id ? "閉じる" : "解説・自分の履歴"}
                </button>
              </div>
              {expanded === q.id && (
                <>
                  <Explanation question={q} showResult={false} />
                  <h3>自分の回答履歴</h3>
                  <ul className="attempt-list">
                    {d.attempts
                      .filter((a) => a.questionId === q.id)
                      .reverse()
                      .map((a) => (
                        <li key={a.id}>
                          <time>
                            {new Date(a.answeredAt).toLocaleString("ja-JP")}
                          </time>
                          <span
                            className={
                              a.isCorrect ? "success-text" : "danger-text"
                            }
                          >
                            {a.isCorrect ? "正解" : "不正解"}
                          </span>
                          <span>
                            選択 {a.selectedOptionIds.join(", ") || "未回答"} ·
                            v{a.questionVersion}
                          </span>
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </article>
          );
        })
      ) : (
        <Empty
          title={
            bookmarks
              ? "ブックマークはまだありません"
              : history
                ? "間違い履歴はまだありません"
                : "未克服の問題はありません"
          }
        >
          <p className="muted">
            {bookmarks
              ? "演習中のしおりアイコンで追加できます。"
              : "演習で間違えた問題は自動で記録されます。"}
          </p>
          <Link className="btn primary" to="/practice">
            問題演習をはじめる
          </Link>
        </Empty>
      )}
    </>
  );
}
