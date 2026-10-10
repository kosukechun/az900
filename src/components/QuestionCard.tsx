import { useEffect, useRef, useState } from "react";
import { Bookmark, Check, ChevronRight, X } from "lucide-react";
import type { Question } from "../types";
import { Explanation } from "./ui";
import { isCorrect } from "../utils/study";
import { TermDialog } from "./TermDialog";
export function QuestionCard({
  question,
  selected: stored,
  onAnswer,
  onNext,
  bookmarked,
  onBookmark,
  mock = false,
  autoAdvance = false,
  autoAdvanceSeconds = 5,
}: {
  question: Question;
  selected?: string[];
  onAnswer: (selected: string[], durationMs: number) => void;
  onNext?: () => void;
  bookmarked: boolean;
  onBookmark: () => void;
  mock?: boolean;
  autoAdvance?: boolean;
  autoAdvanceSeconds?: number;
}) {
  const [chosen, setChosen] = useState<string[]>(stored ?? []);
  const [locked, setLocked] = useState(!mock && stored !== undefined);
  const [term, setTerm] = useState<string>();
  const lock = useRef(!mock && stored !== undefined);
  const started = useRef(performance.now());
  const nextRef = useRef(onNext);
  nextRef.current = onNext;
  const canNext = !!onNext;
  const correct = isCorrect(chosen, question.correctOptionIds);
  const answer = (ids: string[]) => {
    if (!mock && lock.current) return;
    if (!mock) {
      lock.current = true;
      setLocked(true);
    }
    setChosen(ids);
    onAnswer(ids, Math.max(0, Math.round(performance.now() - started.current)));
  };
  const choose = (id: string) => {
    if (lock.current && !mock) return;
    if (question.questionType === "single") answer([id]);
    else {
      const ids = chosen.includes(id)
        ? chosen.filter((v) => v !== id)
        : [...chosen, id];
      setChosen(ids);
      if (mock)
        onAnswer(
          ids,
          Math.max(0, Math.round(performance.now() - started.current)),
        );
    }
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) ||
        el.isContentEditable ||
        document.querySelector("dialog[open]")
      )
        return;
      const n = Number(e.key);
      if (n >= 1 && n <= question.options.length) {
        e.preventDefault();
        choose(question.options[n - 1].id);
      }
      if (e.key === "Enter" && locked && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  useEffect(() => {
    if (!locked || mock || !autoAdvance || !canNext || term) return;
    const timer = setTimeout(
      () => nextRef.current?.(),
      autoAdvanceSeconds * 1000,
    );
    return () => clearTimeout(timer);
  }, [locked, mock, autoAdvance, autoAdvanceSeconds, canNext, term]);
  return (
    <article className="question-card card">
      <div className="question-meta">
        <span className="chip">{question.subcategory}</span>
        <span className="muted">
          {question.questionType === "multiple"
            ? `${question.correctOptionIds.length}つ選択`
            : "1つ選択"}
        </span>
        <button
          className={`icon-btn ${bookmarked ? "bookmarked" : ""}`}
          aria-label={bookmarked ? "ブックマークを解除" : "ブックマークに追加"}
          aria-pressed={bookmarked}
          onClick={onBookmark}
        >
          <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
      <h2 className="question-text">{question.questionText}</h2>
      <div className="options" aria-label="回答の選択肢">
        {question.options.map((o, i) => {
          const show = locked && !mock,
            isRight = show && question.correctOptionIds.includes(o.id),
            isWrong =
              show &&
              chosen.includes(o.id) &&
              !question.correctOptionIds.includes(o.id),
            active = chosen.includes(o.id);
          return (
            <button
              key={o.id}
              className={`option ${isRight ? "right" : ""} ${isWrong ? "wrong" : ""} ${active && !show ? "selected" : ""}`}
              aria-pressed={active}
              disabled={locked && !mock}
              onClick={() => choose(o.id)}
            >
              <span className="option-letter">{o.id}</span>
              <span>{o.text}</span>
              {isRight ? (
                <Check className="option-icon" size={20} aria-label="正答" />
              ) : isWrong ? (
                <X className="option-icon" size={20} aria-label="不正解" />
              ) : (
                <kbd>{i + 1}</kbd>
              )}
            </button>
          );
        })}
      </div>
      {!mock && question.questionType === "multiple" && !locked && (
        <button
          className="btn primary"
          disabled={!chosen.length}
          onClick={() => answer(chosen)}
        >
          回答を確定
        </button>
      )}
      {mock && (
        <p className="muted small">
          回答は自動保存されます。正解と解説は試験終了後に表示します。
        </p>
      )}
      {locked && !mock && (
        <>
          <Explanation question={question} correct={correct} onTerm={setTerm} />
          {onNext && (
            <div className="next-bar">
              <span className="muted small">
                {autoAdvance
                  ? `${autoAdvanceSeconds}秒後に自動で進みます`
                  : "Enter キーでも次へ"}
              </span>
              <button className="btn primary" onClick={onNext}>
                次の問題へ
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
      {term && (
        <TermDialog
          id={term}
          onClose={() => setTerm(undefined)}
          onNavigate={setTerm}
        />
      )}
    </article>
  );
}
