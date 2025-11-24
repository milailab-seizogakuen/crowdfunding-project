# 🎯 クラウドファンディングサイト 最終仕様書

**プロジェクト名**: クラウドファンディングサイト（NEXT RAIL）  
**バージョン**: 2.0（2シート版）  
**作成日**: 2025年11月13日  
**更新日**: 2025年11月14日  
**ステータス**: 実装進行中（Phase 4 完了）

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [データ構造](#データ構造)
4. [ページ構成](#ページ構成)
5. [機能仕様](#機能仕様)
6. [決済フロー](#決済フロー)
7. [メール送信](#メール送信)
8. [実装ロードマップ](#実装ロードマップ)
9. [環境変数](#環境変数)
10. [再利用性・テンプレート化](#再利用性テンプレート化)

---

# プロジェクト概要

## 概要

小規模クラウドファンディングサイト。複数のリターン選択に対応し、3種類の決済方法をサポート。

| 項目 | 内容 |
|------|------|
| **目標金額** | ¥100,000 |
| **予想支援者数** | 最大20人 |
| **リターン数** | 3～5個 |
| **完成度** | 最小限・シンプル |
| **デプロイ先** | Vercel |
| **運用方法** | スプレッドシート管理 |
| **スプレッドシート数** | **2個**（crowdfunding-sheet + crowdfunding-customer） |

## 特徴

- ✅ 複数リターン選択対応（同一リターン複数個も可）
- ✅ 配送料金込み（計算ロジックなし）
- ✅ 配送必須/不要の条件付き住所入力
- ✅ 3種類決済（PayPal / JPYC / 銀行振込）
- ✅ 公開情報と顧客情報の分離
- ✅ ダッシュボード自動計算（Google Sheets）
- ✅ 画像管理：**リターン画像のみスプシ URL、その他は外部 URL**
- ❌ Admin画面なし（スプレッドシート管理）

---

# 技術スタック

## フロントエンド

```json
{
  "フレームワーク": "Next.js 14",
  "UI フレームワーク": "React 18",
  "言語": "TypeScript 5.5",
  "スタイリング": "Tailwind CSS v3",
  "状態管理": "React Context API",
  "ホスティング": "Vercel"
}
```

## バックエンド・外部API

```json
{
  "ランタイム": "Node.js (Next.js API Routes)",
  "データベース": "Google Sheets API（2ファイル）",
  "メール": "Gmail API",
  "決済": {
    "PayPal": "PayPal Checkout SDK",
    "JPYC": "Polygon ネットワーク（Web3 / MetaMask）",
    "銀行振込": "Manual（メール通知）"
  },
  "Web3": {
    "ethers.js": "v6",
    "ChainID": "137 (Polygon Mainnet)"
  },
  "画像管理": "Imgur（リターン以外）、Google Sheets URL（リターン）"
}
```

---

# データ構造

## Google Sheets 設計（2ファイル版）

### 📊 スプレッドシート1: crowdfunding-sheet

**用途**: リターン・ダッシュボード管理（公開用）  
**URL**: https://docs.google.com/spreadsheets/d/19ON9_FmAu6cltqm7SzXw1OcG-jC_yOJybkTIUJef8mE/

#### シート1️⃣: rewards（リターン一覧・公開用）

**ヘッダー行（1行目）**

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| reward_id | title | unit_price | description | requires_shipping | image_url |

**データ例（2～4行目）**

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| R001 | デジタル限定 | 3000 | PDF報告書 | FALSE | https://imgur.com/... |
| R002 | ステッカー | 5000 | ステッカー3枚 | TRUE | https://imgur.com/... |
| R003 | 実物セット | 10000 | 商品詰め合わせ | TRUE | https://imgur.com/... |

**列の説明**

| 列 | フィールド | 型 | 説明 |
|----|-----------|-----|------|
| A | reward_id | 文字列 | リターンID（R001, R002, ...） |
| B | title | 文字列 | リターンのタイトル |
| C | unit_price | 数値 | 単価（配送料金込み） |
| D | description | 文字列 | リターンの説明 |
| E | requires_shipping | TRUE/FALSE | 配送が必要か |
| F | image_url | URL | リターン画像の URL（Imgur またはスプシ内） |

---

#### シート2️⃣: dashboard（進捗統計・公開用）

**構成**: A列 = ラベル、B列 = 値（自動計算）

| A | B |
|---|---|
| 目標金額 | 100000 |
| 現在の支援金額 | =SUM(crowdfunding-customer!backing_items!F:F) |
| 支援者数 | =COUNTA(crowdfunding-customer!backers!A:A)-1 |
| 目標達成率 (%) | =B2/B1*100 |
| 残り金額 | =B1-B2 |
| R001支援数 | =COUNTIF(crowdfunding-customer!backings!I:I,"R001*") |
| R002支援数 | =COUNTIF(crowdfunding-customer!backings!I:I,"R002*") |
| R003支援数 | =COUNTIF(crowdfunding-customer!backings!I:I,"R003*") |

**計算式の詳細**

- **B1**: `100000` （硬コード・固定値）
- **B2**: `=SUM(crowdfunding-customer!backing_items!F:F)`
  - 別ファイルの backing_items シートのF列（subtotal）をすべて合計
- **B3**: `=COUNTA(crowdfunding-customer!backers!A:A)-1`
  - 別ファイルの backers シートのA列（backer_id）の行数をカウント
  - -1はヘッダー行を除外
- **B4**: `=B2/B1*100`
  - (現在の支援金額 / 目標金額) × 100
- **B5**: `=B1-B2`
  - 目標金額 - 現在の支援金額
- **B7-B9**: リターン別支援数
  - `=COUNTIF(crowdfunding-customer!backings!I:I,"R001*")`
  - 別ファイルの backings シートのI列（reward_id）をカウント

---

### 👥 スプレッドシート2: crowdfunding-customer

**用途**: 顧客・支援データ管理（非公開）  
**URL**: https://docs.google.com/spreadsheets/d/1CrG-cAowbzyPYHC03C5B6n6h8PP-qF5CGleay2B4me4/

#### シート1️⃣: backers（支援者情報・非公開用）

**ヘッダー行（1行目）**

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| backer_id | name | email | phone_number | postal_code | prefecture | city | address_line | created_at | updated_at |

**データ例（2～4行目）**

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| B001 | 田中太郎 | tanaka@example.com | 090-1234-5678 | 431-3125 | 静岡県 | 浜松市北区 | 新都田1-2-3 | 2025-01-15T14:32:00Z | 2025-01-15T14:32:00Z |
| B002 | 佐藤花子 | sato@example.com | 090-5678-9012 | 100-0001 | 東京都 | 千代田区 | 千代田1-1-1 | 2025-01-15T13:45:00Z | 2025-01-15T13:45:00Z |

**列の説明**

| 列 | フィールド | 型 | 説明 | 必須 |
|----|-----------|-----|------|------|
| A | backer_id | 文字列 | 支援者ID | ✓ |
| B | name | 文字列 | 支援者名 | ✓ |
| C | email | 文字列 | メールアドレス | ✓ |
| D | phone_number | 文字列 | 電話番号 | 配送時 |
| E | postal_code | 文字列 | 郵便番号 | 配送時 |
| F | prefecture | 文字列 | 都道府県 | 配送時 |
| G | city | 文字列 | 市区町村 | 配送時 |
| H | address_line | 文字列 | 番地以下 | 配送時 |
| I | created_at | 日時 | 作成日時（ISO 8601） | ✓ |
| J | updated_at | 日時 | 更新日時（ISO 8601） | ✓ |

---

#### シート2️⃣: backings（支援ヘッダー・非公開用）

**ヘッダー行（1行目）**

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| backing_id | backer_id | backing_date | total_amount | payment_method | payment_status | order_status | transaction_id | created_at | notes |

**データ例（2～4行目）**

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| BACK001 | B001 | 2025-01-15 14:32 | 8000 | paypal | completed | received | paypal_tx_123 | 2025-01-15T14:32:00Z | 完了 |
| BACK002 | B002 | 2025-01-15 13:45 | 10000 | bank | pending | pending | | 2025-01-15T13:45:00Z | 入金待機中 |
| BACK003 | B003 | 2025-01-15 12:10 | 3000 | jpyc | completed | received | 0x123... | 2025-01-15T12:10:00Z | 完了 |

**列の説明**

| 列 | フィールド | 型 | 説明 | 例 |
|----|-----------|-----|------|-----|
| A | backing_id | 文字列 | 支援ヘッダーID | BACK001 |
| B | backer_id | 文字列 | 支援者ID（FK: backers!A） | B001 |
| C | backing_date | 日時 | 支援日時 | 2025-01-15 14:32 |
| D | total_amount | 数値 | 支援金額合計 | 8000 |
| E | payment_method | 文字列 | 決済方法 | paypal / bank / jpyc |
| F | payment_status | 文字列 | 決済ステータス | pending / completed / failed |
| G | order_status | 文字列 | 注文ステータス | pending / received / shipped / completed |
| H | transaction_id | 文字列 | トランザクション ID | paypal_tx_123 |
| I | created_at | 日時 | 作成日時（ISO 8601） | 2025-01-15T14:32:00Z |
| J | notes | 文字列 | 管理者用メモ | 完了 |

---

#### シート3️⃣: backing_items（支援詳細・非公開用）

**ヘッダー行（1行目）**

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| backing_item_id | backing_id | reward_id | quantity | unit_price | subtotal | notes |

**データ例（2～5行目）**

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| BIT001 | BACK001 | R001 | 1 | 3000 | 3000 | デジタル限定 |
| BIT002 | BACK001 | R002 | 2 | 5000 | 10000 | ステッカー×2 |
| BIT003 | BACK002 | R003 | 1 | 10000 | 10000 | 実物セット |
| BIT004 | BACK003 | R001 | 1 | 3000 | 3000 | デジタル限定 |

**列の説明**

| 列 | フィールド | 型 | 説明 | 例 |
|----|-----------|-----|------|-----|
| A | backing_item_id | 文字列 | 支援詳細ID | BIT001 |
| B | backing_id | 文字列 | 支援ID（FK: backings!A） | BACK001 |
| C | reward_id | 文字列 | リターンID（FK: crowdfunding-sheet!rewards!A） | R001 |
| D | quantity | 数値 | 数量 | 1 |
| E | unit_price | 数値 | リターン単価 | 3000 |
| F | subtotal | 数値 | 小計（quantity × unit_price） | 3000 |
| G | notes | 文字列 | メモ | デジタル限定 |

---

## データ型定義（TypeScript）

### RewardData

```typescript
interface RewardData {
  reward_id: string;              // "R001"
  title: string;                  // "デジタル限定"
  price: number;                  // 3000
  description: string;            // "PDF報告書"
  requires_shipping: boolean;     // false
  image_url: string;              // Imgur URL
}
```

### BackerData

```typescript
interface BackerData {
  backer_id: string;              // "B001"
  name: string;                   // "田中太郎"
  email: string;                  // "tanaka@example.com"
  phone_number?: string;          // "090-1234-5678"（配送必須時）
  postal_code?: string;           // "431-3125"（配送必須時）
  prefecture?: string;            // "静岡県"（配送必須時）
  city?: string;                  // "浜松市北区"（配送必須時）
  address_line?: string;          // "新都田1-2-3"（配送必須時）
  created_at: string;             // ISO 8601 timestamp
  updated_at: string;             // ISO 8601 timestamp
}
```

### BackingData

```typescript
interface BackingData {
  backing_id: string;             // "BACK001"
  backer_id: string;              // "B001"（FK: backers）
  backing_date: string;           // ISO 8601 timestamp
  total_amount: number;           // 8000
  payment_method: 'paypal' | 'jpyc' | 'bank';
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'pending' | 'received' | 'shipped' | 'completed';
  transaction_id?: string;        // "paypal_tx_123"
  created_at: string;             // ISO 8601 timestamp
  notes?: string;                 // 管理者メモ
}
```

### BackingItemData

```typescript
interface BackingItemData {
  backing_item_id: string;        // "BIT001"
  backing_id: string;             // "BACK001"（FK: backings）
  reward_id: string;              // "R001"（FK: rewards）
  quantity: number;               // 1
  unit_price: number;             // 3000
  subtotal: number;               // 3000
  notes?: string;                 // メモ
}
```

### DashboardData

```typescript
interface DashboardData {
  targetAmount: number;           // 100000
  currentAmount: number;          // 76500
  backerCount: number;            // 12
  achievementRate: number;        // 76.5
  remainingAmount: number;        // 23500
  rewardStats: {
    [reward_id: string]: number;  // { "R001": 5, "R002": 3, "R003": 2 }
  };
}
```

---

# ページ構成

## ページツリー

```
/
├─ page.tsx
│  └─ ホームページ
│     ├─ キャンペーン紹介テキスト
│     ├─ 進捗ダッシュボード（dashboard データ表示）
│     ├─ リターン一覧プレビュー
│     └─ 「支援する」ボタン → /backing

/backing
├─ page.tsx
│  └─ リターン選択ページ
│     ├─ RewardSelector（複数選択対応）
│     ├─ 選択内容確認
│     └─ 「チェックアウトへ」ボタン

/backing/checkout
├─ page.tsx
│  └─ チェックアウトページ
│     ├─ 選択リターン確認
│     ├─ 合計金額表示
│     ├─ BackingCheckoutForm
│     │  ├─ 支援者名（必須）
│     │  ├─ メール（必須）
│     │  ├─ 電話番号（配送必須の場合のみ）
│     │  ├─ 郵便番号（配送必須の場合のみ）
│     │  ├─ 都道府県（配送必須の場合のみ）
│     │  ├─ 市区町村（配送必須の場合のみ）
│     │  ├─ 番地以下（配送必須の場合のみ）
│     │  └─ 決済方法選択
│     ├─ 決済ボタン
│     └─ キャンセルボタン

/backing/confirmation
└─ page.tsx
   └─ 完了画面
      ├─ 支援ID（backer_id）
      ├─ リターン内容確認
      ├─ 合計金額
      ├─ メール送信確認
      └─ 「ホームに戻る」ボタン
```

---

# 機能仕様

## 機能1: リターン表示・選択

### ホームページ (/)

**表示内容**:
- キャンペーン紹介テキスト（自由記述）
- 進捗ダッシュボード
  - 目標金額 / 現在の支援金額 / 支援者数
  - プログレスバー（達成率）
  - リターン別支援者数
- リターン一覧（3～5個のカード）
- 「支援する」ボタン

**データ取得**:
```typescript
const dashboard = await getPublicDashboardData();    // crowdfunding-sheet!dashboard
const rewards = await getRewardsForPublic();         // crowdfunding-sheet!rewards
```

---

### リターン選択ページ (/backing)

**機能**:
- RewardSelector コンポーネント
  - 各リターンカード表示
  - 「このリターンを選ぶ」ボタン + 個数入力（1～N）
  - 複数リターン選択可能
  - 選択リターン一覧表示
  - 合計金額自動計算

**実装詳細**:
```typescript
// BackingContext で管理
const selectedRewards = [
  { reward_id: 'R001', title: '...', price: 3000, quantity: 1, requires_shipping: false },
  { reward_id: 'R002', title: '...', price: 5000, quantity: 2, requires_shipping: true }
]

const totalAmount = selectedRewards.reduce((sum, r) => sum + (r.price * r.quantity), 0);
// = 3000 * 1 + 5000 * 2 = 13000
```

**条件判定**:
```typescript
const hasShippingRequirement = selectedRewards.some(r => r.requires_shipping);
// true なら BackingCheckout で住所入力を表示
```

---

## 機能2: チェックアウト

### チェックアウトページ (/backing/checkout)

**入力フィールド**:
- 支援者名（必須）
- メールアドレス（必須）
- 電話番号（hasShippingRequirement === true のみ表示・必須）
- 郵便番号（hasShippingRequirement === true のみ表示・必須）
- 都道府県（hasShippingRequirement === true のみ表示・必須）
- 市区町村（hasShippingRequirement === true のみ表示・必須）
- 番地以下（hasShippingRequirement === true のみ表示・必須）
- 決済方法選択（ラジオボタン）
  - 銀行振込
  - PayPal
  - JPYC

**バリデーション**:
- メール形式確認
- 条件付きフィールドのバリデーション
- 決済方法選択確認

**送信処理**:
```typescript
const handleCheckout = async () => {
  const backerData = {
    name, email, phone_number, postal_code, prefecture, city, address_line,
    reward_ids: selectedRewards.map(r => r.reward_id),
    total_amount: totalAmount,
    payment_method: selectedPaymentMethod,  // 'paypal' | 'jpyc' | 'bank'
    payment_status: 'pending'  // 後で更新
  };
  
  // 決済方法に応じて分岐
  if (paymentMethod === 'paypal') {
    // PayPalCheckout へ
  } else if (paymentMethod === 'jpyc') {
    // JPYCPayment へ
  } else {
    // BankTransferForm へ
  }
};
```

---

## 機能3: 配送情報の条件付き表示

**ロジック**:
```typescript
// BackingCheckout.tsx 内

const hasShippingRequirement = selectedRewards.some(r => r.requires_shipping);

return (
  <form>
    {/* 常に表示 */}
    <input name="name" placeholder="支援者名" required />
    <input name="email" placeholder="メール" type="email" required />

    {/* 条件付き表示 */}
    {hasShippingRequirement && (
      <>
        <input name="phone_number" placeholder="電話番号" required />
        <input name="postal_code" placeholder="郵便番号" required />
        <input name="prefecture" placeholder="都道府県" required />
        <input name="city" placeholder="市区町村" required />
        <textarea name="address_line" placeholder="番地以下" required />
      </>
    )}

    {/* 常に表示 */}
    <PaymentMethodSelector />
  </form>
);
```

---

# 決済フロー

## フロー1: 銀行振込

```
1. ユーザーが「銀行振込」を選択
2. BankTransferForm.tsx 表示
3. 「注文を確定する」をクリック
4. POST /api/checkout/create-order
   ├─ 支援者情報を crowdfunding-customer!backers に保存
   ├─ 支援ヘッダーを crowdfunding-customer!backings に保存
   ├─ 支援詳細を crowdfunding-customer!backing_items に保存
   ├─ payment_status = 'pending'
   └─ メール送信
5. /backing/confirmation へリダイレクト
6. 完了画面表示（支援ID + 振込案内メール確認促促）
7. 管理者が手動で payment_status = 'completed' に変更（Google Sheets 上）
```

**メール内容**:
- 支援者へ: 支援確認 + 振込先情報 + 支援ID
- 管理者へ: 新規支援通知 + 支援者情報

---

## フロー2: JPYC決済

```
1. ユーザーが「JPYC」を選択
2. Web3Context.connectWallet() で MetaMask 接続
3. JPYCPayment.tsx 表示
4. ユーザーが EIP-712 署名を承認
5. 署名後、バックエンドで以下を実行
   ├─ 署名検証
   ├─ Polygon RPC で permit() + transferFrom() 実行
   ├─ トランザクション完了
   ├─ 支援者情報を crowdfunding-customer!backers に保存
   ├─ 支援ヘッダーを crowdfunding-customer!backings に保存
   ├─ 支援詳細を crowdfunding-customer!backing_items に保存
   ├─ payment_status = 'completed'
   └─ メール送信
8. /backing/confirmation へリダイレクト
9. 完了画面表示（支援ID + TX Hash + Polygonscan リンク）
```

**メール内容**:
- 支援者へ: 支援確認 + Polygonscan リンク + 支援ID
- 管理者へ: 新規支援通知 + TX Hash

---

## フロー3: PayPal決済

```
1. ユーザーが「PayPal」を選択
2. PayPalCheckout.tsx 表示（PayPal Buttons）
3. ユーザーが PayPal でログイン・決済実行
4. onApprove() で transaction_id を取得
5. バックエンドに transaction_id を送信
6. POST /api/checkout/paypal-confirm
   ├─ PayPal API で決済検証
   ├─ 支援者情報を crowdfunding-customer!backers に保存
   ├─ 支援ヘッダーを crowdfunding-customer!backings に保存
   ├─ 支援詳細を crowdfunding-customer!backing_items に保存
   ├─ payment_status = 'completed'
   └─ メール送信
7. /backing/confirmation へリダイレクト
8. 完了画面表示（支援ID + 支援確認）
```

**メール内容**:
- 支援者へ: 支援確認 + 支援ID
- 管理者へ: 新規支援通知 + 支援者情報

---

# メール送信

## メール1: 支援確認メール（支援者向け）

**宛先**: 支援者メールアドレス  
**タイミング**: 決済完了直後

**内容（銀行振込の場合）**:
```
件名: 【確認】ご支援ありがとうございます (ID: B001)

本文:
ご支援ありがとうございます。

【支援内容】
支援ID: B001
リターン: デジタル限定 × 1, ステッカー × 2
合計金額: ¥13,000

【振込先情報】
銀行名: 〇〇銀行
支店名: 〇〇支店
口座種別: 普通
口座番号: 1234567
口座名義: 〇〇〇〇

⚠️ 3営業日以内にお振込みください。
期限を過ぎたご支援はキャンセルとなります。
```

**内容（PayPal/JPYC の場合）**:
```
件名: 【確認】ご支援ありがとうございます (ID: B001)

本文:
ご支援ありがとうございます。

【支援内容】
支援ID: B001
リターン: デジタル限定 × 1, ステッカー × 2
合計金額: ¥13,000
決済方法: PayPal / JPYC

ご質問がある場合は、このメールにご返信ください。
```

---

## メール2: 支援者情報確認メール（配送必須の場合）

**内容追記**:
```
【配送先情報】
お名前: 田中太郎
電話番号: 090-1234-5678
郵便番号: 431-3125
都道府県: 静岡県
市区町村: 浜松市北区
番地以下: 新都田1-2-3

上記の住所にご配送いたします。
配送予定時期: 〇月〇日以降
```

---

## メール3: 新規支援通知メール（管理者向け）

**宛先**: process.env.ADMIN_EMAIL  
**タイミング**: 決済完了直後

**内容**:
```
件名: 【新規支援】支援者ID B001

本文:
新しい支援がありました。

支援者ID: B001
支援者名: 田中太郎
メール: tanaka@example.com
電話: 090-1234-5678
郵便番号: 431-3125
住所: 静岡県 浜松市北区 新都田1-2-3

リターン: R001 (デジタル限定 × 1), R002 (ステッカー × 2)
支援金額: ¥13,000
決済方法: PayPal
支払いステータス: completed
決済ID: paypal_tx_123456

Google Sheets で確認してください。
```

---

# 実装ロードマップ

## Phase 1: Google Sheets 準備 ✅
- [x] crowdfunding-sheet 作成
- [x] crowdfunding-customer 作成
- [x] rewards シート構築
- [x] dashboard シート構築（数式設定）
- [x] backers, backings, backing_items シート構築

## Phase 2: Context・状態管理 ✅
- [x] BackingContext.tsx 作成
- [x] 型定義（RewardData, BackerData など）

## Phase 3: リターン選択UI ✅
- [x] RewardSelector.tsx 作成
- [x] RewardCard.tsx 作成
- [x] 複数選択ロジック実装
- [x] 合計金額計算実装
- [x] ホームページ実装（Dashboard、RewardSelector）

## Phase 4: チェックアウトUI ✅
- [x] /backing/page.tsx 実装（リターン選択ページ）
- [x] /backing/checkout/page.tsx 実装（チェックアウトページ）
- [x] フォーム実装
- [x] 条件付き表示ロジック
- [x] バリデーション実装

## Phase 5: 銀行振込 🔜
- [ ] BankTransferForm.tsx 流用
- [ ] 銀行振込フロー実装

## Phase 6: JPYC決済 🔜
- [ ] JPYCPayment.tsx 流用
- [ ] Web3Context.tsx 流用
- [ ] JPYC 決済フロー実装

## Phase 7: PayPal決済 🔜
- [ ] PayPalCheckout.tsx 作成
- [ ] PayPal SDK インストール・設定
- [ ] 決済フロー実装

## Phase 8: バックエンド API 🔜
- [ ] POST /api/checkout/create-order（銀行振込・PayPal）
- [ ] POST /api/checkout/jpyc-confirm（JPYC）
- [ ] GET /api/dashboard（公開用）
- [ ] GET /api/rewards（公開用）
- [ ] googleSheets.ts 関数追加

## Phase 9: メール送信 🔜
- [ ] emailService.ts テンプレート追加
- [ ] 決済後のメール送信実装

## Phase 10: 確認ページ 🔜
- [ ] /backing/confirmation/page.tsx（完了画面）

---

**合計**: 約 310 分（5.2時間）

---

# 環境変数

## 必須環境変数

```env
# Google Sheets
CROWDFUNDING_SHEET_ID=19ON9_FmAu6cltqm7SzXw1OcG-jC_yOJybkTIUJef8mE
CROWDFUNDING_CUSTOMER_SHEET_ID=1CrG-cAowbzyPYHC03C5B6n6h8PP-qF5CGleay2B4me4
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET=xxx

# JPYC（既存）
NEXT_PUBLIC_JPYC_TOKEN_ADDRESS=0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29
NEXT_PUBLIC_JPYC_RECEIVER_ADDRESS=0x626249b236a5C6952C8F9DCB99344E47b1bD8759
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_CHAIN_ID=137

# 管理者メール
ADMIN_EMAIL=admin@example.com

# 外部画像 URL
NEXT_PUBLIC_LOGO_IMAGE_URL=https://i.imgur.com/Xg72KDR.png
```

---

# 再利用性・テンプレート化

## 将来のクラファンプロジェクト立ち上げ時

### 変更すべき部分

```
├─ Google Sheets（2ファイル）
│  ├─ crowdfunding-sheet
│  │  ├─ rewards（リターン情報）
│  │  └─ dashboard（目標金額など）
│  └─ crowdfunding-customer
│     ├─ backers（支援者情報・初期化）
│     ├─ backings（支援ヘッダー・初期化）
│     └─ backing_items（支援詳細・初期化）
│
├─ ホームページテキスト
│  ├─ キャンペーン説明
│  ├─ プロジェクト画像 URL
│  └─ CTA テキスト
│
├─ 環境変数
│  ├─ CROWDFUNDING_SHEET_ID
│  ├─ CROWDFUNDING_CUSTOMER_SHEET_ID
│  ├─ NEXT_PUBLIC_PAYPAL_CLIENT_ID
│  ├─ NEXT_PUBLIC_LOGO_IMAGE_URL
│  └─ ADMIN_EMAIL
│
└─ メールテンプレート
   ├─ プロジェクト名
   ├─ 金額表記
   └─ 振込先情報
```

### 再利用できる部分

```
├─ BackingContext.tsx
├─ RewardSelector.tsx
├─ RewardCard.tsx
├─ /backing ページ群
├─ PayPalCheckout.tsx
├─ BankTransferForm.tsx
├─ JPYCPayment.tsx
├─ Web3Context.tsx
├─ src/lib/googleSheets.ts
├─ src/lib/emailService.ts
└─ API Routes（/api/checkout など）
```

---

# 補足

## 注意事項

### Google Sheets（2シート版）

- ✅ rewards と dashboard は crowdfunding-sheet（公開用）
- ✅ backers, backings, backing_items は crowdfunding-customer（非公開用）
- ✅ dashboard シートの計算式は別ファイル参照（IMPORTRANGE）
- ✅ reward_ids は backings シートでカンマ区切り保存（"R001,R002"）

### 画像管理

- ✅ **リターン画像**: Google Sheets の image_url 列から URL 読み込み
- ✅ **その他の画像**（ロゴ、ヒーロー等）: Imgur など外部 URL で配置
- ✅ next.config.ts に Imgur ドメイン許可設定済み

### 決済

- ✅ PayPal: 日本のクレジットカード対応確認済み
- ✅ JPYC: ガスレス決済（MetaMask 署名のみ）
- ✅ 銀行振込: 手動確認（payment_status は Google Sheets で管理）

### セキュリティ

- ✅ backers, backings, backing_items シートのフロントエンドアクセス禁止
- ✅ API Routes で顧客情報を扱う際は HTTPS のみ
- ✅ 環境変数は .env.local で管理（.gitignore に追加）
- ✅ 画像 URL（ロゴなど）は環境変数で管理

---

**ドキュメント確定日**: 2025年11月14日  
**バージョン**: 2.0（2シート版）  
**ステータス**: 実装進行中（Phase 4 完了、Phase 5-10 待機中）

---