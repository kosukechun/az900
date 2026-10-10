import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { FileUp, ExternalLink, FileText } from "lucide-react";
import { db } from "../db/database";
import { PageHeading } from "../components/ui";
export function Materials() {
  const material = useLiveQuery(
    () => db.privateMaterials.get("mogimondai"),
    [],
  );
  const [url, setUrl] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (!material) return;
    const u = URL.createObjectURL(material.file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [material?.addedAt]);
  async function load(file?: File) {
    if (!file) return;
    try {
      if (
        file.size > 50 * 1024 * 1024 ||
        new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()) !==
          "%PDF-"
      )
        throw new Error("50MB以下のPDFを選択してください。");
      await db.privateMaterials.put({
        id: "mogimondai",
        name: file.name,
        file,
        addedAt: Date.now(),
        page: 1,
        checkedQuestions: [],
      });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDFを保存できません。");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR STUDY MATERIALS"
        title="総仕上げ問題集で学ぶ"
        description="自分のPDFを開いて、40問の総仕上げに取り組もう。"
      />
      <section className="card panel">
        <h2>
          <FileText size={22} />
          手元の教材を追加
        </h2>
        <p>
          「mogimondai.pdf」を選択してください。PDFはこの端末のIndexedDBにだけ保存され、外部へ送信されません。次回もこの画面から開けます。
        </p>
        <p className="muted small">
          インプレスの2024年版教材です。最新範囲との違いに注意してください。公開転載の許諾が確認できないため、PDFの問題を公開問題データには含めていません。PDFは自動採点の対象外です。
        </p>
        <label className="btn primary file-button">
          <FileUp size={17} />
          {material ? "PDFを選び直す" : "総仕上げPDFを追加"}
          <input
            type="file"
            accept=".pdf,application/pdf"
            aria-label="総仕上げPDFを選択"
            onChange={(e) => {
              void load(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {material && (
          <>
            <div className="filter-row section-space">
              <strong>{material.name}</strong>
              <label>
                再開ページ
                <input
                  type="number"
                  value={material.page}
                  min="1"
                  max="999"
                  onChange={(e) =>
                    void db.privateMaterials
                      .update("mogimondai", {
                        page: Math.max(1, Math.min(999, +e.target.value)),
                      })
                      .catch(() => setError("再開ページを保存できません。"))
                  }
                />
              </label>
              <a
                className="btn secondary"
                href={`${url}#page=${material.page}`}
                target="_blank"
                rel="noreferrer"
              >
                別タブで読む
                <ExternalLink size={15} />
              </a>
            </div>
            <iframe
              className="pdf-viewer"
              src={`${url}#page=${material.page}`}
              title="自分の総仕上げ問題集PDF"
            />
            <p className="small muted">
              PDF表示に対応していないブラウザは「別タブで読む」を使用してください。問題は2〜16ページ、解答は17〜32ページです。
            </p>
            <h3>40問の学習チェック</h3>
            <p className="muted small">
              解説を確認し理解できた問題をチェックします。通常演習の回答履歴とは別に保存します。
              {material.checkedQuestions?.length ?? 0} / 40問チェック済み
            </p>
            <div className="question-map pdf-checks">
              {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={
                    material.checkedQuestions?.includes(n) ? "answered" : ""
                  }
                  aria-pressed={!!material.checkedQuestions?.includes(n)}
                  onClick={() => {
                    const old = material.checkedQuestions ?? [];
                    void db.privateMaterials
                      .update("mogimondai", {
                        checkedQuestions: old.includes(n)
                          ? old.filter((v) => v !== n)
                          : [...old, n],
                      })
                      .catch(() => setError("学習チェックを保存できません。"));
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
      </section>
      <section className="card panel section-space">
        <h2>2026年の知識で補足しよう</h2>
        <p>
          Azure RBACとMicrosoft Entraロールは管理対象が異なります。Azure
          Monitor・Service Health・Resource
          Healthは監視対象を区別しましょう。サービスの対応OS、プラン、価格は変更されることがあります。
        </p>
        <a
          className="source"
          href="https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/az-900"
          target="_blank"
          rel="noreferrer"
        >
          現行の公式試験範囲を確認 ↗
        </a>
        <a
          className="source"
          href="https://book.impress.co.jp/books/1123101108"
          target="_blank"
          rel="noreferrer"
        >
          教材の出版社ページ ↗
        </a>
      </section>
    </>
  );
}
