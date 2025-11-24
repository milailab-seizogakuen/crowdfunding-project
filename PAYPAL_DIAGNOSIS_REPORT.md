## PayPal 実装診断 最終レポート

### ✅ チェックリスト

- [x] `PayPalCheckout.tsx` が存在し、正しく実装されている
- [ ] `paypal-confirm` API エンドポイントが存在し、正しく実装されている (🚨 **問題あり**)
- [x] PayPal SDK スクリプトが HTML に正しく読み込まれている
- [ ] 環境変数が正しく設定されている (🚨 **問題あり**)
- [x] `package.json` に PayPal 関連パッケージが含まれている
- [ ] 決済フロー全体が正しく設計されている (🚨 **問題あり**)

---

## 🚨 発見された問題点と解決案

診断の結果、エラー `INVALID_RESOURCE_ID` の原因は、**開発用のSandbox環境と本番用のLive環境の設定が混在していること**だと断定できます。具体的には、以下の2つの重大な問題が発見されました。

### 問題 1: バックエンドが本番(Live)環境のURLにアクセスしている

- **ファイル**: `src/lib/paypal.ts`
- **原因**: PayPal APIのURLが、Sandbox用(`https://api-m.sandbox.paypal.com`) ではなく、本番用(`https://api-m.paypal.com`)にハードコードされています。フロントエンドはSandbox環境でOrderを作成しているため、バックエンドがそのOrder IDを本番環境に問い合わせても「存在しない」という結果になり、`INVALID_RESOURCE_ID` エラーが発生します。
- **影響**: Sandbox環境での一切の決済テストが成功しません。
- **解決案**: 環境変数に応じてAPIのベースURLを動的に切り替えるように修正します。

#### 修正コード (`src/lib/paypal.ts`)

```typescript:src/lib/paypal.ts
// ファイルの先頭に追加
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// getPayPalAccessToken 関数の修正
export async function getPayPalAccessToken(): Promise<string> {
  // ...
  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/oauth2/token`, // ◀️ 動的に変更
    { /* ... */ }
  );
  // ...
}

// capturePayPalOrder 関数の修正
export async function capturePayPalOrder(orderId: string): Promise<any> {
  // ...
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, // ◀️ 動的に変更
    { /* ... */ }
  );
  // ...
}
```

---

### 問題 2: 環境変数の設定ミスと不適切な読み込み

- **ファイル**: `.env.local`, `src/lib/paypal.ts`
- **原因**:
  1.  `.env.local`内で、Sandbox用とLive用の両方で `PAYPAL_SECRET` という同じキー名が使われています。これにより、Sandbox用のSecretがLive用の値で上書きされてしまっています。
  2.  `src/lib/paypal.ts` が、環境（開発/本番）を考慮せずに常に同じ環境変数（`NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`）を読み込もうとしています。
- **影響**: バックエンドが常に本番用の認証情報を使おうとするため、Sandbox環境での認証が通りません。
- **解決案**:
  1.  `.env.local` のキー名を一意にします（例: `PAYPAL_SECRET_SANDBOX`）。
  2.  `src/lib/paypal.ts` で、環境に応じて読み込む環境変数を切り替えるように修正します。

#### 修正1: `.env.local` のキー名変更

```dotenv:.env.local
# PayPal - Sandbox（開発用）
NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX=...
PAYPAL_SECRET_SANDBOX=... # ◀️ キー名を変更

# PayPal - Live（本番用）
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
```

#### 修正2: `src/lib/paypal.ts` の認証情報読み込み修正

```typescript:src/lib/paypal.ts
export async function getPayPalAccessToken(): Promise<string> {
  const isProduction = process.env.NODE_ENV === 'production';

  const clientId = isProduction
    ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX;

  const clientSecret = isProduction
    ? process.env.PAYPAL_SECRET
    : process.env.PAYPAL_SECRET_SANDBOX; // ◀️ Sandbox用のSecretを読み込む

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not set');
  }
  // ...
}
```

---

##  推奨される次のステップ

上記の問題1と問題2の両方を修正することで、`INVALID_RESOURCE_ID` エラーは解決され、開発環境でPayPalのSandbox決済が正常に機能するようになります。