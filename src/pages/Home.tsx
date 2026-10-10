import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Flame,
  Layers3,
  RotateCcw,
  ClipboardCheck,
  BookOpen,
  CheckCircle2,
  Target,
  Cloud,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useStudyData } from "../hooks/useStudyData";
import { useContent } from "../context";
import { dateKey, percent, streak, modeNames } from "../utils/study";
import { PageHeading, Stat } from "../components/ui";
import { WeeklyChart } from "../components/Charts";
export function Home() {
  const d = useStudyData();
  const { questions, categories } = useContent();
  if (!d) return <p role="status">学習記録を読み込んでいます…</p>;
  const today = d.attempts.filter(
      (a) => dateKey(a.answeredAt) === dateKey(Date.now()),
    ),
    right = d.attempts.filter((a) => a.isCorrect).length,
    unresolved = d.progress.filter((p) => p.isUnresolved),
    active = d.sessions.find((s) => s.status === "active"),
    recommended = unresolved
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 3);
  const now = new Date(),
    week = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];
  return (
    <>
      <PageHeading
        eyebrow={`${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${week}曜日`}
        title="今日も、一歩ずつ。"
        description="Azure Fundamentals 合格を目指そう"
        action={
          <span className="streak-badge">
            <Flame size={18} />
            {streak(d.attempts)}日連続学習
          </span>
        }
      />
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">
            <Sparkles size={14} />
            毎日の10問が、あなたの力になる
          </span>
          <h2>
            知識を積み重ねて、
            <br />
            Azureを自分のものに。
          </h2>
          <p>
            1タップで回答。すぐに解説。
            <br />
            間違えた問題を、次の「わかった」につなげよう。
          </p>
          <div className="hero-actions">
            <Link className="btn white" to="/practice?quick=random">
              ランダム10問をはじめる
              <ArrowRight size={18} />
            </Link>
            <Link className="hero-link" to="/practice?quick=daily">
              今日のチャレンジ
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <small>
            {questions.length}問の独自問題 · 登録不要 · 学習記録は端末内に保存
          </small>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="cloud-art">
            <Cloud size={88} strokeWidth={1.5} />
          </div>
          <div className="floating floating-a">
            <CheckCircle2 size={20} />
            <span>ひとつずつ、確実に。</span>
          </div>
          <div className="floating floating-b">
            <ShieldCheck size={22} />
            <span>AZ-900</span>
          </div>
          <i className="art-dot dot-a" />
          <i className="art-dot dot-b" />
        </div>
      </section>
      <div className="stats-grid">
        <Stat
          label="今日の回答数"
          value={
            <>
              {today.length}
              <em>問</em>
            </>
          }
          note={`1日の目標 ${d.goal.count}問`}
        />
        <Stat
          label="今日の正答率"
          value={
            today.length
              ? `${percent(today.filter((a) => a.isCorrect).length, today.length)}%`
              : "—"
          }
          note={
            today.length
              ? `${today.filter((a) => a.isCorrect).length}問正解`
              : "最初の1問からはじめよう"
          }
        />
        <Stat
          label="累計回答数"
          value={
            <>
              {d.attempts.length}
              <em>問</em>
            </>
          }
          note={`累計正答率 ${d.attempts.length ? percent(right, d.attempts.length) + "%" : "—"}`}
        />
        <Stat
          label="未克服の問題"
          value={
            <>
              {unresolved.length}
              <em>問</em>
            </>
          }
          note="次に正解すると自動で克服"
        />
      </div>
      {active && (
        <Link className="resume-banner" to={`/session/${active.id}`}>
          <span>
            <strong>前回の続きから</strong>
            <small>
              {modeNames[active.mode]} · {active.index + 1} /{" "}
              {active.questionIds.length}問
            </small>
          </span>
          <ArrowRight size={20} />
        </Link>
      )}
      <div className="section-title">
        <h2>学び方を選ぶ</h2>
        <Link to="/practice">
          すべての演習モード
          <ArrowRight size={15} />
        </Link>
      </div>
      <div className="mode-grid">
        {[
          {
            icon: Layers3,
            title: "分野別演習",
            desc: "テーマを絞って、理解を深める",
            to: "/domains",
            color: "blue",
          },
          {
            icon: RotateCcw,
            title: "間違えた問題を復習",
            desc: `未克服の${unresolved.length}問を、得意に変える`,
            to: "/review",
            color: "orange",
          },
          {
            icon: ClipboardCheck,
            title: "模擬試験",
            desc: "時間を意識して、実力をチェック",
            to: "/mock",
            color: "purple",
          },
          {
            icon: BookOpen,
            title: "Azure用語辞典",
            desc: "あやふやな用語を、その場で確認",
            to: "/glossary",
            color: "green",
          },
        ].map((m) => (
          <Link className="mode-card card" to={m.to} key={m.title}>
            <span className={`mode-icon ${m.color}`}>
              <m.icon size={23} />
            </span>
            <h3>{m.title}</h3>
            <p className="muted">{m.desc}</p>
            <ArrowUpRight className="mode-arrow" size={18} />
          </Link>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="card panel">
          <div className="section-title">
            <h2>分野別の理解度</h2>
            <Link to="/stats">
              成績を見る
              <ArrowRight size={14} />
            </Link>
          </div>
          {categories.map((c, i) => {
            const ids = new Set(
                questions.filter((q) => q.domain === c.id).map((q) => q.id),
              ),
              a = d.attempts.filter((a) => ids.has(a.questionId)),
              rate = percent(a.filter((a) => a.isCorrect).length, a.length);
            return (
              <div className="domain-progress" key={c.id}>
                <div>
                  <span className={`domain-number domain-${i}`}>0{i + 1}</span>
                  <span>{c.name}</span>
                  <strong>{a.length ? `${rate}%` : "未回答"}</strong>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${rate}%` }} />
                </div>
                <small className="muted">
                  {a.length}回答 · 未克服{" "}
                  {unresolved.filter((p) => ids.has(p.questionId)).length}問
                </small>
              </div>
            );
          })}
        </section>
        <section className="card panel">
          <div className="section-title">
            <h2>今週の学習</h2>
            <span className="chip">直近7日</span>
          </div>
          <WeeklyChart attempts={d.attempts} />
          <div className="goal-note">
            <Target size={17} />
            <span>
              今日の目標 {Math.min(today.length, d.goal.count)} / {d.goal.count}
              問
            </span>
            <Link to="/settings">変更</Link>
          </div>
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="card panel">
          <div className="section-title">
            <h2>最近の学習履歴</h2>
            <Link to="/stats">
              すべて見る
              <ArrowRight size={14} />
            </Link>
          </div>
          {!d.attempts.length ? (
            <div className="inline-empty">
              <BookOpen size={25} />
              <p>
                まだ学習記録がありません。
                <br />
                <small>最初の1問から、ここに学びの足跡が残ります。</small>
              </p>
            </div>
          ) : (
            d.sessions.slice(0, 4).map((s) => (
              <Link className="history-row" key={s.id} to={`/session/${s.id}`}>
                <span className="history-icon">
                  <Layers3 size={18} />
                </span>
                <span>
                  <strong>{modeNames[s.mode]}</strong>
                  <small>
                    {new Date(s.startedAt).toLocaleString("ja-JP")} ·{" "}
                    {Object.keys(s.answers).length} / {s.questionIds.length}問
                  </small>
                </span>
                <span className="chip">
                  {s.status === "active" ? "学習中" : "完了"}
                </span>
              </Link>
            ))
          )}
        </section>
        <section className="card panel">
          <div className="section-title">
            <h2>今日のおすすめ復習</h2>
            <RotateCcw size={18} />
          </div>
          {recommended.length ? (
            recommended.map((p) => {
              const q = questions.find((q) => q.id === p.questionId);
              return (
                q && (
                  <Link
                    className="recommend-row"
                    key={p.questionId}
                    to={`/practice?question=${q.id}`}
                  >
                    <span>{q.questionText}</span>
                    <ArrowRight size={16} />
                  </Link>
                )
              );
            })
          ) : (
            <div className="inline-empty">
              <CheckCircle2 size={25} />
              <p>
                {d.attempts.length
                  ? "未克服の問題はありません！"
                  : "復習の準備はできています。"}
                <br />
                <small>間違えた問題は自動でここに集まります。</small>
              </p>
            </div>
          )}
          <Link className="text-link" to="/materials">
            総仕上げ問題集（自分のPDF）を開く
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </>
  );
}
