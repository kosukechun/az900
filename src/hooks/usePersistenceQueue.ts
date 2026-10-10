import { useCallback, useRef, useState } from "react";
type Operation = () => Promise<unknown>;
/** Preserve failed and subsequent operations until an explicit retry succeeds. */
export function usePersistenceQueue() {
  const operations = useRef<Operation[]>([]),
    running = useRef(false),
    retry = useRef<Operation>(),
    queue = useRef(Promise.resolve());
  const [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const enqueue = useCallback((operation: Operation) => {
    const isRetry = operation === retry.current;
    if (!isRetry) operations.current.push(operation);
    if (running.current || (retry.current && !isRetry)) return;
    running.current = true;
    setSaving(true);
    queue.current = (async () => {
      while (operations.current.length) {
        const current = operations.current[0];
        try {
          await current();
          operations.current.shift();
          retry.current = undefined;
          setError("");
        } catch {
          retry.current = current;
          setError("保存に失敗しました。次へ進む前に再試行してください。");
          break;
        }
      }
      running.current = false;
      setSaving(false);
    })();
  }, []);
  return { saving, error, setError, enqueue, queue, retry, setSaving };
}
