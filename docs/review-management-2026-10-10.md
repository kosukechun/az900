# 管理とガバナンス40問の独立再監査

確認日: 2026-10-10（日本時間）。対象: `public/data/questions/management-governance.json` のQ088〜Q127、全40問。問題文、正答ID、A〜Dの全選択肢、各選択肢の解説、全体解説、覚えるポイントを読み直し、Microsoft公式の**本文**と照合しました。URLが存在するだけでは確認済みとせず、各機能の定義や制約が掲載された本文を確認しています。

## 結果

- 正答IDの変更: **0問**。単一選択39問と複数選択Q092の正答は維持しました。
- 学習内容の補足・条件の明確化: **8問**（Q090、Q093、Q095、Q099、Q100、Q101、Q106、Q107）。
- 本文まで確認できた直接の公式資料へ参照URLを整理: **40問**。
- 更新した問題の`version`は全40問で1→2、`id`は固定、`lastVerifiedAt`は2026-10-10です。正答や過去の回答イベントを変更しません。
- 40問の件数・ID重複・正答IDの選択肢内存在・全選択肢の解説キー一致を確認しました。アプリ全体のテストはこの独立監査の範囲外です。

## 個別確認

「維持」は正答・解説・要点に修正を要する技術的誤りを見つけなかったことを示します。「補足」は正答を維持しながら、条件・適用範囲・誤解されやすい説明を改善したものです。以下のURLリンクはすべて本文を取得できた一次資料です。

| ID / 正答 | 確認した主張・解説・要点 | 誤答選択肢の確認 | 根拠・結果 |
| --- | --- | --- | --- |
| Q088 / C | 料金計算ツールは未配置構成の費用見積もりで、入力だけでは実資源を作成しない。 | A Resource Healthは個別資源の状態、B Monitorは観測データ、D VPN Gatewayはネットワーク接続。 | [料金計算][pricing]、[Resource Health][resource-health]、[Monitor][monitor]、[VPN][vpn]。維持。 |
| Q089 / D | Cost Analysisでは利用費をサービスやサブスクリプション等で確認できる。 | A DNSは名前解決、B 可用性セットはVMの障害分離、C File Syncはファイル同期。 | [Cost Analysis][cost-analysis]、[DNS][dns]、[可用性セット][availability-set]、[File Sync][file-sync]。維持。 |
| Q090 / A | 予算は通知と追跡の機能で、通常のリソース消費を自動停止しない。 | B 全資源削除、C 永久固定料金、D 課金記録消去は予算の機能ではない。 | [予算][budgets]。実績/予測の通知、追加自動化の必要性、費用更新・評価の時間差を補足。 |
| Q091 / B | VM削除後も付随するストレージ等が残り得る。 | A 削除済VMの永久稼働課金は誤り。C 学習履歴とD 名前の長さは当該Azureの課金要因ではない。 | [コスト要因][cost-factors]。Maintenanceの残存資源説明を照合。維持。 |
| Q092 / C・D | リージョンと使用量・サイズ・構成は費用へ影響する。 | A 名前の文字数だけ、B アプリのテーマは一般的なAzure利用費の要因ではない。 | [コスト要因][cost-factors]。Resource type/Consumption/Geographyを照合。維持。 |
| Q093 / D | Reservationsは安定した対象資源の利用に適した期間契約の割引。 | A DNSは名前解決、B ReadOnlyは管理操作制限、C VNetピアリングは接続。 | [Reservations][reservations]、[DNS][dns]、[ロック][locks]、[ピアリング][peering]。期間と一致条件、購入自体ではVMを起動しないことを補足。 |
| Q094 / A | Spotは未使用容量を割安で使うが中断に耐える必要がある。 | B 中断できない処理専用という説明は逆。C ReadOnlyはロック、D Purviewはデータの管理・保護。 | [Spot VM][spot]、[ロック][locks]、[Purview][purview]。回収・中断の可能性を確認。維持。 |
| Q095 / B | Compute savings planは時間当たりの対象利用への支出を約束する。 | A 無料タグ、C パスワード長、D 全VMの同一OSは契約の定義ではない。 | [Savings plan][savings]。1/3年、未使用約束額の繰り越し不可、ソフトウェア・ネットワーク・ストレージ対象外を補足。 |
| Q096 / C | 使用状況を見て不要資源を解放し、サイズを適正化する。 | A 未使用資源を増やす、B 最大サイズ固定、D 分析しない、はいずれも最適化を表さない。 | [Advisorのコスト最適化][advisor-cost]、[コスト要因][cost-factors]。維持。 |
| Q097 / D | タグは分類のための名前/値のメタデータ。 | A VPNは接続、B ゾーンは障害分離、C ArchiveはBlobのアクセス層。 | [タグ][tags]、[VPN][vpn]、[ゾーン][zones]、[アクセス層][tiers]。維持。 |
| Q098 / A | RGやサブスクリプションのタグは資源へ自動継承されない。 | B 無条件継承は誤り。C 停止とD 削除保護はタグの役割ではない。 | [タグ][tags]のInherit tagsを確認。別途Policy等で構成する説明と要点を維持。 |
| Q099 / B | 必須タグはPolicyで監査・拒否・変更等のルールにできる。 | A DNS、C Virtual Desktop、D Queueはタグ規則を評価する機能ではない。 | [Policy][policy]、[タグ][tags]、[DNS][dns]、[AVD][avd]、[Queue][queue]。問題と解説を「タグ対応資源」に限定。未対応種別があることを追記。 |
| Q100 / C | PolicyのDenyルールでVMの許可リージョンを制限できる。 | A Monitorは観測、B Filesは共有、D DNSは名前解決。 | [Policy][policy]、[Monitor][monitor]、[Files][files]、[DNS][dns]。問題の対象をVMに限定し、対象範囲と除外/免除を補足。 |
| Q101 / D | RBACは操作のアクセス許可、Policyは組織ルールの評価・適用。 | A データ移送/DNS、B 費用推定/VM実行は用途不一致。C 同一の権限管理という説明は誤り。 | [Policy][policy]、[RBAC][rbac]。Policyによる要求・特定操作の制限も説明し、「構成だけ」の誤解を避けた。C解説も明確化。 |
| Q102 / A | イニシアティブはポリシー定義の集合（policySet）。 | B サブネットはVNet区分、C アクセス層はBlob保存、D ゾーンは物理障害分離。 | [Policy][policy]、[ピアリング][peering]、[アクセス層][tiers]、[ゾーン][zones]。維持。 |
| Q103 / B | Auditは不適合を記録・評価し、要求を止めない。 | A Denyは拒否、C ReadOnlyはロック、D Deleteはこの監査効果ではない。 | [Audit][audit]、[Deny][deny]、[ロック][locks]。作成/更新時のイベント記録と継続評価を確認。維持。 |
| Q104 / C | Denyは違反する作成/更新要求を拒否し、自動削除を意味しない。 | A Auditは要求を止めず、B タグはメタデータ、D SSOはサインオン。 | [Deny][deny]、[Audit][audit]、[タグ][tags]、[SSO][sso]。維持。 |
| Q105 / D | Purviewのデータガバナンスで発見・分類・系統を扱う。 | A DNSは名前解決、B VMSSはVM群管理、C ExpressRouteはプライベート接続。 | [Purview][purview]、[Data Map][data-map]、[DNS][dns]、[VMSS][vmss]、[ExpressRoute][expressroute]。維持。 |
| Q106 / A | CanNotDeleteは管理面の削除を禁止し、通常は変更を許可する。 | B ReadOnlyは更新も制限、C タグは分類、D MFAは認証。 | [ロック][locks]、[タグ][tags]、[MFA][mfa]。「主に管理面」を「管理面のみに適用」に修正し、データ面の削除対象外を明記。 |
| Q107 / B | ReadOnlyは管理面の更新/削除を制限し、POST操作へも影響する。 | A CanNotDeleteは通常更新可、C タグは分類、D Spotは価格方式。 | [ロック][locks]、[タグ][tags]、[Spot][spot]。データ面に適用されず別途制御が必要なことを解説/要点に補足。 |
| Q108 / C | ロックは許可のある人にも削除制限を追加し、解除権限を分けて管理する。 | A 料金計算、B DNS、D Hot層は管理面の削除防止ではない。 | [ロック][locks]、[RBAC][rbac]、[料金計算][pricing]、[DNS][dns]、[アクセス層][tiers]。維持。 |
| Q109 / D | portalはブラウザのGUI管理コンソール。 | A AzCopyはStorageコピー、B CLIはコマンドライン、C ARM templateは構成の宣言。 | [Portal][portal]、[AzCopy][azcopy]、[CLI][cli]、[テンプレート][templates]。維持。 |
| Q110 / A | Cloud Shellは認証済のブラウザシェルで、CLI/PowerShell等のツールを備える。 | B DNSは名前解決、C Filesだけではコマンド実行環境でない、D Purviewはデータ管理。 | [Cloud Shell][shell]、[DNS][dns]、[Files][files]、[Purview][purview]。付随ストレージ費用があり得る説明も照合。維持。 |
| Q111 / B | CLIはazコマンドで管理・自動化する。 | A PowerShellはコマンドレット、C DNSはサービス、D Service Healthは正常性情報。 | [CLI][cli]、[PowerShell][powershell]、[DNS][dns]、[Service Health][service-health]。維持。 |
| Q112 / C | Azure PowerShellはAzモジュール等のコマンドレットで資源を管理する。 | A AzCopyはコピー、B DNSは名前解決、D CoolはBlobアクセス層。 | [PowerShell][powershell]、[AzCopy][azcopy]、[DNS][dns]、[アクセス層][tiers]。維持。 |
| Q113 / D | Arcは非Azure/オンプレのサーバーやKubernetesをAzure管理へ接続する。 | A DNSは名前解決、B Tableは構造化NoSQL保存、C AVDはデスクトップ。 | [Arc][arc]、[DNS][dns]、[Table][table]、[AVD][avd]。物理移行必須ではない説明も維持。 |
| Q114 / A | IaCによる構成定義は一貫した反復展開と変更管理を支援する。 | B 無料化、C 認証権限不要、D 全失敗防止は保証されない。 | [ARMテンプレート][templates]、[ARM][arm]。宣言的・反復可能な構成を照合。維持。 |
| Q115 / B | ARMは管理/展開層で作成・更新・削除を扱う。 | A DNSは名前解決、C Queueはメッセージ、D SMBはファイル共有プロトコル。 | [ARM][arm]、[DNS][dns]、[Queue][queue]、[Files][files]。Portal/CLI/PowerShellからの管理要求も確認。維持。 |
| Q116 / C | ARM templateはJSONによる宣言的構成ファイル。 | A 音声、B クリック画像、D 公開パスワード一覧はこの形式や用途を満たさない。 | [ARMテンプレート][templates]。資源/プロパティと依存関係の宣言を確認。維持。 |
| Q117 / D | パラメーターで環境ごとの差を渡しテンプレートを再利用できる。 | A 機密情報公開は不適切、B 完全手動別手順とC 無記録作業は再利用/追跡を損なう。 | [パラメーター][parameters]。別環境再利用とsecure parameterによる履歴/ログ保護を確認。維持。 |
| Q118 / A | Monitorは資源/アプリのメトリックとログ等を収集・分析・活用する。 | B DNSは名前解決、C Filesは共有、D Data Boxは物理移送。 | [Monitor][monitor]、[DNS][dns]、[Files][files]、[Data Box][data-box]。維持。 |
| Q119 / B | Log AnalyticsはMonitor Logsのログクエリを作成・実行するツール。 | A 料金見積もり、C Data Box移送、D ロックの保護とは異なる。 | [Log Analytics][log-analytics]、[料金計算][pricing]、[Data Box][data-box]、[ロック][locks]。維持。 |
| Q120 / C | Application Insightsはアプリの性能監視で要求・障害・依存関係を調べる。 | A Policyはルール評価、B DNSは名前解決、D VMSSはVM群管理。 | [Application Insights][app-insights]、[Policy][policy]、[DNS][dns]、[VMSS][vmss]。維持。 |
| Q121 / D | Alert ruleは信号と条件、Action groupは通知先/実行動作を構成する。 | A Archive層は保管、B Files共有名とC タグだけではCPU条件通知を設定しない。 | [Alerts][alerts]、[Action groups][action-groups]、[アクセス層][tiers]、[タグ][tags]。維持。 |
| Q122 / A | Advisorは構成/利用を評価し、費用・性能・信頼性等の改善を推奨する。 | B DNSは名前解決、C Queueはメッセージ、D AVDはデスクトップ。 | [Advisor][advisor]、[DNS][dns]、[Queue][queue]、[AVD][avd]。維持。 |
| Q123 / B | Service Healthは利用サービス/地域に関連する障害・計画メンテナンス・勧告。 | A 料金見積もり、C DNS、D AzCopyはその情報機能ではない。 | [Service Health][service-health]、[料金計算][pricing]、[DNS][dns]、[AzCopy][azcopy]。維持。 |
| Q124 / C | Resource Healthは特定VM等の個別資源の状態/障害情報を示す。 | A Statusは広域、B 料金計算は概算、D タグは分類。 | [Resource Health][resource-health]、[Service Health][service-health]、[料金計算][pricing]、[タグ][tags]。維持。 |
| Q125 / D | Statusはサービス/地域の広域の公開正常性情報への入口。 | A タグ、B 学習履歴、C File Syncは全体の障害情報ではない。 | [Service Health][service-health]、[タグ][tags]、[File Sync][file-sync]。全インシデントを完全網羅する保証ではなく広域情報という説明を確認。維持。 |
| Q126 / A | Monitorの観測・分析とAdvisorの改善推奨は併用できる。 | B 全削除/パスワード共有、C ドメイン購入/物理輸送、D 利用状況確認不可はいずれも役割不一致。 | [Monitor][monitor]、[Advisor][advisor]。維持。 |
| Q127 / B | 管理グループへのPolicy割当は配下の複数subscriptionへ適用できる。 | A 費用消滅、C 無制限権限、D タグ無条件継承を意味しない。 | [管理グループ][management-groups]、[Policy][policy]、[タグ][tags]。除外・免除を含む既存説明と要点を維持。 |

## 限界・取得時の扱い

公式資料の本文は確認できました。一部ページの上部には認証要求の共通UI文言がありますが、その下の技術本文が返り、照合できたもののみを根拠として採用しています。試験の非公開問題、公式採点方法、個別契約での価格を検証したものではありません。選択肢に含まれる「本アプリのテーマ」「学習履歴」のようなアプリ独自の表現はAzure公式資料で定義される対象ではなく、Azure課金要因ではないことを論理的に確認しました。アプリの通信や保存実装の監査は別のテストで行う必要があります。

取得を試した最初のCost Managementの3URLは`/azure/`がない誤ったパスだったためアクセス失敗しました。正しい`/azure/cost-management-billing/`で取り直し、本文を確認済みです。VNetピアリングの本文取得も初回は一時失敗しましたが、同じ正式URLの再取得で本文を確認しました。取得失敗の応答だけを根拠に「検証済み」としていません。

今回確認した現行の料金計算学習ページにはTCO calculatorの廃止が明記されています。対象40問にはTCOを正答にする問題はありません。また、Policy公式概要には構成評価以外の特定操作やidentity-aware requestの制限も掲載されています。AZ-900の基本区別は保ちつつ、Policyを「構成だけを扱う」と絶対化しない解説へ更新しました。

[pricing]: https://learn.microsoft.com/en-us/training/modules/describe-cost-management-azure/3-compare-pricing-total-cost-of-ownership-calculators
[cost-factors]: https://learn.microsoft.com/en-us/training/modules/describe-cost-management-azure/2-describe-factors-affect-costs-azure
[cost-analysis]: https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/quick-acm-cost-analysis
[budgets]: https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets
[reservations]: https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations
[spot]: https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms
[savings]: https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-overview
[advisor-cost]: https://learn.microsoft.com/en-us/azure/advisor/advisor-cost-recommendations
[tags]: https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources
[policy]: https://learn.microsoft.com/en-us/azure/governance/policy/overview
[rbac]: https://learn.microsoft.com/en-us/azure/role-based-access-control/overview
[audit]: https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-audit
[deny]: https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-deny
[purview]: https://learn.microsoft.com/en-us/purview/purview
[data-map]: https://learn.microsoft.com/en-us/purview/data-map
[locks]: https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources
[management-groups]: https://learn.microsoft.com/en-us/azure/governance/management-groups/overview
[portal]: https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-overview
[shell]: https://learn.microsoft.com/en-us/azure/cloud-shell/overview
[cli]: https://learn.microsoft.com/en-us/cli/azure/what-is-azure-cli
[powershell]: https://learn.microsoft.com/en-us/powershell/azure/what-is-azure-powershell
[arc]: https://learn.microsoft.com/en-us/azure/azure-arc/overview
[templates]: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/overview
[arm]: https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview
[parameters]: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/parameters
[monitor]: https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/overview
[log-analytics]: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-overview
[app-insights]: https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview
[alerts]: https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-overview
[action-groups]: https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/action-groups
[advisor]: https://learn.microsoft.com/en-us/azure/advisor/advisor-overview
[service-health]: https://learn.microsoft.com/en-us/azure/service-health/overview
[resource-health]: https://learn.microsoft.com/en-us/azure/service-health/resource-health-overview
[dns]: https://learn.microsoft.com/en-us/azure/dns/dns-overview
[vpn]: https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways
[availability-set]: https://learn.microsoft.com/en-us/azure/virtual-machines/availability-set-overview
[zones]: https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview
[file-sync]: https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-introduction
[files]: https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction
[tiers]: https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview
[queue]: https://learn.microsoft.com/en-us/azure/storage/queues/storage-queues-introduction
[table]: https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-overview
[expressroute]: https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction
[vmss]: https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview
[avd]: https://learn.microsoft.com/en-us/azure/virtual-desktop/overview
[azcopy]: https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10
[data-box]: https://learn.microsoft.com/en-us/azure/databox/data-box-overview
[peering]: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview
[mfa]: https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks
[sso]: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/what-is-single-sign-on
