# 用語辞典の作成・確認記録

確認日: 2026-10-10

## 収録内容

`public/data/glossary.json` は **156語**を収録しています。分類はクラウドの概念25語、Azureのアーキテクチャとサービス85語、Azureの管理とガバナンス46語です。IDは既存の問題との連携を保つため、変更せず新しい語を追加してください。

各語は日本語名、英語名、略称、カテゴリ、一言説明、詳細説明、使用例、覚えるポイント、関連語ID、公式URL、確認日を持ちます。本文・使用例はこのアプリ向けの独自の日本語表現で作成しました。公開教材の用語説明や問題文を転載していません。

`examScope: "core"` の136語は試験ガイドの項目に直接対応する語、またはその理解に必要な基本概念です。`"supplementary"` の20語は周辺理解の補足です。**coreは実際の出題や出題頻度を保証する印ではありません。** 補足語は覚えるポイントにも「補足学習」と明示しました。

## 現行範囲

[Microsoft公式AZ-900学習ガイド](https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/az-900)を実装時に読み、ページが「2026年7月20日現在のスキル」を提示していることを確認しました。ページ上の最終更新日は2026-06-23でした。

公式の配点範囲は、クラウドの概念25–30%、アーキテクチャとサービス35–40%、管理とガバナンス30–35%です。`categories.json` の28/37/35は、この範囲内のアプリ独自の初期出題比率であり、公式の固定配点ではありません。

学習モジュールには試験ガイドに明記されない関連事項も含まれています。暗号化、Key Vault、サービスプリンシパル、Bicep、組み込みロールなどは補足として区別しました。TCO計算ツール、旧Azure Blueprints、廃止したサービスの使い方を現行の主要用語として追加することは避けています。

## 確認方法

公式の学習パス、各モジュールの対象ユニット、関連する製品ドキュメントをブラウザーで取得し、分類、機能の役割、紛らわしい差異を照合しました。特に次を確認しました。

- IaaS/PaaS/SaaSの責任範囲と、SaaSでも残るデータ・IDの管理責任。
- リージョンと可用性ゾーンの違い、すべてのリージョンにペアがあるとは限らないこと、自動複製・自動切り替えの一般化を避けること。
- Blobのホット・クール・コールドはオンライン層、アーカイブは復元を必要とする層であること。
- LRS/ZRS/GRS/GZRSとRA付きの保護範囲、地理複製が非同期であること。
- RBACの権限管理とPolicyの構成適合性、リソースロックの管理プレーンへの作用。
- 予算設定だけではリソース消費を自動停止しないこと。
- Monitorの監視、Advisorの推奨、Service Healthのサービス影響、Resource Healthの個別リソース状態の違い。
- 所有者・共同作成者・閲覧者の管理権限と、保存データへの権限との違い。

`lastVerifiedAt` は上記の公式資料との照合日です。Microsoftによる監修・認定、全製品構成の実機検証、価格やSLAの保証を表すものではありません。記述は基礎学習の範囲に絞っています。価格数値、細かなSKU制限、SLA数値は将来変わるため固定値を載せていません。公式URLにアクセスすると追加認証の案内が表示される資料もありますが、本文が取得できるものを参照しました。

## 出典と再利用

提供されたリンク集 `AZ900_sources_2026-10-10.md/json` の方針（無料公開と転載許諾は別、定義は独自に記述）に従い、Microsoftの公式資料を事実確認に使いました。リンク先のサイト、GitHub、PDFに含まれる既存の用語集をコピーしていません。追加の問題集PDFからの転載可否や問題への反映は、別途問題資料の監査記録を参照してください。

公式資料の文章や図版を再利用する場合は、当該資料の利用条件を個別に確認してください。本辞典の独自文言の利用条件はリポジトリ全体のライセンスに従います。各語の `officialUrl` は本文の根拠を確認する入口であり、その資料の転載ライセンスを示すものではありません。

## 参照した公式資料

学習範囲と各サービスの基礎は次の学習パスに従っています。

- [クラウドの概念](https://learn.microsoft.com/ja-jp/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/)
- [Azureのアーキテクチャとサービス](https://learn.microsoft.com/ja-jp/training/paths/azure-fundamentals-describe-azure-architecture-services/)
- [Azureの管理とガバナンス](https://learn.microsoft.com/ja-jp/training/paths/describe-azure-management-governance/)

各語から参照する具体的な公式資料は以下です。

- [資料1](https://learn.microsoft.com/ja-jp/training/modules/describe-core-architectural-components-of-azure/)
- [資料2](https://learn.microsoft.com/ja-jp/training/modules/describe-cloud-compute/)
- [資料3](https://learn.microsoft.com/ja-jp/training/modules/describe-cloud-service-types/)
- [資料4](https://learn.microsoft.com/ja-jp/training/modules/describe-benefits-use-cloud-services/)
- [資料5](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-redundancy)
- [資料6](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-compute-networking-services/2-virtual-machines)
- [資料7](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-compute-networking-services/4-virtual-desktop)
- [資料8](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-compute-networking-services/5-containers)
- [資料9](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-compute-networking-services/7-describe-application-hosting-options)
- [資料10](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-compute-networking-services/6-functions)
- [資料11](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-networking-services/2-virtual-network)
- [資料12](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-networking-services/5-domain-name-system)
- [資料13](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-networking-services/3-virtual-private-networks)
- [資料14](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-networking-services/4-expressroute)
- [資料15](https://learn.microsoft.com/ja-jp/azure/load-balancer/load-balancer-overview)
- [資料16](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-storage-services/4-describe-azure-storage-services)
- [資料17](https://learn.microsoft.com/ja-jp/azure/storage/blobs/access-tiers-overview)
- [資料18](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-storage-services/7-identify-azure-file-movement-options)
- [資料19](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-storage-services/6-identify-azure-data-migration-options)
- [資料20](https://learn.microsoft.com/ja-jp/azure/storage/blobs/lifecycle-management-overview)
- [資料21](https://learn.microsoft.com/ja-jp/azure/backup/backup-overview)
- [資料22](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/2-directory-services)
- [資料23](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/3-authentication-methods)
- [資料24](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/6-role-based-access-control)
- [資料25](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/4-external-identities)
- [資料26](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/5-conditional-access)
- [資料27](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/7-describe-zero-trust-model)
- [資料28](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/8-describe-defense-depth)
- [資料29](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/9-describe-microsoft-defender-for-cloud)
- [資料30](https://learn.microsoft.com/ja-jp/training/modules/describe-azure-identity-access-security/9a-describe-encryption-key-management)
- [資料31](https://learn.microsoft.com/ja-jp/entra/identity/managed-identities-azure-resources/overview)
- [資料32](https://learn.microsoft.com/ja-jp/entra/identity-platform/app-objects-and-service-principals)
- [資料33](https://learn.microsoft.com/ja-jp/training/modules/describe-cost-management-azure/)
- [資料34](https://learn.microsoft.com/ja-jp/training/modules/describe-cost-management-azure/3-compare-pricing-total-cost-of-ownership-calculators)
- [資料35](https://learn.microsoft.com/ja-jp/azure/cost-management-billing/costs/tutorial-acm-create-budgets)
- [資料36](https://learn.microsoft.com/ja-jp/azure/cost-management-billing/costs/cost-analysis-common-uses)
- [資料37](https://learn.microsoft.com/ja-jp/training/modules/describe-cost-management-azure/7-describe-purpose-of-tags)
- [資料38](https://learn.microsoft.com/ja-jp/training/modules/describe-features-tools-azure-for-governance-compliance/3-describe-purpose-azure-policy)
- [資料39](https://learn.microsoft.com/ja-jp/training/modules/describe-features-tools-azure-for-governance-compliance/2-describe-purpose-microsoft-purview)
- [資料40](https://learn.microsoft.com/ja-jp/azure/azure-resource-manager/management/lock-resources)
- [資料41](https://learn.microsoft.com/ja-jp/training/modules/describe-features-tools-azure-for-governance-compliance/6-describe-purpose-service-trust-portal)
- [資料42](https://learn.microsoft.com/ja-jp/training/modules/describe-features-tools-manage-deploy-azure-resources/2-describe-interacting-azure)
- [資料43](https://learn.microsoft.com/ja-jp/training/modules/describe-features-tools-manage-deploy-azure-resources/4-describe-azure-resource-manager-azure-arm-templates)
- [資料44](https://learn.microsoft.com/ja-jp/azure/azure-resource-manager/bicep/overview)
- [資料45](https://learn.microsoft.com/ja-jp/training/modules/describe-features-tools-manage-deploy-azure-resources/3-describe-purpose-of-azure-arc)
- [資料46](https://learn.microsoft.com/ja-jp/azure/azure-monitor/fundamentals/overview)
- [資料47](https://learn.microsoft.com/ja-jp/azure/advisor/advisor-overview)
- [資料48](https://learn.microsoft.com/ja-jp/azure/service-health/overview)
- [資料49](https://learn.microsoft.com/ja-jp/azure/service-health/resource-health-overview)
- [資料50](https://learn.microsoft.com/ja-jp/azure/service-health/azure-status-overview)
- [資料51](https://learn.microsoft.com/ja-jp/azure/azure-monitor/autoscale/autoscale-overview)
- [資料52](https://learn.microsoft.com/ja-jp/azure/role-based-access-control/built-in-roles)
- [資料53](https://learn.microsoft.com/ja-jp/azure/governance/policy/concepts/definition-structure-basics)

## データ検証と更新

作成時に156件のJSONオブジェクト、IDの一意性、必須フィールド、156件すべての関連語IDの実在を確認しました。問題データの関連語との整合性はアプリの教材バリデーションで合わせて確認します。

新しい語を追加するときは、既存IDを確認して重複を避け、出典へアクセスして機能を照合し、`lastVerifiedAt` を実際の確認日に設定してください。英語名・略称を検索用に保持し、`relatedTermIds` は名前ではなくIDを指定します。試験ガイド変更時には本文だけでなくcore/supplementaryの分類も見直してください。
