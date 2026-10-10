# クラウドの概念：全34問の再監査

確認日：2026-10-10（Asia/Tokyo）

対象：`public/data/questions/cloud-concepts.json` の Q001–Q034。

問題文、正答、4つの選択肢とそれぞれの解説、総合解説、覚えるポイントを1問ずつ読み直し、Microsoft公式の説明本文と照合した。検索結果の件数や参考URLの存在だけを根拠に正確性を判断していない。誤答選択肢は「選択肢の主張が誤り」なのか「用語の説明自体は正しいが設問の目的と違う」なのかを区別した。

**結果：34問を監査、3問を更新（Q028・Q032・Q033）、正答の変更0問、問題の追加・削除0問。** Q032は誤答解説の断定を修正、Q028はトリガーの対象を明確化、Q033は地域選択の根拠を追加した。これら3問のみversionを1から2に更新し、IDと回答IDを維持した。残り31問は内容とversionを維持している。

`Define cloud models` は最初の直接アクセスで本文を取得できなかったが、公式モジュール内のリンクからアクセスし、Private/Public/Hybrid/Multicloudの本文を取得できた。未取得の本文を確認済みとはしていない。この記録はAIによる資料照合であり、Microsoftの承認や将来の仕様に対する保証を示すものではない。

## 1問ごとの確認

### Q001 — IaaSのVMとOSの制御

確認した主張：ゲストOSを自分で設定・管理し、既存サーバーを大きく再設計せず移す用途にはAzure Virtual Machinesが適する。公式のVM本文とIaaS本文にOSの制御およびlift-and-shiftが記載されている。

選択肢・解説：AのIaaSは適切。BのApp ServiceはホストOSを直接管理する目的には適さない。CのMicrosoft 365は完成したSaaS、DのFunctionsはイベント実行基盤であり、ゲストOS管理を必要とする要件を満たす選択ではない。総合解説と「OS制御ならIaaS」の要点も整合。

根拠：[IaaS本文][S01]、[VM本文][S04]、[責任共有のサービス例][S05]。結果：変更不要、正答A。

### Q002 — コードに集中するPaaS

確認した主張：PaaSでは提供者がホストOS・ミドルウェア・実行基盤を管理し、利用者はアプリケーション、データ、アクセスを管理する。

選択肢・解説：AのIaaSではゲストOSの管理責任が残る。BのPaaSが要件に合う。Cの自社オンプレミスでは通常は基盤運用も必要。Dはネットワーク構成の種類で、サービスモデルではない。「基盤運用を減らす」という要点は管理責任が全部なくなるとは述べていない。

根拠：[PaaS本文][S02]、[責任共有][S05]。結果：変更不要、正答B。

### Q003 — Microsoft 365とSaaS

確認した主張：完成したメール・共同作業アプリをサービスとして利用するMicrosoft 365はSaaSの例。

選択肢・解説：AのIaaSは利用者がOS等を管理する基盤、BのPaaSは自分のアプリを配置する基盤、CのSaaSが適切。Dの可用性ゾーンは物理的な障害分離の概念。「アプリ本体やメールサーバーの更新は提供者が管理」の説明はサービス側を対象としており、利用者の端末管理まで不要とは述べていない。

根拠：[SaaS本文][S03]、[Microsoft 365のサービス例][S05]、[可用性ゾーン][S06]。結果：変更不要、正答C。

### Q004 — IaaSのゲストOS更新責任

確認した主張：IaaSのゲストOSの管理・更新は利用者の責任。自動化ツールの使用と責任の所在は別。

選択肢・解説：Aの建築会社、Bの回線事業者はゲストOSの更新責任主体ではない。Cの「常にMicrosoftのみ」は物理ホストとゲストOSを混同。Dの利用者が適切。要点もこの区別を維持している。

根拠：[IaaS本文][S01]、[責任共有のOS・物理ホストの表][S05]。結果：変更不要、正答D。

### Q005 — どのモデルでも残る管理責任

確認した主張：データ、ID・アカウント、アクセス許可、利用端末の保護に利用者の責任が残る。提供者が一部を支援しても責任が消えるわけではない。

選択肢・解説：Aが適切。Bの施設冷却、Cの物理サーバー、Dの提供者施設の入退室管理は提供者が管理する。「SaaSでも自社データとIDを管理」の要点は現在のマトリックスに整合。

根拠：[責任共有のマトリックスと保持する責任][S05]、[Trainingの責任共有本文][S07]。結果：変更不要、正答A。

### Q006 — データセンターの物理管理

確認した主張：クラウドデータセンターの電源、冷却、物理アクセス管理は提供者が担う。

選択肢・解説：Aのサブスクリプション所有者とCのエンドユーザーは提供者の施設を直接管理しない。Bが適切。Dの毎回交代するという仕組みはない。Azureのデータセンターを対象としており、利用者のオンプレミス設備までMicrosoftへ委ねるとは述べていない。

根拠：[Trainingの物理管理分担][S07]、[Microsoftの物理設備責任][S05]。結果：変更不要、正答B。

### Q007 — PaaSデータベースの利用者責任（複数選択）

確認した主張：PaaSで基盤の運用を委ねても、自社業務データとアクセス許可は利用者が管理する。

選択肢・解説：Aの空調とBの物理ディスク交換は提供者側。Cの業務データとDのアクセス許可が利用者側。「2つ選べ」と正答2件が整合し、設備とデータの管理を取り違えない解説になっている。

根拠：[PaaSの利用者管理対象][S02]、[共有責任のデータ・アカウント・アクセス][S05]。結果：変更不要、正答C・D。

### Q008 — 一般に提供されるAzureの展開モデル

確認した主張：幅広い利用者に提供される一般的なAzureはパブリッククラウド。

選択肢・解説：Aは自社設備だけの運用という意味で合わない。Bの単一組織専用には限定されない。Cのハイブリッドは社内などの環境との組み合わせが必要。Dが適切。「パブリックは公開データを意味しない」の要点もアクセス制御の存在と整合。

根拠：[展開モデル本文][S08]、[Azureのアクセス制御][S09]。結果：変更不要、正答D。

### Q009 — プライベートクラウドと設置場所

確認した主張：プライベートクラウドは単一組織専用の環境であり、社外の専用施設に置くこともできる。

選択肢・解説：Aが適切。Bのパブリックは広く利用者へ提供、Cのマルチクラウドは複数提供者、Dのサーバーレスは基盤運用の抽象化であり、専用利用という展開モデルの定義とは異なる。要点は専用利用と設置場所を区別。

根拠：[展開モデルのPrivate/Multicloud本文][S08]、[Functionsの基盤運用][S10]。結果：変更不要、正答A。

### Q010 — 社内とAzureの相互接続

確認した主張：プライベートクラウドとパブリッククラウドを相互接続して使う環境はハイブリッドクラウド。

選択肢・解説：AのSaaSはサービスの提供範囲。Bが適切。Cの可用性セットはVMの更新・障害ドメインの分離。Dの単一プライベートだけではAzureとの組み合わせを表さない。段階移行と配置先の使い分けの説明はモデルの柔軟性からの実務的な適用。

根拠：[Hybrid本文][S08]、[SaaS本文][S03]、[VMの可用性セット][S04]。結果：変更不要、正答B。

### Q011 — マルチクラウド

確認した主張：Azureと別のパブリッククラウド提供者を併用する構成はマルチクラウド。

選択肢・解説：Aのスケールアップは単一資源の性能増強。Bの単一テナントは組織やID環境の単位に関係する。Cが適切。Dのゾーンは同一リージョン内の物理的な障害分離。ハイブリッドとの着目点の違いも正しい。

根拠：[Multicloud本文][S08]、[スケーリング本文][S11]、[テナントの説明][S12]、[ゾーン本文][S06]。結果：変更不要、正答C。

### Q012 — 社内保持と一時的なクラウド容量

確認した主張：処理の一部を社内へ残し、一時的需要をパブリッククラウドへ広げる用途にハイブリッド構成が適する。

選択肢・解説：Aは社内に残す要件を満たさない。BはAzure利用を含まない。Cの可用性セットだけでは展開モデルを作らない。Dが適切。解説は構成を選ぶだけで法令やセキュリティ要件を自動的に満たすとは断定せず、設計が必要と明示。

根拠：[Hybridの一時需要と配置選択][S08]、[可用性セット][S04]、[地域選択と法令要件][S13]。結果：変更不要、正答D。

### Q013 — 従量課金

確認した主張：資源の量や時間などの計量された使用に応じて支払うのが従量課金。

選択肢・解説：Aが適切。Bの設備の買い切りは事前購入、Cの永久無料ではない。Dの設備所有義務もない。解説は「不要資源を解放すると費用を抑えやすい」であり、VM内で何も処理していなければ無料という意味にはしていない。

根拠：[従量課金本文][S14]。結果：変更不要、正答A。

### Q014 — 物理サーバー購入とCapEx

確認した主張：物理サーバー等への初期設備投資は、基本的なクラウド費用分類でCapExの例。

選択肢・解説：AのOpExは継続的な運用支出、Bが適切。Cの可用性とDの弾力性は費用分類ではない。問題と解説は「一般に」と限定し、個別の会計契約の判断を保証していない。弾力性の説明は需要変化に応じた容量調整と整合。

根拠：[CapEx/OpEx本文][S14]、[可用性・容量調整][S11]、[弾力性の監視][S15]。結果：変更不要、正答B。

### Q015 — 継続的な利用料とOpEx

確認した主張：クラウドを継続的に消費した分の利用料は、基本的な分類ではOpEx。

選択肢・解説：Aの物理設備所有権の購入ではなく、BのCapExだけでもない。Cが適切。Dのサービスレベルは費用分類ではない。一般的な支出概念として記述し、個別の会計処理に踏み込んでいない。

根拠：[従量課金と運用支出][S14]、[サービスレベルの説明][S11]。結果：変更不要、正答C。

### Q016 — 短期・不確実な需要の価格モデル

確認した主張：長期の利用約束を避けたい短期テストでは、柔軟な従量課金が選択肢の中で適する。

選択肢・解説：Aの3年予約は長期約束を避ける条件に合わない。Bは不要設備の投資、Cは費用管理を弱める。Dが適切。予約等は安定した継続利用の見込みと条件を比べるという解説に整合し、すべての状況で最安と断定していない。

根拠：[従量課金本文][S14]、[Reservations/Savings plan/Spotの比較][S16]。結果：変更不要、正答D。

### Q017 — 水平増強（スケールアウト）

確認した主張：同じ用途のサーバー台数を増やすのがスケールアウト。

選択肢・解説：Aが適切。Bのアップは単一資源の性能増強、Cのインは台数削減、Dのダウンは単一資源の性能低下。負荷分散と台数追加を組み合わせる説明・要点も整合。

根拠：[水平・垂直スケーリング本文][S11]、[Scale Setsの負荷分散][S04]。結果：変更不要、正答A。

### Q018 — 垂直増強（スケールアップ）

確認した主張：1台のメモリを増やすのがスケールアップ。

選択肢・解説：Aのインは台数削減、Bが適切、Cのアウトは台数追加。Dのジオレプリケーションは離れた地域への複製であり、単一VMの性能増強とは別。総合解説と要点も整合。

根拠：[垂直スケーリング本文][S11]、[Storageの地理複製][S17]。結果：変更不要、正答B。

### Q019 — 水平縮小（スケールイン）

確認した主張：同じ性能のサーバー台数を減らすのがスケールイン。

選択肢・解説：Aのアップは性能増強、Bのアウトは台数追加。Cが適切。Dの認証はIDの確認であり容量調整ではない。容量を需要へ戻して支出を抑える説明も整合。

根拠：[水平スケーリング本文][S11]、[認証の定義][S18]。結果：変更不要、正答C。

### Q020 — 高可用性

確認した主張：必要時にサービスを利用できる状態を維持し、停止時間を抑える設計目標が高可用性。

選択肢・解説：Aは設備投資、Bは特定提供者等への依存であり可用性の定義ではない。Cの単一障害点は障害が全体停止につながる要因、Dが適切。冗長化等の設計が必要という説明は、クラウドを選べば無条件に停止がないという主張を避けている。

根拠：[高可用性本文][S11]、[信頼性の設計][S19]、[提供者・ツールへの依存][S20]。結果：変更不要、正答D。

### Q021 — 信頼性

確認した主張：障害から回復し、動作を継続する能力がクラウドの利点としての信頼性。

選択肢・解説：Aが適切。Bの無制限無料、Cのデータ公開は回復能力ではない。Dは冗長性を失い信頼性を下げ得る。複数リージョンの復旧「設計」で支えられると説明し、配置しただけで必ず自動復旧するとは述べていない。

根拠：[信頼性本文][S21]、[リージョン障害と設計条件][S06]。結果：変更不要、正答A。

### Q022 — 費用の予測可能性

確認した主張：使用量の傾向分析と料金の見積もりは将来費用の予測に役立つ。

選択肢・解説：Aは増加の把握を妨げ、Bが適切。Cは価格差の無視で誤差を増やし得る。Dは支出増の通知を失う。費用が一定額になると約束しない解説・要点に整合。

根拠：[コストの予測可能性][S21]、[従量課金][S14]。結果：変更不要、正答B。

### Q023 — ガバナンス

確認した主張：組織の標準に照らして資源の設定を評価し、配置ルールを維持する活動はガバナンス。

選択肢・解説：AのCPU仮想化のみ、Bの匿名公開はこの活動を表さない。Cが適切。Dの全手動設定は必要条件ではなくポリシーやテンプレートで自動化できる。監査と標準の維持という要点に整合。

根拠：[セキュリティとガバナンス本文][S22]、[Azure Policyの標準・コンプライアンス評価][S23]。結果：変更不要、正答C。

### Q024 — テンプレートと監視（複数選択）

確認した主張：共通の構成をテンプレートで展開することと、しきい値によるアラートは管理を容易にする。

選択肢・解説：Aの異なる手順で毎回手動作成、Bの監視廃止と障害無視はこの利点を活用しない。CとDが適切。「2つ選べ」と正答2件が一致し、総合解説・要点は設定の一貫性と状態把握を説明。

根拠：[管理の容易さの本文][S24]。結果：変更不要、正答C・D。

### Q025 — IaaSの制御と責任

確認した主張：IaaSは比較する3モデルの中でOSや配置ソフトウェアを最も広く管理でき、運用責任も多い。

選択肢・解説：Aが適切。Bは実行基盤を提供者に委ね、Cは完成アプリの利用が中心。Dの管理範囲が同一は不適切。解説・要点が柔軟な制御と管理責任を組にしている点も確認。

根拠：[IaaS本文][S01]、[PaaS本文][S02]、[SaaS本文][S03]。結果：変更不要、正答A。

### Q026 — SaaSで委ねる運用と残る管理

確認した主張：SaaSでは提供されるサービス側アプリ本体の保守・更新基盤の運用を提供者が担当する。

選択肢・解説：Aのデータアクセス、Cのアカウント、Dの情報共有の適切さの管理は利用者に残る。Bが適切。サービス側アプリの更新と、利用者の端末やクライアントソフトの管理責任を混同する断定はない。

根拠：[SaaSの保守と利用者の管理][S03]、[共有責任の残る管理][S05]。結果：変更不要、正答B。

### Q027 — サーバーレス

確認した主張：サーバーレスは計算用サーバーをなくすことではなく、利用者が基盤の配置・保守を直接管理しない実行方式。

選択肢・解説：Aの物理サーバー不存在、Bの永久無料、Dのネットワーク不要はいずれも誤り。Cが適切。公式本文に基盤を任せる説明、別本文に実在するホストとプラン別費用・ネットワーク制御の説明を確認。

根拠：[Functions概要][S10]、[ホストと料金のプラン差][S25]、[ネットワーク接続][S26]。結果：変更不要、正答C。

### Q028 — ファイルイベントによるFunctions実行

確認した主張：Blobの新規作成・更新を検出してFunctionsのコードを実行できる。プランにより課金・実行条件が異なる。

選択肢・解説：Aは名前解決、Bはファイル共有、Cは資源の構成ルールの評価・適用であり、指定のコード実行基盤ではない。Dが適切。

根拠：[Functionsのアップロード処理][S10]、[Blobトリガー本文][S27]、[プラン比較][S25]、[DNS][S28]、[Files][S29]、[Policy][S23]。

結果：問題文の「ファイル到着」を「Azure Blob Storageへのファイルのアップロード」と明確化。解説とDの解説にBlobトリガーを明記し、参考URLを具体的な本文へ変更。version 1→2、正答Dを維持。

### Q029 — クラウドコンピューティングの定義

確認した主張：計算・保存・ネットワーク等のIT資源を、ネットワークを通じサービスとして利用する。

選択肢・解説：Aが適切。Bの自社物理設備所有は必須ではない。Cの全データ公開、Dの回線速度測定だけを意味する定義ではない。必要な資源を素早く用意する説明と要点も整合。

根拠：[クラウドの定義本文][S30]、[展開モデル][S08]、[アクセス権管理][S09]。結果：変更不要、正答A。

### Q030 — テスト環境の迅速な調達と解放

確認した主張：必要時に仮想マシンを素早く作り、テスト終了後に不要資源を解放できる。

選択肢・解説：Aはクラウドの調達速度を活用しない。Bが適切。Cは不要資源の継続課金を招き得る。Dは需要に合わせた調整を活用しない。付随するストレージも確認するという説明を維持。

根拠：[オンデマンドの調達][S30]、[IaaSのテスト用途][S01]、[従量課金と解放][S14]。結果：変更不要、正答B。

### Q031 — SLAの意味と条件

確認した主張：SLAは対象サービスの可用性等のサービスレベルに関する合意であり、対象条件がサービスや構成で異なる。

選択肢・解説：Aの停止が絶対にない保証ではない。Bの権限一覧とは異なり、Cが適切。Dの全サービスの価格表でもない。アプリ全体の可用性に構成設計が関係する点は、可用性をアプリケーション設計で考慮する公式本文と整合。

根拠：[SLAと可用性本文][S11]、[権限管理][S09]。結果：変更不要、正答C。

### Q032 — パブリックの意味と外部利用者の権限

確認した主張：パブリッククラウドは広い提供対象の意味であり、自社データの匿名公開や他組織の資源の無権限操作を意味しない。外部利用者にも適切なロールを付与して利用を許可できる。

選択肢・解説：Aの自動全公開は不適切。Bの誰でも操作可能は不適切だが、以前のB解説の「他組織の資源への権限は与えられない」は強すぎた。Cの暗号化できないも不適切で、Azure Storage等はHTTPS等の安全な通信をサポート。Dが適切。

根拠：[Publicの定義][S08]、[外部利用者へのAzureロール付与][S31]、[安全な転送][S32]。

結果：B解説を「パブリックであるだけでは操作権限を得られないが、外部利用者にも適切な権限を付与できる」へ修正し、外部ロール付与の根拠URLを追加。version 1→2、正答Dを維持。

### Q033 — 利用者近くの配置と地域選択

確認した主張：物理的な距離は遅延に影響し、利用者の近くに配置すると遅延を減らしやすい。地域ごとの対応サービス、価格、データ所在地も考慮する。

選択肢・解説：Aが適切。Bの法令確認不要、Cの無条件無料、Dの認証省略にはつながらない。説明は改善を期待できると述べ、遅延ゼロや無条件の性能向上を保証していない。

根拠：[利用者近くの地域選択・法令・価格・機能][S13]、[グローバル配置][S30]、[認証][S18]。

結果：問題本文と正答は維持。解説の地域選択要因を直接裏付ける公式本文をreferenceUrlsへ追加。version 1→2、正答Aを維持。

### Q034 — オンプレミスからクラウドへの責任分担

確認した主張：自社運用する設備の責任から、クラウド提供者と利用者で管理を分担する形へ変わり、物理基盤は提供者へ移るが利用者のデータ・ID等の責任は残る。

選択肢・解説：Aの全責任消失は不適切。Bが適切。CはIaaSのゲストOS責任が残るため不適切。Dは提供者の物理設備責任を否定するため不適切。要点も責任の消失ではなく分担と説明している。

根拠：[現行の責任共有マトリックス][S05]、[Trainingの責任共有本文][S07]。結果：変更不要、正答B。

## 参照した公式本文

以下は今回の再監査で本文を取得して確認した参照先。S15とS20は検索で場所を確認した後、公式本文へアクセスして、それぞれ弾力性の調整と提供者・ツールへの依存の補助根拠を確認した。第三者の問題サイトや試験流出問題は根拠に使っていない。

[S01]: https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service
[S02]: https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service
[S03]: https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service
[S04]: https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/2-virtual-machines
[S05]: https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility
[S06]: https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/5-describe-azure-physical-infrastructure
[S07]: https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model
[S08]: https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models
[S09]: https://learn.microsoft.com/en-us/azure/role-based-access-control/overview
[S10]: https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview
[S11]: https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud
[S12]: https://learn.microsoft.com/en-us/entra/fundamentals/create-new-tenant
[S13]: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-setup-guide/regions
[S14]: https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model
[S15]: https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/monitoring
[S16]: https://learn.microsoft.com/en-us/training/modules/describe-cost-management-azure/7a-describe-cost-optimization-options
[S17]: https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/3-redundancy
[S18]: https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/3-authentication-methods
[S19]: https://learn.microsoft.com/en-us/azure/well-architected/reliability/redundancy
[S20]: https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/infrastructure-as-code-design
[S21]: https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/3-reliability-predictability-cloud
[S22]: https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud
[S23]: https://learn.microsoft.com/en-us/azure/governance/policy/overview
[S24]: https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud
[S25]: https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale
[S26]: https://learn.microsoft.com/en-us/azure/azure-functions/functions-networking-options
[S27]: https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-blob-trigger
[S28]: https://learn.microsoft.com/en-us/azure/dns/dns-overview
[S29]: https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction
[S30]: https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/3-what-cloud-compute
[S31]: https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-external-users
[S32]: https://learn.microsoft.com/en-us/azure/storage/common/storage-require-secure-transfer

## データの整合性

更新後のJSONで34問、34件の一意なID、正答IDと選択肢IDの整合性を確認した。日本語が壊れていないことも確認した。正答は全問変更していないため、以前の回答履歴の採点結果との意味的な矛盾を作っていない。アプリ全体の検証は上位タスクで実行する。

監査済みの静的JSONを正として運用する。統合時に `scripts/author-question-bank.py` も更新し、既存JSONのバージョンが初期定義より新しい場合はその改訂を保持するようにした。隔離フォルダで再生成し、今回の監査済み127問が変わらないことを確認している。通常の問題追加は引き続き専用のJSON/CSVインポートを使用する。
