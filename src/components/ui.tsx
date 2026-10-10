import type { ReactNode } from "react";
import { ArrowRight, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Question } from "../types";
import { useContent } from "../context";
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty card">
      <BookOpen size={32} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: string;
}) {
  return (
    <div className="stat card">
      <p className="muted">{label}</p>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}
export function Explanation({
  question,
  correct,
  showResult = true,
  onTerm,
}: {
  question: Question;
  correct?: boolean;
  showResult?: boolean;
  onTerm?: (id: string) => void;
}) {
  const { terms } = useContent();
  return (
    <section className="explanation" aria-label="解説" aria-live="polite">
      {showResult && (
        <h2 className={correct ? "success-text" : "danger-text"}>
          {correct ? <CheckCircle2 /> : <XCircle />}
          {correct ? "正解！" : "不正解 — ここで覚えよう"}
        </h2>
      )}
      <p className="answer-label">
        正解：
        {question.options
          .filter((o) => question.correctOptionIds.includes(o.id))
          .map((o) => `${o.id}. ${o.text}`)
          .join(" / ")}
      </p>
      <h3>解説</h3>
      <p>{question.explanation}</p>
      <h3>選択肢の解説</h3>
      <dl>
        {question.options.map((o) => (
          <div key={o.id}>
            <dt>{o.id}</dt>
            <dd>{question.optionExplanations[o.id]}</dd>
          </div>
        ))}
      </dl>
      <div className="key-point">
        <strong>覚えるポイント</strong>
        <p>{question.keyPoint}</p>
      </div>
      {question.relatedTermIds.length > 0 && (
        <>
          <h3>関連用語</h3>
          <div className="chips">
            {question.relatedTermIds.map((id) => {
              const t = terms.find((t) => t.id === id);
              return (
                t &&
                (onTerm ? (
                  <button className="chip" key={id} onClick={() => onTerm(id)}>
                    {t.abbreviation || t.englishName}
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <Link className="chip" key={id} to={`/glossary?term=${id}`}>
                    {t.abbreviation || t.englishName}
                  </Link>
                ))
              );
            })}
          </div>
        </>
      )}
      <h3>参考資料</h3>
      {question.referenceUrls.map((url, i) => (
        <a
          className="source"
          href={url}
          target="_blank"
          rel="noreferrer"
          key={url}
        >
          Microsoft Learn {i + 1} ↗
        </a>
      ))}
      <small className="muted">
        独自問題 · {question.license} · 確認日 {question.lastVerifiedAt}
      </small>
    </section>
  );
}
