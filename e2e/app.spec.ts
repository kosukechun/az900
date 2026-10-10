import { test, expect, chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});
const data = JSON.parse(
  fs.readFileSync("public/data/questions/cloud-concepts.json", "utf8"),
);
const q = data[0],
  right = q.correctOptionIds[0],
  wrong = q.options.find(
    (o: { id: string }) => !q.correctOptionIds.includes(o.id),
  ).id;
async function readStore(page: Page, store: string) {
  return page.evaluate(async (store) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("az900-dojo");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    return await new Promise<any[]>((resolve, reject) => {
      const r = database.transaction(store).objectStore(store).getAll();
      r.onsuccess = () => {
        database.close();
        resolve(r.result);
      };
      r.onerror = () => reject(r.error);
    });
  }, store);
}
async function answerIndividual(page: Page, optionId: string) {
  await page.goto(`./#/practice?question=${q.id}`);
  await expect(page.locator(".question-text")).toHaveText(q.questionText);
  await expect(page.getByText(/指定の10問から減らして出題/)).toHaveCount(0);
  await page
    .locator(".option")
    .filter({
      has: page.locator(".option-letter", {
        hasText: new RegExp(`^${optionId}$`),
      }),
    })
    .click();
  await expect(page.getByText("✓ このブラウザに保存済み")).toBeVisible();
}
test("初回ホームとランダム10問、同一セッションで重複なし", async ({ page }) => {
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "今日も、一歩ずつ。" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "ランダム10問をはじめる" }).click();
  await expect(page.locator(".question-text")).toBeVisible();
  const sessions = await readStore(page, "studySessions");
  expect(sessions).toHaveLength(1);
  expect(sessions[0].questionIds).toHaveLength(10);
  expect(new Set(sessions[0].questionIds).size).toBe(10);
});
test("不正解→正解→不正解→正解、履歴は4件、現在未克服0件", async ({ page }) => {
  for (const [i, opt] of [wrong, right, wrong, right].entries()) {
    await answerIndividual(page, opt);
    await expect
      .poll(async () => (await readStore(page, "answerAttempts")).length)
      .toBe(i + 1);
    const progress = await readStore(page, "questionProgress");
    expect(progress[0].isUnresolved).toBe(i % 2 === 0);
    await page.goto("./#/");
  }
  await page.goto("./#/review");
  await expect(
    page.getByText("未克服の問題はありません", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "過去に間違えた問題（1）" }).click();
  await expect(
    page.getByRole("heading", { name: q.questionText }),
  ).toBeVisible();
  expect((await readStore(page, "answerAttempts")).length).toBe(4);
});
test("1タップ即時解説・二重クリック防止・Enterで次へ", async ({ page }) => {
  await page.goto(`./#/practice?question=${q.id}`);
  const option = page.locator(".option").filter({
    has: page.locator(".option-letter", {
      hasText: new RegExp(`^${right}$`),
    }),
  });
  await option.dblclick({ force: true });
  await expect(page.getByText("正解！", { exact: true })).toBeVisible();
  await expect(page.getByText(q.explanation, { exact: true })).toBeVisible();
  await expect
    .poll(async () => (await readStore(page, "answerAttempts")).length)
    .toBe(1);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "おつかれさまでした！" }),
  ).toBeVisible();
  await page.reload();
  expect((await readStore(page, "answerAttempts")).length).toBe(1);
});
test("分野別5問・未回答モード・不足の案内", async ({ page }) => {
  await page.goto("./#/domains");
  await page.getByRole("checkbox", { name: /Azureの管理とガバナンス/ }).check();
  await page
    .getByRole("combobox", { name: "問題数", exact: true })
    .selectOption("5");
  await page.getByRole("button", { name: "演習をはじめる" }).click();
  await expect(page.locator(".question-text")).toBeVisible();
  const sessions = await readStore(page, "studySessions"),
    management = JSON.parse(
      fs.readFileSync(
        "public/data/questions/management-governance.json",
        "utf8",
      ),
    );
  expect(
    sessions[0].questionIds.every((id: string) =>
      management.some((q: { id: string }) => q.id === id),
    ),
  ).toBe(true);
  expect(sessions[0].questionIds).toHaveLength(5);
  await page.goto("./#/practice");
  await page
    .getByRole("combobox", { name: "出題モード", exact: true })
    .selectOption("unanswered");
  await page.getByRole("button", { name: "すべての分野", exact: true }).click();
  await page.getByRole("checkbox", { name: /クラウドの概念/ }).check();
  await page
    .getByRole("combobox", { name: "問題数", exact: true })
    .selectOption("50");
  await expect(page.getByText(/指定は50問ですが/)).toBeVisible();
});
test("複数選択のみ確定操作を要求", async ({ page }) => {
  const multi = data.find(
    (q: { questionType: string }) => q.questionType === "multiple",
  );
  expect(multi).toBeTruthy();
  await page.goto(`./#/practice?question=${multi.id}`);
  await expect(page.getByRole("button", { name: "回答を確定" })).toBeDisabled();
  for (const id of multi.correctOptionIds)
    await page
      .locator(".option")
      .filter({
        has: page.locator(".option-letter", { hasText: new RegExp(`^${id}$`) }),
      })
      .click();
  expect(await readStore(page, "answerAttempts")).toHaveLength(0);
  await page.getByRole("button", { name: "回答を確定" }).click();
  await expect(page.getByText("正解！", { exact: true })).toBeVisible();
});
test("複数分野・複数テーマを組み合わせた全問出題と条件解除", async ({
  page,
}) => {
  const services = JSON.parse(
    fs.readFileSync("public/data/questions/azure-services.json", "utf8"),
  );
  const chosenThemes = [data[0].subcategory, services[0].subcategory];
  await page.goto("./#/practice");
  await page.getByRole("checkbox", { name: /クラウドの概念/ }).check();
  await page
    .getByRole("checkbox", { name: /Azureのアーキテクチャとサービス/ })
    .check();
  const themeGroup = page.getByRole("group", { name: "テーマ複数選択可" });
  for (const theme of chosenThemes)
    await themeGroup.getByRole("checkbox", { name: new RegExp(theme) }).check();
  await expect(
    page.getByRole("checkbox", { name: /クラウドの概念/ }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: /Azureのアーキテクチャとサービス/ }),
  ).toBeChecked();
  await page
    .getByRole("combobox", { name: "問題数", exact: true })
    .selectOption("0");
  await page.getByRole("button", { name: "演習をはじめる" }).click();
  await expect(page.locator(".question-text")).toBeVisible();
  const expected = [...data, ...services]
    .filter((q) => chosenThemes.includes(q.subcategory))
    .map((q) => q.id)
    .sort();
  const sessions = await readStore(page, "studySessions");
  expect(sessions[0].questionIds.slice().sort()).toEqual(expected);
  expect(new Set(sessions[0].questionIds).size).toBe(expected.length);
  await page.goto("./#/practice");
  await page
    .getByRole("checkbox", { name: /Azureのアーキテクチャとサービス/ })
    .check();
  await themeGroup
    .getByRole("checkbox", { name: new RegExp(chosenThemes[1]) })
    .check();
  await page.getByRole("checkbox", { name: /クラウドの概念/ }).check();
  await page
    .getByRole("checkbox", { name: /Azureのアーキテクチャとサービス/ })
    .uncheck();
  await expect(
    themeGroup.getByRole("checkbox", { name: new RegExp(chosenThemes[1]) }),
  ).toHaveCount(0);
  await expect(
    page.getByText("選択した分野に含まれないテーマを解除しました。"),
  ).toBeVisible();
  await page.getByRole("button", { name: "すべての分野", exact: true }).click();
  await page
    .getByRole("button", { name: "すべてのテーマ", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "すべての分野", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
for (const label of ["正解", "不正解"])
  test(`${label}の判定の近くに次ボタンがあり、長い解説までスクロールせず進める`, async ({
    page,
  }) => {
    await page.goto("./#/practice");
    await page
      .getByRole("combobox", { name: "問題数", exact: true })
      .selectOption("5");
    await page.getByRole("button", { name: "演習をはじめる" }).click();
    await expect(page.locator(".question-text")).toBeVisible();
    const files = JSON.parse(
      fs.readFileSync("public/data/question-files.json", "utf8"),
    );
    const bank = files.flatMap((f: string) =>
      JSON.parse(fs.readFileSync(`public/data/questions/${f}`, "utf8")),
    );
    const text = await page.locator(".question-text").innerText();
    const displayed = bank.find(
      (item: { questionText: string }) => item.questionText === text,
    );
    expect(displayed).toBeTruthy();
    const optionIds =
      label === "正解"
        ? displayed.correctOptionIds
        : [
            displayed.options.find(
              (o: { id: string }) => !displayed.correctOptionIds.includes(o.id),
            ).id,
          ];
    for (const width of [1440, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      if (width === 1440) {
        for (const optionId of optionIds)
          await page
            .locator(".option")
            .filter({
              has: page.locator(".option-letter", {
                hasText: new RegExp(`^${optionId}$`),
              }),
            })
            .click();
        if (displayed.questionType === "multiple")
          await page.getByRole("button", { name: "回答を確定" }).click();
      }
      const heading = page.getByRole("heading", {
          name: label === "正解" ? "正解！" : "不正解 — ここで覚えよう",
          exact: true,
        }),
        button = page.getByRole("button", { name: "次の問題へ" });
      await expect(button).toBeVisible();
      const h = (await heading.boundingBox())!,
        b = (await button.boundingBox())!;
      expect(Math.abs(b.y - h.y)).toBeLessThan(90);
      expect(b.y).toBeLessThan(
        (await page
          .getByRole("heading", { name: "解説", exact: true })
          .boundingBox())!.y,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.getByRole("button", { name: "次の問題へ" }).click();
    await expect(page.locator(".session-progress")).toContainText("第 2 問");
  });
test("復習まとめ出題は未克服だけ・克服後は対象から外れる", async ({ page }) => {
  await answerIndividual(page, wrong);
  await page.goto("./#/review");
  await page.getByRole("link", { name: "未克服問題をまとめて復習" }).click();
  await expect(page.locator(".question-text")).toHaveText(q.questionText);
  const sessions = await readStore(page, "studySessions");
  expect(sessions.find((s) => s.mode === "unresolved").questionIds).toEqual([
    q.id,
  ]);
  await page
    .locator(".option")
    .filter({
      has: page.locator(".option-letter", {
        hasText: new RegExp(`^${right}$`),
      }),
    })
    .click();
  await expect(page.getByText("✓ このブラウザに保存済み")).toBeVisible();
  expect((await readStore(page, "questionProgress"))[0].isUnresolved).toBe(
    false,
  );
});
test("模試の解説非表示・見直し・一時停止復元・採点重複なし", async ({
  page,
}) => {
  await page.goto("./#/mock");
  await page
    .getByRole("combobox", { name: "問題数", exact: true })
    .selectOption("5");
  await page.getByRole("button", { name: "模擬試験をはじめる" }).click();
  await expect(page.locator(".question-text")).toBeVisible();
  await page.locator(".option").first().click();
  await expect(page.locator(".explanation")).toHaveCount(0);
  expect(await readStore(page, "answerAttempts")).toHaveLength(0);
  await page.getByRole("button", { name: "見直しマーク", exact: true }).click();
  await page.getByRole("button", { name: "一時停止", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "試験を一時停止しています" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "試験を一時停止しています" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "試験を再開", exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "試験終了", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "おつかれさまでした！" }),
  ).toBeVisible();
  expect(await readStore(page, "answerAttempts")).toHaveLength(5);
  await page.reload();
  expect(await readStore(page, "answerAttempts")).toHaveLength(5);
  await page.locator("summary").first().click();
  await expect(page.locator(".explanation").first()).toBeVisible();
});
test("用語検索・お気に入り・問題から辞典を開いて戻る", async ({ page }) => {
  await page.goto("./#/glossary");
  await page.getByLabel("用語を検索").fill("IaaS");
  const iaas = page.locator(".term-card").filter({
    has: page.getByRole("heading", {
      name: "Infrastructure as a Service",
      exact: true,
    }),
  });
  await expect(iaas).toBeVisible();
  await iaas.getByRole("button", { name: /お気に入りに追加/ }).click();
  await iaas.locator(".term-open").click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.getByRole("button", { name: "問題に戻る", exact: true }).click();
  expect(await readStore(page, "glossaryBookmarks")).toHaveLength(1);
  await answerIndividual(page, right);
  if (q.relatedTermIds.length) {
    await page.locator(".explanation .chips button").first().click();
    await expect(page.locator("dialog")).toBeVisible();
    await page.getByRole("button", { name: "辞典を閉じて問題に戻る" }).click();
    await expect(page.getByText("正解！", { exact: true })).toBeVisible();
  }
});
test("バックアップを実際にダウンロードし統合復元、無効なJSON拒否", async ({
  page,
}, info) => {
  await answerIndividual(page, wrong);
  await page.goto("./#/settings");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "学習データをバックアップ", exact: true })
    .click();
  const download = await downloadPromise,
    file = info.outputPath("backup.json");
  await download.saveAs(file);
  const b = JSON.parse(fs.readFileSync(file, "utf8"));
  expect(b.answerAttempts).toHaveLength(1);
  await page.getByLabel("学習データを復元するJSONファイル").setInputFiles(file);
  await expect(
    page.getByRole("heading", { name: "復元内容を確認" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "この内容で復元" }).click();
  await expect(page.getByText(/復元しました。/)).toBeVisible();
  expect(await readStore(page, "answerAttempts")).toHaveLength(1);
  await page.getByLabel("学習データを復元するJSONファイル").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(page.getByRole("alert")).toContainText("バックアップ形式が不正");
  expect(await readStore(page, "answerAttempts")).toHaveLength(1);
});
test("ブラウザプロセスを終了・再起動後も履歴とセッションを復元", async ({}, info) => {
  const dir = info.outputPath("browser-profile"),
    base = info.project.use.baseURL!;
  let context = await chromium.launchPersistentContext(dir, {
    headless: true,
    serviceWorkers: "block",
  });
  let page = await context.newPage();
  await page.goto(`${base}#/practice?question=${q.id}`);
  await page.locator(".option").first().click();
  await expect(page.getByText("✓ このブラウザに保存済み")).toBeVisible();
  await context.close();
  context = await chromium.launchPersistentContext(dir, {
    headless: true,
    serviceWorkers: "block",
  });
  page = await context.newPage();
  await page.goto(base);
  await expect(
    page.getByRole("link", { name: /前回の続きから/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: /前回の続きから/ }).click();
  await expect(page.locator(".explanation")).toBeVisible();
  expect(await readStore(page, "answerAttempts")).toHaveLength(1);
  await context.close();
});
test("改訂前の回答済み演習と中断模試をバックアップ復元して続行できる", async ({
  page,
}) => {
  const now = Date.now(),
    id = "Q043",
    s = (sid: string, mode: string) => ({
      id: sid,
      mode,
      questionIds: [id],
      questionVersions: { [id]: 1 },
      index: 0,
      startedAt: now,
      updatedAt: now,
      answers: { [id]: ["C"] },
      durations: { [id]: 1000 },
      flags: [],
      status: "active",
      ...(mode === "mock"
        ? { timeLimitMs: 2700000, pausedRemainingMs: 2700000 }
        : {}),
    });
  const backup = {
    format: "az900-dojo",
    version: 1,
    createdAt: new Date().toISOString(),
    answerAttempts: [
      {
        id: `legacy-practice:${id}`,
        questionId: id,
        questionVersion: 1,
        answeredAt: now,
        selectedOptionIds: ["C"],
        isCorrect: true,
        durationMs: 1000,
        mode: "random",
        sessionId: "legacy-practice",
      },
    ],
    questionProgress: [],
    studySessions: [s("legacy-practice", "random"), s("legacy-mock", "mock")],
    bookmarks: [],
    glossaryBookmarks: [],
    userSettings: [],
    studyGoals: [],
  };
  await page.goto("./#/settings");
  await page
    .getByLabel("学習データを復元するJSONファイル")
    .setInputFiles({
      name: "legacy.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
  await page.getByRole("button", { name: "この内容で復元" }).click();
  await expect(page.getByText(/復元しました。/)).toBeVisible();
  await page.goto("./#/session/legacy-practice");
  await expect(page.getByText("正解！", { exact: true })).toBeVisible();
  await expect(
    page.getByText("問題が更新されています", { exact: true }),
  ).toHaveCount(0);
  expect(await readStore(page, "answerAttempts")).toHaveLength(1);
  await page.goto("./#/session/legacy-mock");
  await expect(
    page.getByRole("heading", { name: "試験を一時停止しています" }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "試験終了", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "おつかれさまでした！" }),
  ).toBeVisible();
  const attempts = await readStore(page, "answerAttempts");
  expect(attempts).toHaveLength(2);
  expect(attempts.every((a) => a.isCorrect && a.questionVersion === 1)).toBe(
    true,
  );
});
test("PWA初回キャッシュ後、オフライン再読み込みで演習できる", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "今日も、一歩ずつ。" }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "今日も、一歩ずつ。" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "ランダム10問をはじめる" }).click();
  await expect(page.locator(".question-text")).toBeVisible();
  await page.locator(".option").first().click();
  await expect(page.locator(".explanation")).toBeVisible();
});
test("回答の保存失敗を即表示し再試行後に1件だけ保存", async ({ page }) => {
  await page.goto(`./#/practice?question=${q.id}`);
  await expect(page.locator(".question-text")).toBeVisible();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function (
      ...args: Parameters<typeof original>
    ) {
      if (this.name === "answerAttempts") {
        IDBObjectStore.prototype.add = original;
        throw new DOMException("Test quota", "QuotaExceededError");
      }
      return original.apply(this, args);
    };
  });
  await page.locator(".option").first().click();
  await expect(page.locator(".explanation")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("保存に失敗");
  expect(await readStore(page, "answerAttempts")).toHaveLength(0);
  await page.getByRole("button", { name: "保存を再試行" }).click();
  await expect(page.getByText("✓ このブラウザに保存済み")).toBeVisible();
  expect(await readStore(page, "answerAttempts")).toHaveLength(1);
});
test("模試の期限超過で自動採点、結果時間を再読み込み後も保持", async ({
  page,
}) => {
  await page.goto("./#/mock");
  await page
    .getByRole("combobox", { name: "問題数", exact: true })
    .selectOption("5");
  await page.getByRole("button", { name: "模擬試験をはじめる" }).click();
  await expect(page.locator(".question-text")).toBeVisible();
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const r = indexedDB.open("az900-dojo");
      r.onsuccess = () => resolve(r.result);
    });
    await new Promise<void>((resolve) => {
      const tx = database.transaction("studySessions", "readwrite"),
        store = tx.objectStore("studySessions"),
        r = store.getAll();
      r.onsuccess = () => {
        const s = r.result[0];
        store.put({ ...s, deadline: Date.now() - 1000 });
      };
      tx.oncomplete = () => {
        database.close();
        resolve();
      };
    });
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "おつかれさまでした！" }),
  ).toBeVisible();
  expect(await readStore(page, "answerAttempts")).toHaveLength(5);
  const s = (await readStore(page, "studySessions"))[0];
  expect(s.elapsedMs).toBe(s.timeLimitMs);
  await page.reload();
  expect(await readStore(page, "answerAttempts")).toHaveLength(5);
});
test("ダークモード設定と問題ブックマークを再読み込み後に保持", async ({
  page,
}) => {
  await answerIndividual(page, right);
  await page
    .getByRole("button", { name: "ブックマークに追加", exact: true })
    .click();
  await page.goto("./#/bookmarks");
  await expect(
    page.getByRole("heading", { name: q.questionText }),
  ).toBeVisible();
  await page.goto("./#/settings");
  await page
    .getByRole("combobox", { name: "テーマ", exact: true })
    .selectOption("dark");
  await expect(page.locator("html")).toHaveClass("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveClass("dark");
  expect(await readStore(page, "bookmarks")).toHaveLength(1);
});
test("自分のPDFを追加し再読み込みで復元（外部送信なし）", async ({ page }) => {
  await page.goto("./#/materials");
  await page.getByLabel("総仕上げPDFを選択").setInputFiles({
    name: "private.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF",
    ),
  });
  await expect(page.getByText("private.pdf", { exact: true })).toBeVisible();
  await page.locator(".pdf-checks button").first().click();
  await expect(page.getByText(/1 \/ 40問チェック済み/)).toBeVisible();
  await page.reload();
  await expect(page.getByText("private.pdf", { exact: true })).toBeVisible();
  await expect(page.getByText(/1 \/ 40問チェック済み/)).toBeVisible();
});
for (const width of [320, 375, 430, 768, 1024, 1440])
  test(`画面幅${width}pxで主要画面・長い解説に横スクロールなし`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "",
      "practice",
      "review",
      "mock",
      "glossary",
      "stats",
      "settings",
      "materials",
    ]) {
      await page.goto(`./#/${route}`);
      await expect(page.locator("main")).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        )
        .toBe(true);
    }
    await answerIndividual(page, wrong);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    if (width === 1440) {
      await page.goto("./");
      await page.screenshot({
        path: info.outputPath("home-desktop.png"),
        fullPage: true,
      });
    }
    if (width === 375) {
      await page.goto("./");
      await page.screenshot({
        path: info.outputPath("home-mobile.png"),
        fullPage: true,
      });
    }
  });
