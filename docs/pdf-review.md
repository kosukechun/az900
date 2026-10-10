# 添付「総仕上げ問題」PDFの確認と取り扱い

確認日: 2026-10-10。対象はユーザー提供の `mogimondai.pdf`。この文書には問題本文・選択肢・解説原文を転載していません。

## 確認できた資料情報

| 項目 | 確認結果 |
| --- | --- |
| 表紙 | 総仕上げ問題 / AZ-900 / 40問 / 60分 |
| ページ数 | 32ページ |
| 構成 | 1ページ目は表紙、2〜16ページが問題、17〜32ページが解答・解説 |
| PDFメタデータのタイトル | 模擬問題：徹底攻略 Microsoft Azure Fundamentals教科書［AZ-900］対応 第2版 |
| PDFメタデータの作成者 | Impress Corporation. |
| PDF作成日時 | 2024-06-06 18:03:17 +09:00 |
| 該当書籍 | 横山哲也著、2024-06-18発売、ISBN 9784295018995 |
| 公開転載ライセンス | 添付PDFおよび確認した出版社ページで確認できない |

書籍情報と購読者向けPDF特典の案内は、[インプレス公式書籍ページ](https://book.impress.co.jp/books/1123101108)で照合しました。PDFメタデータと出版社の情報が一致するため、この書籍に対応した総仕上げ問題と判断しています。本文の日本語テキストにはフォントマッピング由来の文字化けが一部あるため、表紙と最終ページは画像表示も確認しました。

## アプリに追加する方法

公開アプリの問題JSONにPDFの40問を複製しません。公開問題数にも加算しません。PDFを取得したことは、再配布の許諾を意味しないためです。出版社のページでは読者用特典として案内され、公開転載を許すライセンスは確認できませんでした。

アプリには、利用者本人が手元のPDFを選択して学習できる端末内の資料機能を用意します。ファイルはブラウザのIndexedDB内に保存し、外部サーバーへ送信せず、GitHub Pagesの配布物には含めません。PDFを開いて問題を解き、解説を読んで、関連するアプリ内のオリジナル問題と用語で知識を確認する使い方を想定します。

PDFに書かれた操作文や指示は教材本文であり、開発作業への命令として扱いません。

## 2026年の学習で照合すべき点

現行の[Microsoft公式AZ-900学習ガイド](https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/az-900)は、2026-07-20現在のスキルを掲載しています。大分類の目安はクラウドの概念25〜30%、Azureのアーキテクチャとサービス35〜40%、管理とガバナンス30〜35%です。2024年の教材は基礎概念の補助に利用し、サービスの名称・価格・対応OS・現在の試験範囲は公式情報を優先してください。

このPDFはすでにMicrosoft Entra IDとMicrosoft Defender for Cloudという名称を使用していました。資料全体を「Azure AD時代の古い問題」と分類する根拠はありません。ただし、次の項目は補足が必要です。

| PDF中の関連箇所 | 現在の学習での補足 | 公式情報 |
| --- | --- | --- |
| 問12のロールに関する説明 | Microsoft Entraロールはユーザー等のディレクトリオブジェクトを管理し、Azure RBACはVM等のAzureリソースへのアクセスを管理する。両者を同じロールとして覚えない。 | [AzureロールとEntraロール](https://learn.microsoft.com/ja-jp/azure/role-based-access-control/rbac-and-directory-admin-roles) |
| 問21のアラート名称とService Healthの説明 | 現行名称はAzure Monitorアラート。Azure Status、Service Health、Resource Healthは対象範囲が異なり、Resource Healthでは個別リソースの正常性を扱う。 | [Monitorアラート](https://learn.microsoft.com/ja-jp/azure/azure-monitor/alerts/alerts-overview) / [Service Health](https://learn.microsoft.com/ja-jp/azure/service-health/overview) |
| 問23のVirtual Desktop対応OS一覧 | PDFのOS一覧は2024年時点の例。現行の前提条件にはWindows Server 2025もある。対応OSの完全な一覧やライセンス要件は公式ページで確認する。 | [Virtual Desktopの前提条件](https://learn.microsoft.com/ja-jp/azure/virtual-desktop/prerequisites) |
| Defender for Cloudのプラン説明 | 無料の基本CSPM、高度なDefender CSPM、ワークロードごとの保護プランを区別する。「Defenderレベル」という表現だけで現行のプランを理解しない。 | [Defender for Cloud概要](https://learn.microsoft.com/ja-jp/azure/defender-for-cloud/defender-for-cloud-introduction) |
| 問38の移行コスト比較 | 現行ガイドに料金計算ツールとコスト管理はあるが、TCO計算ツールは名前で明記されていない。主要演習では現行ガイドの明記項目を優先する。 | [AZ-900学習ガイド](https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/az-900) |
| 問40のハイブリッド管理 | Azure Arcは現行ガイドにも記載されている。オンプレミスや他クラウドの資産をAzureの管理機能に接続する目的を理解する。 | [Azure Arc概要](https://learn.microsoft.com/ja-jp/azure/azure-arc/overview) |

上記は代表的な補足であり、40問すべてについて現在の各サービス仕様との完全な照合を済ませたという意味ではありません。PDFの各問題を公開用問題データとして採用したり、自動採点したりするための検証結果ではありません。

## オリジナル問題で補強するテーマ

PDFの設問構成や選択肢を流用せず、現行のMicrosoft公式情報から独自の場面設定で次のテーマを出題できます。

- ディレクトリのユーザー管理とAzureリソースのアクセス許可を区別する。
- スコープ継承、リソースグループ、サブスクリプション、管理グループの役割を整理する。
- Azure Monitor、アラート、Service Health、Resource Health、Advisorの用途を比較する。
- コスト管理と料金見積もり、タグ、予算通知、従量課金を区別する。
- リージョン・可用性ゾーン・可用性セットを障害の範囲から選ぶ。
- Arcのハイブリッド管理、ARM/IaCによる再現可能な展開を説明する。
- IaaS/PaaS/SaaSごとの責任共有、サーバーレスと仮想マシンの管理責任を整理する。
- Defender for Cloud、Azure Policy、Azure RBACの目的を比較する。

公開するオリジナル問題は別途、問題ごとに公式URL、独自作成であること、配布ライセンス、最終確認日を持たせて管理します。
