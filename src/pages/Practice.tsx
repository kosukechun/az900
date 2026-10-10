import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Layers3 } from "lucide-react";
import { db } from "../db/database";
import { useStudyData } from "../hooks/useStudyData";
import { useContent } from "../context";
import type { Mode, Session } from "../types";
import { selectQuestions, modeNames } from "../utils/study";
import { PageHeading } from "../components/ui";
export function Practice({ domainPage = false }: { domainPage?: boolean }) {
  const d = useStudyData(),
    { questions, categories } = useContent();
  const [params] = useSearchParams(),
    navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(domainPage ? "domain" : "random"),
    [domain, setDomain] = useState(params.get("domain") ?? ""),
    [subcategory, setSubcategory] = useState(""),
    [count, setCount] = useState(10),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const launched = useRef(false);
  useEffect(() => {
    if (d && !launched.current) setCount(d.settings.questionCount);
  }, [d]);
  const pool = d
    ? selectQuestions(
        questions,
        mode,
        0,
        d.progress,
        d.bookmarks.map((b) => b.id),
        domain,
        subcategory,
      )
    : [];
  async function start(quick?: Mode, questionId?: string) {
    if (!d || busy) return;
    setBusy(true);
    try {
      let selected = questionId
        ? questions.filter((q) => q.id === questionId)
        : selectQuestions(
            questions,
            quick ?? mode,
            quick === "unresolved" ? 0 : quick ? 10 : count,
            d.progress,
            d.bookmarks.map((b) => b.id),
            quick ? "" : domain,
            quick ? "" : subcategory,
            quick === "daily" ? seededDailyRandom() : Math.random,
          );
      if (!selected.length) {
        setError("出題できる問題がありません。条件を変更してください。");
        return;
      }
      const requested = quick === "unresolved" ? 0 : quick ? 10 : count;
      const s: Session = {
        id: crypto.randomUUID(),
        mode: questionId ? "individual" : (quick ?? mode),
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
        ...(requested && selected.length < requested
          ? {
              notice: `条件に合う問題は${selected.length}問です。指定の${requested}問から減らして出題します。`,
            }
          : {}),
      };
      await db.studySessions.add(s);
      navigate(`/session/${s.id}`);
    } catch {
      setError(
        "セッションを保存できません。ブラウザの保存領域を確認して再試行してください。",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (
      d &&
      !launched.current &&
      (params.has("quick") || params.has("question"))
    ) {
      launched.current = true;
      const quick = params.get("quick");
      void start(
        quick === "daily"
          ? "daily"
          : quick === "unresolved"
            ? "unresolved"
            : quick === "random"
              ? "random"
              : undefined,
        params.get("question") ?? undefined,
      );
    }
  }, [d, params]);
  return (
    <>
      <PageHeading
        eyebrow="PRACTICE"
        title={domainPage ? "分野別演習" : "問題演習"}
        description="1タップで回答、すぐに解説。あなたのペースで理解を深めよう。"
      />
      {domainPage && (
        <div className="domain-cards">
          {categories.map((c, i) => (
            <button
              className={`card domain-choice ${domain === c.id ? "selected" : ""}`}
              key={c.id}
              onClick={() => {
                setDomain(c.id);
                setSubcategory("");
              }}
            >
              <span className="eyebrow">DOMAIN 0{i + 1}</span>
              <h3>{c.name}</h3>
              <small>
                {questions.filter((q) => q.domain === c.id).length}問 · 公式比率{" "}
                {["25–30", "35–40", "30–35"][i]}%
              </small>
            </button>
          ))}
        </div>
      )}
      <section className="card panel setup-panel">
        <div className="section-title">
          <h2>
            <Layers3 size={22} />
            演習の設定
          </h2>
          <span className="chip">登録不要</span>
        </div>
        <div className="form-grid">
          <label>
            出題モード
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
            >
              {Object.entries(modeNames)
                .filter(
                  ([key]) => !["mock", "individual", "daily"].includes(key),
                )
                .map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label>
            分野
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setSubcategory("");
              }}
            >
              <option value="">すべての分野</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            テーマ
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              <option value="">すべてのテーマ</option>
              {[
                ...new Set(
                  questions
                    .filter((q) => !domain || q.domain === domain)
                    .map((q) => q.subcategory),
                ),
              ]
                .sort()
                .map((s) => (
                  <option key={s}>{s}</option>
                ))}
            </select>
          </label>
          <label>
            問題数
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {[5, 10, 20, 30, 50, 0].map((n) => (
                <option value={n} key={n}>
                  {n ? `${n}問` : "全問題"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="setup-summary">
          <p>
            <strong>{pool.length}問</strong> が出題対象です。
            <br />
            <small className="muted">
              同じセッション内では重複出題しません。
            </small>
          </p>
          <button
            className="btn primary"
            onClick={() => void start()}
            disabled={busy || !pool.length}
          >
            {busy ? "準備中…" : "演習をはじめる"}
            <ArrowRight size={18} />
          </button>
        </div>
        {!!count && pool.length < count && (
          <p className="notice">
            指定は{count}問ですが、出題対象の{pool.length}問で開始します。
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
      <div className="card panel learning-tip">
        <h3>小さな習慣、大きな理解。</h3>
        <p className="muted">
          間違えても大丈夫。最新の回答が正解になった問題は未克服リストから自動で外れます。過去の回答履歴はそのまま残ります。
        </p>
        <Link className="text-link" to="/review">
          復習リストを開く
          <ArrowRight size={15} />
        </Link>
      </div>
    </>
  );
}
function seededDailyRandom() {
  let seed = Number(new Date().toLocaleDateString("sv-SE").replaceAll("-", ""));
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
