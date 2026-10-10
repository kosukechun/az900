import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useContent } from "../context";
export function TermDialog({
  id,
  onClose,
  onNavigate,
}: {
  id: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const { terms } = useContent();
  const t = terms.find((t) => t.id === id);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const d = ref.current;
    return () => {
      d?.close();
    };
  }, []);
  if (!t) return null;
  return (
    <dialog className="term-dialog" ref={ref} onCancel={onClose}>
      <button
        className="icon-btn close-dialog"
        aria-label="辞典を閉じて問題に戻る"
        onClick={onClose}
      >
        <X />
      </button>
      <p className="eyebrow">AZURE DICTIONARY</p>
      <h2>{t.englishName}</h2>
      <p className="muted">
        {t.japaneseName} {t.abbreviation && `/ ${t.abbreviation}`}
      </p>
      <p className="term-summary">{t.summary}</p>
      <h3>詳しい説明</h3>
      <p>{t.description}</p>
      <h3>使用例</h3>
      <p>{t.example}</p>
      <div className="key-point">
        <strong>覚えるポイント</strong>
        <p>{t.keyPoint}</p>
      </div>
      <div className="chips">
        {t.relatedTermIds.map((id) => {
          const related = terms.find((t) => t.id === id);
          return (
            related && (
              <button className="chip" key={id} onClick={() => onNavigate(id)}>
                {related.abbreviation || related.englishName}
              </button>
            )
          );
        })}
      </div>
      <a
        className="source"
        href={t.officialUrl}
        target="_blank"
        rel="noreferrer"
      >
        公式資料を読む ↗
      </a>
      <button className="btn secondary full" onClick={onClose}>
        問題に戻る
      </button>
    </dialog>
  );
}
