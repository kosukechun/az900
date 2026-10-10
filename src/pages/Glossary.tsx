import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Bookmark, ArrowRight } from "lucide-react";
import { useContent } from "../context";
import { useStudyData } from "../hooks/useStudyData";
import { db } from "../db/database";
import { PageHeading, Empty } from "../components/ui";
import { TermDialog } from "../components/TermDialog";
const comparisons = [
  {
    title: "IaaS / PaaS / SaaS",
    headers: ["モデル", "利用者が主に管理", "例"],
    rows: [
      ["IaaS", "OS・ミドルウェア・アプリ", "Azure Virtual Machines"],
      ["PaaS", "アプリ・データ", "Azure App Service"],
      ["SaaS", "データ・アクセス設定", "Microsoft 365"],
    ],
  },
  {
    title: "パブリック / プライベート / ハイブリッド",
    headers: ["モデル", "特徴", "主な用途"],
    rows: [
      ["パブリック", "事業者が運用し複数の顧客に提供", "素早いリソース調達"],
      ["プライベート", "単一組織専用のクラウド", "専用環境の要件"],
      ["ハイブリッド", "両者を接続して利用", "段階的移行・要件の使い分け"],
    ],
  },
  {
    title: "リージョン / 可用性ゾーン",
    headers: ["用語", "単位", "役割"],
    rows: [
      ["リージョン", "地理的な地域", "データ配置・災害分離"],
      [
        "可用性ゾーン",
        "リージョン内の独立した設備群",
        "電源・冷却・ネットワーク障害を分離",
      ],
    ],
  },
  {
    title: "RBAC / Azure Policy",
    headers: ["用語", "管理対象", "例"],
    rows: [
      ["RBAC", "誰が何を操作できるか", "閲覧者を割り当てる"],
      [
        "Azure Policy",
        "リソースが条件に適合するか",
        "特定リージョン以外の作成を拒否",
      ],
    ],
  },
  {
    title: "Azure Monitor / Azure Advisor",
    headers: ["用語", "目的", "例"],
    rows: [
      ["Azure Monitor", "メトリック・ログ収集と監視", "CPU使用率のアラート"],
      ["Azure Advisor", "構成を分析し改善を提案", "使用率の低いVMの見直し"],
    ],
  },
];
export function Glossary() {
  const { terms, categories } = useContent(),
    d = useStudyData();
  const [params, setParams] = useSearchParams(),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [favorites, setFavorites] = useState(false),
    [compare, setCompare] = useState(false),
    [error, setError] = useState("");
  const term = params.get("term"),
    bookmarkIds = new Set(d?.glossaryBookmarks.map((b) => b.id));
  const normalized = search.normalize("NFKC").toLocaleLowerCase().trim(),
    filtered = terms.filter(
      (t) =>
        (!category || t.category === category) &&
        (!favorites || bookmarkIds.has(t.id)) &&
        `${t.japaneseName} ${t.englishName} ${t.abbreviation} ${t.summary}`
          .normalize("NFKC")
          .toLocaleLowerCase()
          .includes(normalized),
    );
  return (
    <>
      <PageHeading
        eyebrow="AZURE DICTIONARY"
        title="あやふやを、わかったに。"
        description={`${terms.length}語のAzure用語を、やさしい日本語で。問題の解説からも開けます。`}
      />
      <div className="card glossary-search">
        <Search size={21} />
        <label className="sr-only" htmlFor="term-search">
          用語を検索
        </label>
        <input
          id="term-search"
          placeholder="用語・英語・略称で検索（例：IaaS、リージョン）"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="filter-row">
        <label>
          分野
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">すべての分野</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className={`btn secondary ${favorites ? "selected" : ""}`}
          aria-pressed={favorites}
          onClick={() => setFavorites(!favorites)}
        >
          <Bookmark size={16} />
          お気に入りのみ
        </button>
        <button
          className={`btn secondary ${compare ? "selected" : ""}`}
          onClick={() => setCompare(!compare)}
        >
          用語を比較
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {compare && (
        <section className="card panel">
          <h2>混同しやすい用語を比較</h2>
          {comparisons.map((c) => (
            <div className="comparison" key={c.title}>
              <h3>{c.title}</h3>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {c.headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((v, i) => (
                          <td key={i}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}
      <p className="muted small">{filtered.length}語が見つかりました</p>
      <div className="glossary-grid">
        {filtered.map((t) => (
          <article className="card term-card" key={t.id}>
            <div className="question-meta">
              <span className="tiny-badge">
                {categories.find((c) => c.id === t.category)?.name}
                {t.examScope === "supplementary" && " · 補足"}
              </span>
              <button
                className={`icon-btn ${bookmarkIds.has(t.id) ? "bookmarked" : ""}`}
                aria-label={`${t.englishName}を${bookmarkIds.has(t.id) ? "お気に入りから解除" : "お気に入りに追加"}`}
                onClick={() =>
                  void Promise.resolve(
                    bookmarkIds.has(t.id)
                      ? db.glossaryBookmarks.delete(t.id)
                      : db.glossaryBookmarks.put({
                          id: t.id,
                          createdAt: Date.now(),
                        }),
                  ).catch(() =>
                    setError(
                      "お気に入りの保存に失敗しました。再試行してください。",
                    ),
                  )
                }
              >
                <Bookmark
                  size={17}
                  fill={bookmarkIds.has(t.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            <button
              className="term-open"
              onClick={() => setParams({ term: t.id })}
            >
              <h3>{t.englishName}</h3>
              <span className="muted small">
                {t.japaneseName}
                {t.abbreviation ? ` / ${t.abbreviation}` : ""}
              </span>
              <p>{t.summary}</p>
              <span className="text-link">
                詳しく読む
                <ArrowRight size={14} />
              </span>
            </button>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty title="該当する用語がありません">
          <p>検索語や分野を変更してください。</p>
        </Empty>
      )}
      {term && (
        <TermDialog
          id={term}
          onClose={() => setParams({})}
          onNavigate={(id) => setParams({ term: id })}
        />
      )}
    </>
  );
}
