# 問題データの出典・編集記録

確認日: 2026-10-10（Asia/Tokyo）

## 収録内容

独自に作成した日本語127問を、`public/data/questions/` の3つのJSONへ収録した。

| ファイル | 分野 | 問題数 |
| --- | --- | ---: |
| cloud-concepts.json | クラウドの概念 | 34 |
| azure-services.json | Azureのアーキテクチャとサービス | 53 |
| management-governance.json | Azureの管理とガバナンス | 40 |

このうち4問は複数選択。各問に問題ID、バージョン、選択肢ごとの解説、覚えるポイント、関連用語ID、Microsoft公式の参考URL、独自作成の表示、ライセンス、確認日を記録した。公式試験の出題内容を再現・保証する問題集ではない。

## 試験範囲の確認

[MicrosoftのAZ-900学習ガイド](https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/az-900)を実装中に確認した。現行ページは2026年7月20日版を示している。クラウド25–30%、アーキテクチャとサービス35–40%、管理とガバナンス30–35%の3分野を基準とする。掲載問題数の割合と模擬試験の抽出比率は別に扱う。

公式教材には試験範囲外の補足も含まれるため、教材に載っているだけで必須出題と判断しない。価格の具体的金額、特定リージョンの対応サービス一覧、無料枠の数など、変更されやすい詳細の暗記問題は避けた。旧名称のAzure ADはMicrosoft Entra IDとの対応を説明する用途に限定した。TCO計算ツールは現行教材で終了が案内されているため、現行の利用可能ツールとして出題しない。

## 提供されたリンク集の確認と再利用判断

`AZ900_sources_2026-10-10.md` と `.json` をUTF-8で確認した。リンク集の注意書きどおり、公開閲覧できることと問題本文を再配布できることは区別した。

| 資料の種類 | この実装での扱い |
| --- | --- |
| Microsoft Learnの説明・公式サービス文書 | 事実照合と参考リンクに利用。問題文や選択肢を転載せず独自執筆 |
| Microsoft公式の練習用評価 | 問題の取得・転載をしていない |
| 再転載許諾が未確認の問題サイトやPDF | 問題の取得・転載をしていない |
| MIT表記のGitHub教材 | 本文の再利用をしていないため、そのライセンスを本問題集へ流用しない |
| AGPL表記の問題データ | 本文の再利用をしていない |
| 試験流出問題を含む可能性がある資料 | 収集・転載対象にしない |

独自執筆の問題・解説データに設定した `CC-BY-4.0` は、このプロジェクトで新規作成した表現の利用条件を示す。リンク先のMicrosoft教材や第三者資料に同じライセンスを付与するものではない。帰属表示は「AZ-900版 道場 オリジナル問題」、このリポジトリへのリンク、ライセンスへのリンクを含め、変更時は変更した旨を表示する。ライセンス本文は[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)を参照。

追加提供の総仕上げ問題集 `mogimondai.pdf` は、ユーザーが個人学習に使用する資料として扱う。購入・所有していることだけをGitHub Pagesへの全文転載の許諾と解釈しない。この問題バンクにはPDF本文、選択肢、図版、解答表をコピーしていない。アプリ側の学習資料機能は別の実装で管理する。

## 事実照合の公式参照

下記の公式教材の本文またはサービス文書をブラウズして、出題する定義・役割・相違点を確認した。各JSONにはその問題に関係する具体的な本文ページへのURLを記録している。リンクの将来的な存続や将来のサービス仕様は保証しない。

| 照合した範囲 | 公式参照 |
| --- | --- |
| クラウドの定義、展開モデル、責任共有、従量課金 | [クラウドコンピューティング](https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/) |
| 可用性、スケーリング、信頼性、予測可能性、ガバナンス、管理 | [クラウドの利点](https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/) |
| IaaS、PaaS、SaaSと責任の分担 | [サービスモデル](https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/) |
| リージョン、ゾーン、ペア、ソブリン、管理階層 | [Azureの基本構造](https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/) |
| VM、Scale Sets、可用性セット、Desktop、コンテナー、Functions、App Service | [コンピューティング](https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/) |
| VNet、サブネット、ピアリング、NSG | [Virtual Network](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview) |
| 拠点間・個別端末の暗号化VPN接続 | [VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways) |
| 公共インターネットを経由しない接続 | [ExpressRoute](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction) |
| DNSのホスティングと名前解決 | [Azure DNS](https://learn.microsoft.com/en-us/azure/dns/dns-overview) |
| VNet内のプライベートIPでのサービス接続 | [Private Endpoint](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview) |
| アカウント、Blob、Files、Queue、Table、Disks、アクセス層、冗長性、移行、ファイル移動 | [Azure Storage](https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/) |
| Entra ID・Domain Services・外部ID、MFA、SSO、パスワードレス、条件付きアクセス、RBAC、ゼロトラスト、多層防御、Defender | [IDとセキュリティ](https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/) |
| 見積もり、コスト分析、予算、タグ、予約、Savings plan、Spot | [コスト管理](https://learn.microsoft.com/en-us/training/modules/describe-cost-management-azure/) |
| Purview、Policy、イニシアティブ、リソースロック | [ガバナンス](https://learn.microsoft.com/en-us/training/modules/describe-features-tools-azure-for-governance-compliance/) |
| AuditとDenyの効果、評価順、既存資源への影響 | [Policy効果](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics) |
| CanNotDelete、ReadOnly、管理面とデータ面 | [リソースロックの詳細](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources) |
| portal、Cloud Shell、CLI、PowerShell、Arc、ARM、IaC | [管理・配置ツール](https://learn.microsoft.com/en-us/training/modules/describe-features-tools-manage-deploy-azure-resources/) |
| Advisor、Monitor、Log Analytics、Application Insights、各Health機能 | [監視ツール](https://learn.microsoft.com/en-us/training/modules/describe-monitoring-tools-azure/) |

## 誤解を避けるために確認した点

- 全リージョンに従来のリージョンペアがあるとは表現しない。ペアがあっても全サービスが自動複製・自動切替するとは限らない。
- 可用性ゾーンはリージョン内、地理冗長性は別リージョンを含む。GRSなどの地理複製は非同期で最新データに差が生じ得る。
- パブリッククラウドの「パブリック」は、自社データが匿名公開される意味ではない。
- サーバーレスはサーバーの不存在や無条件無料を意味しない。Functionsの課金や実行条件はプランにより異なる。
- PaaS・SaaSでも利用者のデータ・ID・アクセス管理責任は残る。
- ExpressRouteのプライベート接続は暗号化の要件と別。VPN Gatewayは暗号化トンネルで公共インターネットを利用できる。
- プライベートエンドポイントの作成だけで、すべてのサービスの公開アクセスが停止するとはしない。
- タグはリソースグループから無条件に自動継承されない。
- 予算アラートだけで、すべての資源が自動停止するとはしない。
- リソースロックは主に管理面の操作に適用される。データ操作のすべてを防ぐものではない。
- ロールとスコープによる操作権限管理（RBAC）と、構成ルール（Policy）を区別する。

## 更新と検証

静的JSONがアプリの読込元であり、問題追加のためにアプリ本体の変更は不要。新規問題は既存IDを変更せず追加し、内容修正時はその問題の `version` を増やす。

`scripts/author-question-bank.py` は初期問題集の編集元を保存した再生成用スクリプトである。現行JSONへ別のインポートで追加した問題を上書きするので、通常の問題追加では実行しないこと。独立した開発者向けJSON/CSVインポートと検証はアプリの管理スクリプトを使用する。

初期生成時にID、問題文の一意性、正答IDと選択肢IDの整合性、全選択肢の解説の存在を確認した。関連用語IDは用語辞典と照合する。編集後はさらにアプリのコンテンツ検証と自動テストを実行する。確認日は永続的な正確性の保証ではないため、公式試験範囲や製品名称の変更時には再確認する。
