/**
 * PayPal API ユーティリティ関数
 * - OAuth 2.0 トークン取得
 * - Orders API - Order Capture（金額検証）
 */

// 環境設定
const isProduction = process.env.NODE_ENV === 'production';

// PayPal API のベースURLを環境に応じて切り替え
const PAYPAL_API_BASE = isProduction
  ? 'https://api-m.paypal.com'
  : 'https://api.sandbox.paypal.com';

/**
 * PayPal OAuth 2.0 アクセストークンを取得
 */
export async function getPayPalAccessToken(): Promise<string> {
  // 環境に応じた認証情報を選択
  const clientId = isProduction
    ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX;
  const clientSecret = isProduction
    ? process.env.PAYPAL_SECRET_LIVE
    : process.env.PAYPAL_SECRET_SANDBOX;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not set for the current environment.');
  }

  try {
    console.log(`🔐 Requesting PayPal access token for ${isProduction ? 'Live' : 'Sandbox'}...`);
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(
      `${PAYPAL_API_BASE}/v1/oauth2/token`, // URLを動的に設定
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ PayPal token request failed:', errorData);
      throw new Error(`PayPal token request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PayPal access token obtained');
    return data.access_token;
  } catch (error) {
    console.error('❌ Error getting PayPal access token:', error);
    throw error;
  }
}

/**
 * PayPal Orders API - Capture Payment
 * orderId を検証して、決済を確定させる
 * 
 * @param orderId - PayPal Order ID
 * @returns Order 詳細情報（amount, status など）
 */
export async function capturePayPalOrder(orderId: string): Promise<any> {
  try {
    console.log(`💳 Capturing PayPal order: ${orderId}`);

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, // URLを動的に設定
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `${Date.now()}`, // Idempotency key
          'Prefer': 'return=representation',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ PayPal capture failed:', errorData);
      throw new Error(`PayPal capture failed: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Full PayPal capture response:', JSON.stringify(data, null, 2));
    console.log(`✅ PayPal order captured: ${data.id} (${data.status})`);
    
    return data;
  } catch (error) {
    console.error('❌ Error capturing PayPal order:', error);
    throw error;
  }
}

/**
 * PayPal Order の金額を抽出
 * 
 * @param orderData - capturePayPalOrder() の戻り値
 * @returns 金額（数値）
 */
export function extractPayPalAmount(orderData: {
  purchase_units?: Array<{
    amount?: {
      value: string;
    };
  }>;
}): number {
  // ★再修正: ユーザー指摘の正しいパスに変更
  const value = orderData.purchase_units?.[0]?.amount?.value;
  if (!value) {
    throw new Error('PayPal order amount not found');
  }
  return Number(value);
}