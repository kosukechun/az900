import { useMemo, useState } from "react";
import { useContent } from "../context";
import { useStudyData } from "../hooks/useStudyData";
import { PageHeading, Stat, Explanation, Empty } from "../components/ui";
import { WeeklyChart, RateChart, dailyPoints } from "../components/Charts";
import { percent, streak, dateKey, modeNames } from "../utils/study";
import type { Attempt } from "../types";
export function Stats() {
  const d = useStudyData(),
    { questions, categories } = useContent();
  const [period, setPeriod] = useState("all"),
    [domain, setDomain] = useState(""),
    [result, setResult] = useState("all"),
    [mode, setMode] = useState(""),
    [selected, setSelected] = useState<string>(),
    [visible, setVisible] = useState(50);
  const filtered = useMemo(() => {
    const days = period === "today" ? 1 : Number(period),
      boundary = new Date();
    boundary.setHours(0, 0, 0, 0);
    if (days > 1) boundary.setDate(boundary.getDate() - days + 1);
    const qMap = new Map(questions.map((q) => [q.id, q]));
    return (d?.attempts ?? []).filter(
      (a) =>
        (period === "all" || a.answeredAt >= +boundary) &&
        (!domain || qMap.get(a.questionId)?.domain === domain) &&
        (result === "all" || a.isCorrect === (result === "correct")) &&
        (!mode || a.mode === mode),
    );
  }, [d?.attempts, questions, period, domain, result, mode]);
  if (!d) return <p>読み込み中…</p>;
  const correct = filtered.filter((a) => a.isCorrect).length,
    first = new Map<string, Attempt>();
  for (const a of filtered)
    if (!first.has(a.questionId)) first.set(a.questionId, a);
  const last50 = filtered.slice(-50),
    unresolved = d.progress.filter((p) => p.isUnresolved).length,
    overcome = d.progress.filter(
      (p) => p.wrongCount > 0 && !p.isUnresolved,
    ).length;
  const domainStats = categories.map((c) => {
    const ids = new Set(
      questions.filter((q) => q.domain === c.id).map((q) => q.id),
    );
    const attempts = filtered.filter((a) => ids.has(a.questionId));
    return {
      name: c.name,
      total: attempts.length,
      rate: percent(
        attempts.filter((a) => a.isCorrect).length,
        attempts.length,
      ),
    };
  });
  const mockSessions = d.sessions.filter(
    (s) =>
      s.mode === "mock" &&
      s.status === "completed" &&
      filtered.some((a) => a.sessionId === s.id),
  );
  const mockData = mockSessions
    .slice(0, 10)
    .reverse()
    .map((s) => {
      const a = filtered.filter((a) => a.sessionId === s.id);
      return {
        day: new Date(s.completedAt!).toLocaleDateString("ja-JP", {
          month: "numeric",
          day: "numeric",
        }),
        rate: percent(a.filter((a) => a.isCorrect).length, a.length),
      };
    });
  const wrong = new Map<string, Attempt[]>();
  for (const a of filtered.filter((a) => !a.isCorrect))
    wrong.set(a.questionId, [...(wrong.get(a.questionId) ?? []), a]);
  const selectedQuestion = questions.find((q) => q.id === selected);
  const weekData = Array.from({ length: 8 }, (_, i) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - (7 - i) * 7);
    const start = new Date(+end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return {
      day: `${start.getMonth() + 1}/${start.getDate()}`,
      rate: filtered.filter(
        (a) => a.answeredAt >= +start && a.answeredAt <= +end,
      ).length,
    };
  });
  return (
    <>
      <PageHeading
        eyebrow="YOUR PROGRESS"
        title="学びの足跡を、次の一歩に。"
        description="回答のたびに記録される、あなたの成長。履歴と今の復習状態を分けて確認できます。"
      />
      <div className="card filter-row stats-filters">
        <label>
          期間
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="all">全期間</option>
            <option value="today">今日</option>
            <option value="7">過去7日</option>
            <option value="30">過去30日</option>
          </select>
        </label>
        <label>
          分野
          <select value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="">すべて</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          結果
          <select value={result} onChange={(e) => setResult(e.target.value)}>
            <option value="all">すべて</option>
            <option value="correct">正解のみ</option>
            <option value="wrong">不正解のみ</option>
          </select>
        </label>
        <label>
          モード
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">すべて</option>
            {Object.entries(modeNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="stats-grid">
        <Stat label="総回答数" value={`${filtered.length}問`} />
        <Stat
          label="総正答 / 総不正解"
          value={`${correct} / ${filtered.length - correct}`}
        />
        <Stat
          label="累計正答率"
          value={
            filtered.length ? `${percent(correct, filtered.length)}%` : "—"
          }
        />
        <Stat
          label="初回正答率"
          value={
            first.size
              ? `${percent([...first.values()].filter((a) => a.isCorrect).length, first.size)}%`
              : "—"
          }
          note="表示範囲内の各問題の最初の回答"
        />
        <Stat
          label="直近50問の正答率"
          value={
            last50.length
              ? `${percent(last50.filter((a) => a.isCorrect).length, last50.length)}%`
              : "—"
          }
        />
        <Stat
          label="未克服 / 克服済み"
          value={`${unresolved} / ${overcome}`}
          note="現在の状態・全期間"
        />
        <Stat
          label="総学習時間"
          value={`${Math.round(filtered.reduce((n, a) => n + a.durationMs, 0) / 60000)}分`}
        />
        <Stat
          label="連続学習日数"
          value={`${streak(d.attempts)}日`}
          note="全期間"
        />
      </div>
      <div className="dashboard-grid">
        <section className="card panel">
          <h2>日別回答数</h2>
          <WeeklyChart attempts={filtered} />
        </section>
        <section className="card panel">
          <h2>日別正答率（直近30日）</h2>
          <RateChart data={dailyPoints(filtered, 30)} />
        </section>
        <section className="card panel">
          <h2>週別学習推移（回答数）</h2>
          <RateChart data={weekData} label="回答数" />
        </section>
        <section className="card panel">
          <h2>模擬試験の推移</h2>
          {mockData.length ? (
            <RateChart data={mockData} />
          ) : (
            <p className="inline-empty muted">
              模擬試験が完了すると表示されます。
            </p>
          )}
        </section>
      </div>
      <section className="card panel section-space">
        <h2>分野別正答率・苦手分野ランキング</h2>
        {[...domainStats]
          .sort((a, b) => a.rate - b.rate)
          .map((s, i) => (
            <div className="domain-progress" key={s.name}>
              <div>
                <span className="domain-number">{i + 1}</span>
                <span>{s.name}</span>
                <strong>{s.total ? s.rate + "%" : "未回答"}</strong>
              </div>
              <div className="progress-track">
                <div style={{ width: s.rate + "%" }} />
              </div>
              <small className="muted">{s.total}回答</small>
            </div>
          ))}
      </section>
      <section className="card panel section-space">
        <h2>過去に間違えた問題</h2>
        {[...wrong].map(([id, attempts]) => {
          const q = questions.find((q) => q.id === id);
          return (
            q && (
              <button
                className="wrong-history"
                key={id}
                onClick={() => setSelected(selected === id ? undefined : id)}
              >
                <span>{q.questionText}</span>
                <strong>{attempts.length}回</strong>
                <small>
                  {attempts
                    .map((a) =>
                      new Date(a.answeredAt).toLocaleDateString("ja-JP"),
                    )
                    .join(" / ")}
                </small>
              </button>
            )
          );
        })}
        {!wrong.size && (
          <p className="muted">この条件に該当する間違い履歴はありません。</p>
        )}
        {selectedQuestion && (
          <>
            <Explanation question={selectedQuestion} showResult={false} />
            <h3>この問題の全回答履歴</h3>
            <ul className="attempt-list">
              {d.attempts
                .filter((a) => a.questionId === selected)
                .reverse()
                .map((a) => (
                  <li key={a.id}>
                    <span>
                      {new Date(a.answeredAt).toLocaleString("ja-JP")}
                    </span>
                    <span
                      className={a.isCorrect ? "success-text" : "danger-text"}
                    >
                      {a.isCorrect ? "正解" : "不正解"}
                    </span>
                    <span>
                      選択 {a.selectedOptionIds.join(", ") || "未回答"}
                    </span>
                  </li>
                ))}
            </ul>
          </>
        )}
      </section>
      <section className="card panel section-space">
        <h2>回答履歴</h2>
        {filtered.length ? (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>日時</th>
                    <th>問題</th>
                    <th>結果</th>
                    <th>モード / 時間</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice(-visible)
                    .reverse()
                    .map((a) => (
                      <tr key={a.id}>
                        <td>
                          {new Date(a.answeredAt).toLocaleString("ja-JP")}
                        </td>
                        <td>
                          <button
                            className="text-link"
                            onClick={() => setSelected(a.questionId)}
                          >
                            {a.questionId}
                          </button>
                        </td>
                        <td
                          className={
                            a.isCorrect ? "success-text" : "danger-text"
                          }
                        >
                          {a.isCorrect ? "正解" : "不正解"}
                        </td>
                        <td>
                          {modeNames[a.mode]} ·{" "}
                          {(a.durationMs / 1000).toFixed(1)}秒
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {filtered.length > visible && (
              <button
                className="btn secondary"
                onClick={() => setVisible(visible + 50)}
              >
                さらに50件表示
              </button>
            )}
          </>
        ) : (
          <Empty title="学習記録はまだありません">
            <p>問題を解くと成績がここに表示されます。</p>
          </Empty>
        )}
      </section>
    </>
  );
}
