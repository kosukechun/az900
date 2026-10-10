import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Upload, ShieldCheck, ArrowRight } from "lucide-react";
import { db } from "../db/database";
import { useStudyData } from "../hooks/useStudyData";
import {
  exportBackup,
  importBackup,
  parseBackup,
  downloadJson,
  type Backup,
} from "../services/backup";
import { PageHeading } from "../components/ui";
import { dateKey } from "../utils/study";
import type { Settings as Preferences } from "../types";
export function Settings() {
  const d = useStudyData();
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [pending, setPending] = useState<Backup>(),
    [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge"),
    [busy, setBusy] = useState(false);
  if (!d) return <p>設定を読み込み中…</p>;
  const update = async (patch: Partial<Preferences>) => {
    try {
      await db.userSettings.put({ ...d.settings, ...patch });
      setError("");
    } catch {
      setError("設定の保存に失敗しました。もう一度変更してください。");
    }
  };
  async function backup() {
    setBusy(true);
    try {
      const b = await exportBackup();
      downloadJson(b, `az900-dojo-backup-${dateKey(Date.now())}.json`);
      setMessage("学習データのバックアップをダウンロードしました。");
      setError("");
    } catch {
      setError("バックアップに失敗しました。再試行してください。");
    } finally {
      setBusy(false);
    }
  }
  async function read(file?: File) {
    if (!file) return;
    try {
      if (file.size > 100 * 1024 * 1024)
        throw new Error("100MB以下のJSONを選択してください。");
      const parsed = parseBackup(JSON.parse(await file.text()));
      setPending(parsed);
      setMessage("");
      setError("");
    } catch {
      setPending(undefined);
      setError(
        "バックアップ形式が不正、または対応していないバージョンです。ファイルは読み込まれていません。",
      );
    }
  }
  async function restore() {
    if (!pending) return;
    if (
      restoreMode === "replace" &&
      !window.confirm(
        `既存の学習履歴${d!.attempts.length}件を置き換えます。先にバックアップしましたか？ この操作を実行しますか？`,
      )
    )
      return;
    setBusy(true);
    try {
      await importBackup(pending, restoreMode);
      setMessage(
        `復元しました。${restoreMode === "merge" ? "回答IDで重複を除外し、現在の復習状態を再計算しました。" : "既存データを置き換え、復習状態を再計算しました。"}`,
      );
      setPending(undefined);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "復元に失敗しました。既存データは変更されていません。",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="SETTINGS & BACKUP"
        title="あなたのペースで、安心して。"
        description="学習設定とデータのバックアップを管理します。"
      />
      {message && (
        <p className="success-banner" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <section className="card panel settings-panel">
        <h2>学習の設定</h2>
        <div className="form-grid">
          <label>
            テーマ
            <select
              value={d.settings.theme}
              onChange={(e) =>
                void update({ theme: e.target.value as Preferences["theme"] })
              }
            >
              <option value="system">システム設定に合わせる</option>
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
            </select>
          </label>
          <label>
            通常の問題数
            <select
              value={d.settings.questionCount}
              onChange={(e) => void update({ questionCount: +e.target.value })}
            >
              {[5, 10, 20, 30, 50, 0].map((n) => (
                <option value={n} key={n}>
                  {n ? `${n}問` : "全問題"}
                </option>
              ))}
            </select>
          </label>
          <label>
            1日の学習目標
            <select
              value={d.goal.count}
              onChange={(e) =>
                void db.studyGoals
                  .put({ id: "daily", count: +e.target.value })
                  .catch(() => setError("学習目標を保存できません。"))
              }
            >
              {[5, 10, 20, 30, 50].map((n) => (
                <option value={n} key={n}>
                  {n}問
                </option>
              ))}
            </select>
          </label>
          <label>
            自動で次の問題へ
            <select
              value={d.settings.autoAdvance ? "on" : "off"}
              onChange={(e) =>
                void update({ autoAdvance: e.target.value === "on" })
              }
            >
              <option value="off">OFF（初期設定）</option>
              <option value="on">ON</option>
            </select>
          </label>
          {d.settings.autoAdvance && (
            <label>
              解説を表示する時間
              <select
                value={d.settings.autoAdvanceSeconds}
                onChange={(e) =>
                  void update({ autoAdvanceSeconds: +e.target.value })
                }
              >
                {[3, 5, 10, 20, 30, 60].map((n) => (
                  <option value={n} key={n}>
                    {n}秒
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>
      <section className="card panel settings-panel">
        <h2>
          <ShieldCheck />
          学習データのバックアップ
        </h2>
        <p>
          履歴・進捗・模擬試験・ブックマーク・用語のお気に入り・設定・学習目標を1つのJSONに保存します。
        </p>
        <div className="button-row">
          <button
            className="btn primary"
            disabled={busy}
            onClick={() => void backup()}
          >
            <Download size={17} />
            学習データをバックアップ
          </button>
          <label className="btn secondary file-button">
            <Upload size={17} />
            学習データを復元
            <input
              type="file"
              accept=".json,application/json"
              aria-label="学習データを復元するJSONファイル"
              disabled={busy}
              onChange={(e) => {
                void read(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {pending && (
          <div className="restore-preview">
            <h3>復元内容を確認</h3>
            <p>
              {new Date(pending.createdAt).toLocaleString("ja-JP")} 作成 ·
              回答履歴 {pending.answerAttempts.length}件 · セッション{" "}
              {pending.studySessions.length}件
            </p>
            <label>
              復元方式
              <select
                value={restoreMode}
                onChange={(e) =>
                  setRestoreMode(e.target.value as "merge" | "replace")
                }
              >
                <option value="merge">既存データと統合（IDで重複除外）</option>
                <option value="replace">既存データを置き換える</option>
              </select>
            </label>
            <div className="button-row">
              <button
                className="btn primary"
                disabled={busy}
                onClick={() => void restore()}
              >
                {busy ? "処理中…" : "この内容で復元"}
              </button>
              <button
                className="btn secondary"
                onClick={() => setPending(undefined)}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
        <h3>PCからスマートフォンに移すには</h3>
        <ol className="steps">
          <li>PCで「学習データをバックアップ」を押す。</li>
          <li>ダウンロードしたJSONを自分のスマートフォンに送る。</li>
          <li>
            スマートフォンで同じサイトを開き「学習データを復元」で選択する。
          </li>
          <li>「統合」または「置き換え」を選び、復元する。</li>
        </ol>
        <p className="notice">
          自動同期はありません。端末・ブラウザ・サイトのURLが変わると保存先も変わります。移行にはバックアップを利用してください。
        </p>
        <p className="small muted">
          ブラウザのサイトデータ削除、シークレットモード、端末故障で記録が失われる場合があります。定期的にバックアップしてください。JSONには個人の学習記録が含まれるため、第三者への不用意な共有は避けてください。自分のPDFのファイル本体とPDF学習チェックはJSONバックアップの対象外です。別の端末では元のPDFを再度選択してください。
        </p>
      </section>
      <section className="card panel settings-panel">
        <h2>総仕上げ問題集・オフライン学習</h2>
        <p>
          総仕上げPDFはご自身の端末内だけに保存して学習できます。アプリをインストールする場合は、Chromeのアドレスバーやメニューの「インストール」、iPhoneの共有メニューの「ホーム画面に追加」を利用してください。
        </p>
        <p className="muted small">
          初回オンラインアクセス後、静的画面と問題データをキャッシュします。新バージョンは更新通知から反映できます。辞典の公式リンクなど外部ページには通信が必要です。
        </p>
        <Link className="btn secondary" to="/materials">
          総仕上げPDFで学習する
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
