import { it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePersistenceQueue } from "../hooks/usePersistenceQueue";
it("保存失敗時は後続操作も保持し、再試行で順番どおり保存", async () => {
  const completed: string[] = [],
    first = vi
      .fn()
      .mockRejectedValueOnce(new Error("quota"))
      .mockImplementation(async () => {
        completed.push("first");
      }),
    second = async () => {
      completed.push("second");
    };
  const { result } = renderHook(usePersistenceQueue);
  await act(async () => {
    result.current.enqueue(first);
    result.current.enqueue(second);
    await result.current.queue.current;
  });
  expect(result.current.error).toContain("保存に失敗");
  expect(completed).toEqual([]);
  await act(async () => {
    result.current.enqueue(result.current.retry.current!);
    await result.current.queue.current;
  });
  expect(result.current.error).toBe("");
  expect(completed).toEqual(["first", "second"]);
  expect(first).toHaveBeenCalledTimes(2);
});
