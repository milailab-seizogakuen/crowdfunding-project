# クラウドファンディングサイト 技術調査レポート

**調査日**: 2025年1月  
**プロジェクト名**: crowdfunding-project

---

## 1. 技術スタック確認

### 1.1 Next.js のバージョン・設定

**バージョン**: `16.0.3` (package.json より)

**TypeScript 設定** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**特徴**:
- App Router を使用（`src/app/` ディレクトリ構造）
- TypeScript の strict モード有効
- パスエイリアス `@/*` で `src/*` を参照

### 1.2 Tailwind CSS の設定

**バージョン**: `^4` (Tailwind CSS v4)

**設定ファイル**: `src/app/globals.css`
```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

**特徴**:
- Tailwind CSS v4 の新しい構文を使用
- カスタムテーマ変数を定義
- ダークモード対応（`prefers-color-scheme`）

### 1.3 UI ライブラリ

**使用ライブラリ**:
- **Reown AppKit** (`@reown/appkit@^1.8.14`): Web3 ウォレット接続UI
- **Wagmi** (`wagmi@^2.19.5`): Ethereum インタラクション
- **Viem** (`viem@^2.41.2`): Ethereum ユーティリティ
- **Ethers.js** (`ethers@^6.15.0`): ブロックチェーン操作
- **PayPal SDK** (`@paypal/react-paypal-js@^8.9.2`): PayPal 決済UI

**UI コンポーネント**:
- カスタムコンポーネント（Tailwind CSS でスタイリング）
- 外部UIライブラリは使用していない（独自実装）

### 1.4 状態管理（Context API）

**実装方法**: React Context API

**主要なContext**:
- `BackingContext` (`src/context/BackingContext.tsx`)
  - リターン選択状態
  - 支援者情報
  - 決済方法
  - JPYC決済状態
  - 手数料計算ロジック

**特徴**:
- 単一のContextでアプリ全体の状態を管理
- `useCallback` でパフォーマンス最適化
- システム利用料（5%）とJPYC割引（5%）の計算ロジックを含む

---

## 2. API Routes の一覧

### 2.1 `/api/checkout` (POST)

**ファイルパス**: `src/app/api/checkout/route.ts`

**処理概要**:
- 注文作成エンドポイント
- Google Sheets に支援情報を保存
- バリデーション（支援者情報、決済方法、配送先住所）

**使用している外部API**:
- Google Sheets API（`googleSheets.ts` 経由）

**環境変数の依存関係**:
- `CROWDFUNDING_SHEET_ID`
- `CROWDFUNDING_CUSTOMER_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "backing_id": "BACK001",
    "backer_id": "B001",
    "total_amount": 13000,
    "payment_method": "paypal"
  }
}
```

### 2.2 `/api/checkout/paypal-confirm` (POST)

**ファイルパス**: `src/app/api/checkout/paypal-confirm/route.ts`

**処理概要**:
- PayPal 決済の確定処理
- PayPal Orders API で Order を Capture
- 金額検証（改ざん防止）
- Google Sheets に支援情報を保存

**使用している外部API**:
- PayPal Orders API (`https://api-m.paypal.com/v2/checkout/orders/{orderId}/capture`)
- Google Sheets API

**環境変数の依存関係**:
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- `CROWDFUNDING_CUSTOMER_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

**処理フロー**:
1. PayPal Order を Capture
2. 金額検証（PayPal金額 vs 期待金額）
3. Google Sheets に支援情報を保存

### 2.3 `/api/dashboard` (GET)

**ファイルパス**: `src/app/api/dashboard/route.ts`

**処理概要**:
- 公開用ダッシュボードデータ取得
- Google Sheets から目標金額、現在の支援金額、支援者数などを取得

**使用している外部API**:
- Google Sheets API（`crowdfunding-sheet!dashboard` シート）

**環境変数の依存関係**:
- `CROWDFUNDING_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "targetAmount": 100000,
    "currentAmount": 76500,
    "backerCount": 45,
    "achievementRate": 76.5,
    "remainingAmount": 23500,
    "rewardStats": {
      "R001": 15,
      "R002": 12
    }
  }
}
```

### 2.4 `/api/rewards` (GET)

**ファイルパス**: `src/app/api/rewards/route.ts`

**処理概要**:
- 公開用リターンデータ取得
- Google Sheets からリターン一覧を取得

**使用している外部API**:
- Google Sheets API（`crowdfunding-sheet!rewards` シート）

**環境変数の依存関係**:
- `CROWDFUNDING_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

**レスポンス例**:
```json
[
  {
    "reward_id": "R001",
    "title": "デジタル報告書セット",
    "unit_price": 3000,
    "description": "PDF報告書",
    "requires_shipping": false,
    "image_url": "https://..."
  }
]
```

### 2.5 `/api/jpyc/execute` (POST)

**ファイルパス**: `src/app/api/jpyc/execute/route.ts`

**処理概要**:
- JPYC ガスレス決済の実行
- EIP-712 署名検証
- Polygon ブロックチェーンでトランザクション実行
  - Step 1: `permit()` 実行
  - Step 2: `transferFrom()` 実行

**使用している外部API**:
- Polygon RPC（Ethereum JSON-RPC）

**環境変数の依存関係**:
- `BACKEND_WALLET_PRIVATE_KEY`（サーバー側のみ）
- `NEXT_PUBLIC_JPYC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_POLYGON_RPC_URL`
- `NEXT_PUBLIC_BACKEND_WALLET_ADDRESS`

**処理フロー**:
1. リクエストバリデーション
2. Deadline チェック
3. EIP-712 署名検証
4. Nonce 確認
5. `permit()` トランザクション実行
6. `transferFrom()` トランザクション実行

**レスポンス例**:
```json
{
  "success": true,
  "permitTxHash": "0x...",
  "transferTxHash": "0x...",
  "transactionHash": "0x..."
}
```

---

## 3. Google Sheets 連携の詳細

### 3.1 使用している関数

**ファイルパス**: `src/lib/googleSheets.ts`

**主要関数**:
- `getRewardsFromSheet()`: リターンデータ取得
- `getDashboardFromSheet()`: ダッシュボードデータ取得
- `createOrder()`: 注文作成（backer + backing + backing_items）
- `getNextBackerId()`: 次の backer_id 生成（B001, B002, ...）
- `getNextBackingId()`: 次の backing_id 生成（BACK001, BACK002, ...）
- `getNextBackingItemId()`: 次の backing_item_id 生成（BIT001, BIT002, ...）

### 3.2 読み込み・書き込みの処理フロー

**読み込み処理**:
1. JWT認証で Google Sheets API クライアントを初期化
2. `spreadsheets.values.get()` でシートデータを取得
3. 配列形式のデータを型安全なオブジェクトに変換

**書き込み処理**:
1. 次のIDを生成（既存データから最大値を取得）
2. `spreadsheets.values.append()` でシートに追加
3. トランザクション的処理（backer → backing → backing_items の順）

### 3.3 現在のシート ID

**公開用シート**:
- `CROWDFUNDING_SHEET_ID`: `crowdfunding-sheet`
  - `rewards` シート: リターンデータ
  - `dashboard` シート: ダッシュボードデータ

**非公開シート**:
- `CROWDFUNDING_CUSTOMER_SHEET_ID`: `crowdfunding-customer`
  - `backers` シート: 支援者情報
  - `backings` シート: 支援ヘッダー
  - `backing_items` シート: 支援詳細

### 3.4 API 認証方式

**認証方式**: サービスアカウント（JWT）

**実装**:
```typescript
const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
```

**必要な環境変数**:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: サービスアカウントのメールアドレス
- `GOOGLE_PRIVATE_KEY`: サービスアカウントの秘密鍵（改行文字を `\n` に変換）

---

## 4. 決済処理の実装

### 4.1 PayPal 連携

**実装状況**: ✅ 実装済み

**ファイルパス**:
- `src/lib/paypal.ts`: PayPal API ユーティリティ
- `src/components/PayPalCheckout.tsx`: PayPal 決済UIコンポーネント
- `src/app/backing/checkout/paypal/page.tsx`: PayPal 決済ページ

**処理フロー**:
1. フロントエンド: PayPal SDK で Order を作成
2. ユーザー: PayPal で決済完了
3. フロントエンド: `/api/checkout/paypal-confirm` に Order ID を送信
4. バックエンド: PayPal Orders API で Order を Capture
5. バックエンド: 金額検証
6. バックエンド: Google Sheets に保存

**使用API**:
- PayPal Orders API v2
- 常に本番環境（`https://api-m.paypal.com`）

**環境変数**:
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`

### 4.2 JPYC / Web3 処理

**実装状況**: ✅ 実装済み

**ファイルパス**:
- `src/lib/jpyc/jpycService.ts`: JPYC サービス
- `src/lib/jpyc/abi.ts`: JPYC コントラクト ABI
- `src/components/payment/JPYCPayment.tsx`: JPYC 決済UI
- `src/app/api/jpyc/execute/route.ts`: JPYC 決済実行API

**処理フロー**:
1. フロントエンド: ウォレット接続（Reown AppKit）
2. フロントエンド: EIP-712 署名生成（`generatePermitSignature()`）
3. フロントエンド: `/api/jpyc/execute` に署名を送信
4. バックエンド: EIP-712 署名検証
5. バックエンド: `permit()` トランザクション実行
6. バックエンド: `transferFrom()` トランザクション実行
7. フロントエンド: `/api/checkout` で Google Sheets に保存

**特徴**:
- ガスレス決済（ユーザーはガス代を支払わない）
- EIP-712 署名を使用
- Polygon ネットワーク

**環境変数**:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_JPYC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_POLYGON_RPC_URL`
- `NEXT_PUBLIC_BACKEND_WALLET_ADDRESS`
- `BACKEND_WALLET_PRIVATE_KEY`（サーバー側のみ）

### 4.3 銀行振込フロー

**実装状況**: ✅ 実装済み

**ファイルパス**: `src/app/backing/checkout/bank/page.tsx`

**処理フロー**:
1. ユーザー: 銀行振込を選択
2. フロントエンド: 振込先情報を表示
3. ユーザー: 手動で振込
4. フロントエンド: `/api/checkout` で Google Sheets に保存
5. ステータス: `payment_status: 'pending'`

**振込先情報**（環境変数から取得）:
- `NEXT_PUBLIC_BANK_NAME`
- `NEXT_PUBLIC_BRANCH_NAME`
- `NEXT_PUBLIC_ACCOUNT_TYPE`
- `NEXT_PUBLIC_ACCOUNT_NUMBER`
- `NEXT_PUBLIC_ACCOUNT_HOLDER`

**注意事項**:
- メール通知機能は未実装（TODO: Phase 9）
- 管理者が手動で `payment_status` を更新する必要がある

### 4.4 トランザクション管理

**実装状況**: Google Sheets で管理

**データ構造**:
- `backings` シート: 支援ヘッダー（決済方法、ステータス、トランザクションID）
- `backing_items` シート: 支援詳細（リターン、数量、単価）

**ステータス管理**:
- `payment_status`: `'pending' | 'completed' | 'failed'`
- `order_status`: `'pending' | 'received' | 'shipped' | 'completed'`

---

## 5. メール送信機能

**実装状況**: ❌ 未実装

**コード内のコメント**:
```typescript
// TODO: Phase 9 でメール送信機能を追加
```

**想定される実装**:
- Gmail API を使用
- サービスアカウントでメール送信
- テンプレート管理（確認メール、振込先通知など）

**必要な機能**:
- 注文確認メール
- 銀行振込先情報メール
- 配送通知メール

---

## 6. コンポーネント構造

### 6.1 ページコンポーネント (`src/app/`)

```
app/
├── page.tsx                    # トップページ（プロジェクト紹介）
├── layout.tsx                  # ルートレイアウト（Providers, BackingProvider）
├── providers.tsx               # Web3 Providers（Wagmi, Reown AppKit）
├── backing/
│   ├── page.tsx               # リターン選択ページ
│   └── checkout/
│       ├── page.tsx           # チェックアウトページ（決済方法選択）
│       ├── bank/
│       │   └── page.tsx       # 銀行振込確認ページ
│       ├── paypal/
│       │   └── page.tsx       # PayPal 決済ページ
│       └── jpyc/
│           └── page.tsx       # JPYC 決済ページ
└── confirmation/
    └── page.tsx               # 決済完了確認ページ
```

### 6.2 UI コンポーネント (`src/components/`)

```
components/
├── Dashboard.tsx              # ダッシュボード（目標金額、達成率など）
├── RewardCard.tsx             # リターンカード
├── RewardSelector.tsx         # リターン選択UI
├── ProjectDetails.tsx         # プロジェクト詳細
├── PayPalCheckout.tsx         # PayPal 決済UI
├── WalletConnectButton.tsx    # ウォレット接続ボタン
└── payment/
    └── JPYCPayment.tsx        # JPYC 決済UI
```

### 6.3 コンポーネント依存関係図

```
RootLayout
├── Providers (Wagmi, Reown AppKit)
│   └── BackingProvider (Context)
│       ├── HomePage
│       │   ├── Dashboard
│       │   ├── RewardSelector
│       │   │   └── RewardCard
│       │   └── ProjectDetails
│       ├── BackingPage
│       │   └── RewardSelector
│       └── CheckoutPage
│           ├── PayPalCheckout (PayPal選択時)
│           ├── JPYCPayment (JPYC選択時)
│           │   └── WalletConnectButton
│           └── BankCheckoutPage (銀行振込選択時)
```

---

## 7. 環境変数一覧

### 7.1 Google Sheets 関連

| 変数名 | 用途 | 公開/非公開 |
|--------|------|------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | サービスアカウントのメールアドレス | 非公開 |
| `GOOGLE_PRIVATE_KEY` | サービスアカウントの秘密鍵 | 非公開 |
| `CROWDFUNDING_SHEET_ID` | 公開用シートID（rewards, dashboard） | 非公開 |
| `CROWDFUNDING_CUSTOMER_SHEET_ID` | 非公開シートID（backers, backings, backing_items） | 非公開 |

### 7.2 PayPal 関連

| 変数名 | 用途 | 公開/非公開 |
|--------|------|------------|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal Client ID | 公開 |
| `PAYPAL_SECRET` | PayPal Secret | 非公開 |

### 7.3 JPYC / Web3 関連

| 変数名 | 用途 | 公開/非公開 |
|--------|------|------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID | 公開 |
| `NEXT_PUBLIC_JPYC_TOKEN_ADDRESS` | JPYC トークンコントラクトアドレス | 公開 |
| `NEXT_PUBLIC_POLYGON_RPC_URL` | Polygon RPC URL | 公開 |
| `NEXT_PUBLIC_BACKEND_WALLET_ADDRESS` | バックエンドウォレットアドレス | 公開 |
| `BACKEND_WALLET_PRIVATE_KEY` | バックエンドウォレット秘密鍵 | 非公開 |

### 7.4 銀行振込関連

| 変数名 | 用途 | 公開/非公開 |
|--------|------|------------|
| `NEXT_PUBLIC_BANK_NAME` | 銀行名 | 公開 |
| `NEXT_PUBLIC_BRANCH_NAME` | 支店名 | 公開 |
| `NEXT_PUBLIC_ACCOUNT_TYPE` | 口座種別 | 公開 |
| `NEXT_PUBLIC_ACCOUNT_NUMBER` | 口座番号 | 公開 |
| `NEXT_PUBLIC_ACCOUNT_HOLDER` | 口座名義 | 公開 |

---

## 8. 本番環境での問題・制限事項

### 8.1 既知のバグ

**なし**（調査時点で確認できたバグはなし）

### 8.2 未実装の機能

1. **メール送信機能**
   - 注文確認メール
   - 銀行振込先情報メール
   - 配送通知メール
   - コード内に `// TODO: Phase 9 でメール送信機能を追加` のコメントあり

2. **管理者ダッシュボード**
   - 注文管理画面
   - ステータス更新機能
   - 現在は Google Sheets で直接管理

3. **エラーハンドリング**
   - 一部のエラー処理が不十分な可能性
   - ユーザーフレンドリーなエラーメッセージの改善余地

### 8.3 パフォーマンス課題

1. **Google Sheets API の呼び出し頻度**
   - ダッシュボードデータの取得が毎回API呼び出し
   - キャッシュ機能がない（Next.js のキャッシュ機能を活用可能）

2. **画像読み込み**
   - リターン画像が外部URL（imgur）を使用
   - Next.js Image コンポーネントの最適化を活用可能

### 8.4 セキュリティに関する注意事項

1. **環境変数の管理**
   - `BACKEND_WALLET_PRIVATE_KEY` は絶対に公開しないこと
   - `.env.local` を Git にコミットしないこと
   - 本番環境では環境変数を適切に設定すること

2. **PayPal 決済**
   - 金額検証を実装済み（改ざん防止）
   - 常に本番環境の PayPal API を使用

3. **JPYC 決済**
   - EIP-712 署名検証を実装済み
   - Deadline チェックを実装済み
   - Nonce チェックを実装済み

4. **Google Sheets API**
   - サービスアカウントの権限を最小限に設定すること
   - 秘密鍵の管理を適切に行うこと

5. **CORS 設定**
   - 現在の設定を確認する必要がある
   - 本番環境のドメインを許可リストに追加すること

---

## 9. 追加情報

### 9.1 システム利用料・JPYC割引機能

**実装状況**: ✅ 実装済み

**ファイルパス**: `src/context/BackingContext.tsx`

**ロジック**:
- システム利用料: 5%（リターン合計の5%）
- JPYC割引: 5%（JPYC決済時のみ、システム利用料と同額）
- 実質: JPYC決済時は手数料0%

**計算式**:
```typescript
const SYSTEM_FEE_RATE = 0.05;
const systemFee = Math.floor(subtotal * SYSTEM_FEE_RATE);
const jpycDiscount = paymentMethod === 'jpyc' ? systemFee : 0;
const total = subtotal + systemFee - jpycDiscount;
```

### 9.2 郵便番号自動入力機能

**実装状況**: ✅ 実装済み

**ファイルパス**: `src/app/backing/checkout/page.tsx`

**使用API**: zipcloud.ibsnet.co.jp（無料の郵便番号検索API）

**処理**:
- 郵便番号入力時に自動で住所を取得
- 都道府県・市区町村を自動入力

---

## 10. まとめ

### 10.1 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React 19, TypeScript
- **スタイリング**: Tailwind CSS v4
- **状態管理**: React Context API
- **Web3**: Wagmi, Viem, Ethers.js, Reown AppKit
- **決済**: PayPal SDK, JPYC (EIP-712), 銀行振込

### 10.2 データ管理

- **公開データ**: Google Sheets（rewards, dashboard）
- **非公開データ**: Google Sheets（backers, backings, backing_items）
- **認証**: Google サービスアカウント（JWT）

### 10.3 決済方法

1. **PayPal**: ✅ 実装済み（クレジットカード、デビットカード）
2. **JPYC**: ✅ 実装済み（ガスレス決済、EIP-712署名）
3. **銀行振込**: ✅ 実装済み（手動確認）

### 10.4 今後の改善点

1. メール送信機能の実装
2. 管理者ダッシュボードの実装
3. パフォーマンス最適化（キャッシュ機能）
4. エラーハンドリングの改善

---

**レポート作成日**: 2025年1月  
**調査者**: AI Assistant
