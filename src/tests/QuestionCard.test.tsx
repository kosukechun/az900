import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QuestionCard } from "../components/QuestionCard";
import { question } from "./factories";
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);
describe("1タップ演習UI", () => {
  it("保存中も次ボタンを判定の近くに表示し、保存が終わるまで押せない", () => {
    const next = vi.fn();
    const props = {
      question,
      selected: ["A"],
      onAnswer: vi.fn(),
      onNext: next,
      bookmarked: false,
      onBookmark: vi.fn(),
    };
    const r = render(<QuestionCard {...props} nextDisabled />, { wrapper });
    const button = screen.getByRole("button", { name: "次の問題へ" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    fireEvent.keyDown(window, { key: "Enter" });
    expect(next).not.toHaveBeenCalled();
    r.rerender(<QuestionCard {...props} nextDisabled={false} />);
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(next).toHaveBeenCalledOnce();
  });
  it.each([
    ["A", "正解！"],
    ["B", "不正解 — ここで覚えよう"],
  ])("回答%sでは次ボタンを判定の近く・解説本文の前に表示", (id, result) => {
    const next = vi.fn();
    render(
      <QuestionCard
        question={question}
        onAnswer={vi.fn()}
        onNext={next}
        bookmarked={false}
        onBookmark={() => {}}
      />,
      { wrapper },
    );
    fireEvent.click(
      screen.getByRole("button", { name: id === "A" ? /A IaaS/ : /B PaaS/ }),
    );
    const resultHeading = screen.getByRole("heading", { name: result }),
      button = screen.getByRole("button", { name: "次の問題へ" });
    expect(resultHeading.parentElement).toContainElement(button);
    expect(
      button.compareDocumentPosition(screen.getByText(question.explanation)) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(button);
    expect(next).toHaveBeenCalledOnce();
  });
  it("1タップで正解・解説を即表示、回答確定ボタンなし", () => {
    const answer = vi.fn();
    render(
      <QuestionCard
        question={question}
        onAnswer={answer}
        bookmarked={false}
        onBookmark={() => {}}
      />,
      { wrapper },
    );
    expect(screen.queryByText("回答を確定")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /A IaaS/ }));
    expect(screen.getByText("正解！")).toBeInTheDocument();
    expect(screen.getByText(question.explanation)).toBeInTheDocument();
    expect(answer).toHaveBeenCalledOnce();
  });
  it("不正解では選択が赤・正答が緑、他の回答で変更不可", () => {
    const answer = vi.fn();
    render(
      <QuestionCard
        question={question}
        onAnswer={answer}
        bookmarked={false}
        onBookmark={() => {}}
      />,
      { wrapper },
    );
    const wrong = screen.getByRole("button", { name: /B PaaS/ }),
      right = screen.getByRole("button", { name: /A IaaS/ });
    fireEvent.click(wrong);
    expect(screen.getByText(/不正解 —/)).toBeInTheDocument();
    expect(wrong).toHaveClass("wrong");
    expect(right).toHaveClass("right");
    fireEvent.click(right);
    expect(answer).toHaveBeenCalledOnce();
  });
  it("二重クリックで回答イベントは1回のみ", () => {
    const answer = vi.fn();
    render(
      <QuestionCard
        question={question}
        onAnswer={answer}
        bookmarked={false}
        onBookmark={() => {}}
      />,
      { wrapper },
    );
    const b = screen.getByRole("button", { name: /A IaaS/ });
    fireEvent.click(b);
    fireEvent.click(b);
    fireEvent.doubleClick(b);
    expect(answer).toHaveBeenCalledOnce();
  });
  it("複数選択だけ確定ボタンで判定", () => {
    const answer = vi.fn();
    render(
      <QuestionCard
        question={{
          ...question,
          questionType: "multiple",
          correctOptionIds: ["A", "B"],
        }}
        onAnswer={answer}
        bookmarked={false}
        onBookmark={() => {}}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByRole("button", { name: /A IaaS/ }));
    fireEvent.click(screen.getByRole("button", { name: /B PaaS/ }));
    expect(answer).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("回答を確定"));
    expect(answer.mock.calls[0][0]).toEqual(["A", "B"]);
    expect(screen.getByText("正解！")).toBeInTheDocument();
  });
  it("模試では途中の正解・解説を非表示、回答を変更可能", () => {
    const answer = vi.fn();
    render(
      <QuestionCard
        question={question}
        mock
        onAnswer={answer}
        bookmarked={false}
        onBookmark={() => {}}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByRole("button", { name: /A IaaS/ }));
    fireEvent.click(screen.getByRole("button", { name: /B PaaS/ }));
    expect(answer).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("正解！")).not.toBeInTheDocument();
    expect(screen.queryByText(question.explanation)).not.toBeInTheDocument();
  });
  it("数字キーとEnterで進める", () => {
    const answer = vi.fn(),
      next = vi.fn();
    render(
      <QuestionCard
        question={question}
        onAnswer={answer}
        onNext={next}
        bookmarked={false}
        onBookmark={() => {}}
      />,
      { wrapper },
    );
    fireEvent.keyDown(window, { key: "1" });
    expect(answer).toHaveBeenCalledOnce();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(next).toHaveBeenCalledOnce();
  });
  it("再描画で自動遷移タイマーを延長しない", () => {
    vi.useFakeTimers();
    const next = vi.fn(),
      props = {
        question,
        selected: ["A"],
        onAnswer: vi.fn(),
        bookmarked: false,
        onBookmark: vi.fn(),
        autoAdvance: true,
        autoAdvanceSeconds: 3,
      };
    const r = render(<QuestionCard {...props} onNext={() => next()} />, {
      wrapper,
    });
    vi.advanceTimersByTime(2000);
    r.rerender(<QuestionCard {...props} onNext={() => next()} />);
    vi.advanceTimersByTime(1100);
    expect(next).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
