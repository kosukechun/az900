import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Clock,
  Flag,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { db } from "../db/database";
import type { Session } from "../types";
import { useContent } from "../context";
import { useStudyData } from "../hooks/useStudyData";
import { usePersistenceQueue } from "../hooks/usePersistenceQueue";
import { savePracticeAnswer, gradeMock } from "../services/learning";
import { QuestionCard } from "../components/QuestionCard";
import { PageHeading, Explanation, Stat } from "../components/ui";
import { modeNames, percent, isCorrect } from "../utils/study";
import { canUseQuestionVersion } from "../utils/questionVersion";
export function SessionPage() {
  const { id } = useParams();
  const saved = useLiveQuery(() => db.studySessions.get(id!), [id]);
  const [session, setSession] = useState<Session>(),
    [tick, setTick] = useState(Date.now());
  const { saving, error, enqueue, queue, retry } = usePersistenceQueue();
  const { questions, categories } = useContent();
  const d = useStudyData();
  const latest = useRef<Session>();
  const finishing = useRef(false);
  useEffect(() => {
    if (saved && saved.id === id && (!session || session.id !== id)) {
      setSession(saved);
      latest.current = saved;
    }
  }, [saved, session, id]);
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const replace = (next: Session, persist = true) => {
    latest.current = next;
    setSession(next);
    if (persist) enqueue(() => db.studySessions.put(next));
  };
  const finish = async (confirm = true) => {
    const s = latest.current;
    if (!s || s.id !== id || finishing.current || retry.current) return;
    if (
      confirm &&
      s.mode === "mock" &&
      !window.confirm(
        "模擬試験を終了して採点しますか？ 未回答は不正解として記録されます。",
      )
    )
      return;
    finishing.current = true;
    await queue.current;
    if (retry.current) {
      finishing.current = false;
      return;
    }
    enqueue(async () => {
      if (s.mode === "mock") await gradeMock(s, questions);
      else
        await db.studySessions.put({
          ...s,
          status: "completed",
          completedAt: Date.now(),
          elapsedMs: Object.values(s.durations).reduce((a, b) => a + b, 0),
          updatedAt: Date.now(),
        });
      const completed = await db.studySessions.get(s.id);
      if (completed) replace(completed, false);
    });
    await queue.current;
    finishing.current = false;
  };
  useEffect(() => {
    if (
      session &&
      session.id === id &&
      session.mode === "mock" &&
      session.status === "active" &&
      session.deadline &&
      tick >= session.deadline
    )
      void finish(false);
  }, [tick, session?.deadline, session?.status, id]);
  if (!session || session.id !== id || !d)
    return saved === undefined ? (
      <div className="card panel">
        <p>セッションを読み込んでいます…</p>
        <Link to="/practice">演習一覧へ</Link>
      </div>
    ) : null;
  const s = session,
    q = questions.find((q) => q.id === s.questionIds[s.index]);
  if (!q || s.questionIds.some((id) => !questions.some((q) => q.id === id)))
    return (
      <div className="notice">
        このセッションに含まれる問題が見つかりません。履歴は保持されています。
        <Link to="/practice">新しい演習をはじめる</Link>
      </div>
    );
  if (
    s.questionIds.some(
      (id) =>
        !canUseQuestionVersion(
          questions.find((q) => q.id === id)!,
          s.questionVersions[id],
        ),
    )
  )
    return (
      <div className="card panel">
        <h2>問題が更新されています</h2>
        <p>
          この途中のセッションと現在の問題バージョンが異なります。古い解答を新しい問題で採点しないため、新しい演習を開始してください。過去の回答履歴は保持されています。
        </p>
        <Link className="btn primary" to="/practice">
          演習一覧へ
        </Link>
      </div>
    );
  const mock = s.mode === "mock",
    next = () => {
      if (saving || error) return;
      if (s.index === s.questionIds.length - 1) {
        void finish(false);
        return;
      }
      replace({ ...s, index: s.index + 1, updatedAt: Date.now() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  if (s.status === "completed") {
    const rows = s.questionIds.map((id) => {
        const q = questions.find((q) => q.id === id)!;
        return {
          q,
          selected: s.answers[id] ?? [],
          correct: isCorrect(s.answers[id] ?? [], q.correctOptionIds),
        };
      }),
      right = rows.filter((r) => r.correct).length,
      unanswered = rows.filter((r) => !r.selected.length).length;
    return (
      <>
        <PageHeading
          eyebrow={mock ? "MOCK EXAM RESULT" : "SESSION RESULT"}
          title="おつかれさまでした！"
          description={
            mock
              ? "正答率はアプリ独自の集計です。Microsoftの公式スコアとは異なります。"
              : "今日の一歩が、明日の理解につながります。"
          }
        />
        <div className="stats-grid">
          <Stat label="正答率" value={`${percent(right, rows.length)}%`} />
          <Stat
            label="正答 / 誤答"
            value={`${right} / ${rows.length - right - unanswered}`}
          />
          <Stat label="未回答" value={`${unanswered}問`} />
          <Stat
            label="学習時間"
            value={`${Math.round((s.elapsedMs ?? Object.values(s.durations).reduce((a, b) => a + b, 0)) / 60000)}分`}
          />
        </div>
        <div className="card panel">
          <h2>分野別成績</h2>
          {categories.map((c) => {
            const r = rows.filter((r) => r.q.domain === c.id);
            return (
              <p key={c.id}>
                {c.name}：{r.filter((r) => r.correct).length} / {r.length}問（
                {percent(r.filter((r) => r.correct).length, r.length)}%）
              </p>
            );
          })}
          <div className="button-row">
            <Link className="btn primary" to="/review">
              間違えた問題を復習
            </Link>
            <Link className="btn secondary" to="/">
              ホームへ
            </Link>
          </div>
        </div>
        <h2 className="section-space">全問題の解答と解説</h2>
        {rows.map((r, i) => (
          <details className="card result-item" key={r.q.id}>
            <summary>
              <span className={r.correct ? "success-text" : "danger-text"}>
                {r.correct ? "○" : r.selected.length ? "×" : "未回答"}
              </span>{" "}
              {i + 1}. {r.q.questionText}
            </summary>
            <p>
              あなたの回答：
              {r.selected
                .map(
                  (id) =>
                    `${id}. ${r.q.options.find((o) => o.id === id)?.text}`,
                )
                .join(" / ") || "未回答"}
            </p>
            <Explanation question={r.q} correct={r.correct} />
          </details>
        ))}
      </>
    );
  }
  const remaining = Math.max(
    0,
    s.pausedRemainingMs ?? (s.deadline ?? 0) - tick,
  );
  return (
    <>
      <PageHeading
        eyebrow={modeNames[s.mode]}
        title={categories.find((c) => c.id === q.domain)?.name ?? "問題演習"}
        action={
          mock ? (
            <span className={`timer ${remaining < 60000 ? "danger-text" : ""}`}>
              <Clock size={18} />
              {Math.floor(remaining / 60000)}:
              {String(Math.floor(remaining / 1000) % 60).padStart(2, "0")}
            </span>
          ) : (
            <Link className="text-link" to="/">
              中断してホームへ
            </Link>
          )
        }
      />
      <div className="session-progress">
        <span>
          第 <strong>{s.index + 1}</strong> 問 / 全 {s.questionIds.length} 問
        </span>
        <span className="muted">{Object.keys(s.answers).length}問回答済み</span>
      </div>
      <div className="progress-track session-track">
        <div
          style={{ width: `${((s.index + 1) / s.questionIds.length) * 100}%` }}
        />
      </div>
      {s.notice && <p className="notice">{s.notice}</p>}
      {error && (
        <div className="error" role="alert">
          {error}
          <button
            className="btn secondary"
            onClick={() => {
              const op = retry.current;
              if (op) enqueue(op);
            }}
          >
            保存を再試行
          </button>
        </div>
      )}
      {mock && (
        <div className="exam-toolbar">
          <button
            className={`btn secondary ${s.flags.includes(q.id) ? "flagged" : ""}`}
            onClick={() =>
              replace({
                ...s,
                flags: s.flags.includes(q.id)
                  ? s.flags.filter((id) => id !== q.id)
                  : [...s.flags, q.id],
                updatedAt: Date.now(),
              })
            }
          >
            <Flag size={16} />
            {s.flags.includes(q.id) ? "見直しを解除" : "見直しマーク"}
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              replace(
                s.pausedRemainingMs !== undefined
                  ? {
                      ...s,
                      deadline: Date.now() + s.pausedRemainingMs,
                      pausedRemainingMs: undefined,
                      updatedAt: Date.now(),
                    }
                  : {
                      ...s,
                      pausedRemainingMs: remaining,
                      deadline: undefined,
                      updatedAt: Date.now(),
                    },
              );
            }}
          >
            <Pause size={16} />
            {s.pausedRemainingMs !== undefined ? "試験を再開" : "一時停止"}
          </button>
          <button
            className="btn secondary"
            disabled={saving || !!error}
            onClick={() => void finish()}
          >
            試験終了
          </button>
        </div>
      )}
      {s.pausedRemainingMs !== undefined ? (
        <div className="card empty">
          <Pause size={28} />
          <h2>試験を一時停止しています</h2>
          <p>
            「試験を再開」で続けられます。ブラウザを閉じても中断状態は保存されます。
          </p>
        </div>
      ) : (
        <QuestionCard
          key={`${s.id}:${q.id}`}
          question={q}
          selected={s.answers[q.id]}
          mock={mock}
          bookmarked={d.bookmarks.some((b) => b.id === q.id)}
          onBookmark={() =>
            enqueue(async () => {
              if (await db.bookmarks.get(q.id)) await db.bookmarks.delete(q.id);
              else await db.bookmarks.put({ id: q.id, createdAt: Date.now() });
            })
          }
          onAnswer={(selected, duration) => {
            const nextSession = {
              ...s,
              questionVersions: { ...s.questionVersions, [q.id]: q.version },
              answers: { ...s.answers, [q.id]: selected },
              durations: { ...s.durations, [q.id]: duration },
              updatedAt: Date.now(),
            };
            replace(nextSession, false);
            if (mock) enqueue(() => db.studySessions.put(nextSession));
            else enqueue(() => savePracticeAnswer(s, q, selected, duration));
          }}
          onNext={!mock ? next : undefined}
          nextDisabled={saving || !!error}
          autoAdvance={d.settings.autoAdvance}
          autoAdvanceSeconds={d.settings.autoAdvanceSeconds}
        />
      )}
      <p className="save-status" role="status">
        {saving
          ? "保存中…"
          : error
            ? "未保存の回答があります"
            : "✓ このブラウザに保存済み"}
      </p>
      {mock && (
        <>
          <div className="exam-navigation">
            <button
              className="btn secondary"
              disabled={s.index === 0 || saving || !!error}
              onClick={() =>
                replace({ ...s, index: s.index - 1, updatedAt: Date.now() })
              }
            >
              <ChevronLeft size={17} />
              前の問題
            </button>
            <button
              className="btn primary"
              disabled={saving || !!error}
              onClick={() =>
                s.index === s.questionIds.length - 1 ? void finish() : next()
              }
            >
              {s.index === s.questionIds.length - 1
                ? "終了して採点"
                : "次の問題"}
              <ChevronRight size={17} />
            </button>
          </div>
          <div className="card panel">
            <h3>回答状況</h3>
            <div className="question-map">
              {s.questionIds.map((id, i) => (
                <button
                  key={id}
                  className={`${s.answers[id]?.length ? "answered" : ""} ${s.index === i ? "current" : ""}`}
                  aria-label={`第${i + 1}問 ${s.answers[id]?.length ? "回答済み" : "未回答"} ${s.flags.includes(id) ? "見直し" : ""}`}
                  disabled={saving || !!error}
                  onClick={() =>
                    replace({ ...s, index: i, updatedAt: Date.now() })
                  }
                >
                  {i + 1}
                  {s.flags.includes(id) && <Flag size={11} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <p className="shortcut-note">
        PC：1〜4で選択 · Enterで次へ / スマートフォン：選択肢をタップ
      </p>
    </>
  );
}
