import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, ArrowRight } from "lucide-react";
import { useContent } from "../context";
import { mockQuestions } from "../utils/study";
import { db } from "../db/database";
import type { Session } from "../types";
import { PageHeading } from "../components/ui";
export function Mock() {
  const { questions, categories } = useContent(),
    navigate = useNavigate();
  const [count, setCount] = useState(40),
    [minutes, setMinutes] = useState(45),
    [weights, setWeights] = useState(categories.map((c) => c.weight)),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function start() {
    setBusy(true);
    try {
      const selected = mockQuestions(questions, count, categories, weights);
      if (!selected.length) {
        setError("少なくとも1つの分野の比率を1以上にしてください。");
        return;
      }
      const s: Session = {
        id: crypto.randomUUID(),
        mode: "mock",
        questionIds: selected.map((q) => q.id),
        questionVersions: Object.fromEntries(
          selected.map((q) => [q.id, q.version]),
        ),
        index: 0,
        startedAt: Date.now(),
        updatedAt: Date.now(),
        answers: {},
        durations: {},
        flags: [],
        status: "active",
        timeLimitMs: minutes * 60000,
        deadline: Date.now() + minutes * 60000,
        ...(selected.length < count
          ? {
              notice: `出題対象が不足しているため${selected.length}問で開始しました。`,
            }
          : {}),
      };
      await db.studySessions.add(s);
      navigate(`/session/${s.id}`);
    } catch {
      setError("試験を保存できません。再試行してください。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="MOCK EXAM"
        title="模擬試験"
        description="学んだ知識を、時間を意識して確かめよう。"
      />
      <section className="card panel setup-panel">
        <h2>
          <ClipboardCheck />
          試験の設定
        </h2>
        <p className="muted">
          試験中は正解を表示しません。終了後にまとめて採点します。未回答も未克服問題として記録します。
        </p>
        <div className="form-grid">
          <label>
            問題数
            <select value={count} onChange={(e) => setCount(+e.target.value)}>
              {[5, 10, 20, 30, 40, 50].map((n) => (
                <option key={n} value={n}>
                  {n}問
                </option>
              ))}
            </select>
          </label>
          <label>
            制限時間
            <select
              value={minutes}
              onChange={(e) => setMinutes(+e.target.value)}
            >
              {[5, 10, 20, 30, 45, 60, 90].map((n) => (
                <option key={n} value={n}>
                  {n}分
                </option>
              ))}
            </select>
          </label>
        </div>
        <h3>分野の出題比率</h3>
        <p className="small muted">
          初期値は公式範囲の比率内です。数値を変更すると、合計で正規化して問題数を配分します。
        </p>
        {categories.map((c, i) => (
          <label className="weight-row" key={c.id}>
            <span>{c.name}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={weights[i]}
              onChange={(e) =>
                setWeights(
                  weights.map((v, j) =>
                    i === j ? Math.min(100, Math.max(0, +e.target.value)) : v,
                  ),
                )
              }
            />
            <span>%</span>
          </label>
        ))}
        <div className="setup-summary">
          <p className="muted">
            途中で一時停止・再開できます。
            <br />
            <small>アプリの正答率は公式試験スコアではありません。</small>
          </p>
          <button
            className="btn primary"
            disabled={busy}
            onClick={() => void start()}
          >
            模擬試験をはじめる
            <ArrowRight size={18} />
          </button>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    </>
  );
}
