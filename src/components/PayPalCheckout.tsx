'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';
import { useBackingContext } from '@/context/BackingContext';

/**
 * PayPalCheckout コンポーネント
 * PayPal Checkout SDK を使用した決済フロー
 * - BackingContext から支援者情報・リターン情報を取得
 * - PayPal決済後、API経由でGoogle Sheetsに保存
 * - 完了画面へリダイレクト
 */
export function PayPalCheckout() {
  const router = useRouter();
  const {
    selectedRewards,
    totalAmount,
    backer,  // ◀️ BackingContext から backer 情報を取得
    resetCart,
    calculateCheckoutSummary,
  } = useBackingContext();

  // 手数料込みの金額を計算
  const checkoutSummary = calculateCheckoutSummary('paypal');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // PayPal Client ID（Sandbox / Live の切り替え）
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">
          ⚠️ PayPal Client ID が設定されていません
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'JPY',
        intent: 'capture',
      }}
    >
      <div>
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-red-600 font-bold">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">エラーが発生しました</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-900 text-sm font-semibold mt-2 underline"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ローディング状態 */}
        {(isLoading || isProcessing) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3 items-center">
              <div className="animate-spin">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold text-blue-900">
                  {isLoading ? '注文を作成中...' : '決済を処理中...'}
                </p>
                <p className="text-blue-700 text-sm">
                  {isLoading ? 'しばらくお待ちください' : 'キャンセルしないでください'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PayPal ボタン */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <p className="text-gray-700 text-sm font-semibold mb-2">
              合計金額:{' '}
              <span className="text-2xl text-blue-600">¥{checkoutSummary.total.toLocaleString()}</span>
            </p>
            <p className="text-gray-600 text-xs">
              下のボタンをクリックして PayPal で支払いを完了してください
            </p>
          </div>

          <PayPalButtons
            createOrder={async (data: any, actions) => {
              try {
                setIsLoading(true);
                setError(null);

                const orderData = {
                  intent: 'CAPTURE' as const,
                  purchase_units: [
                    {
                      amount: {
                        currency_code: 'JPY',
                        value: String(Math.round(checkoutSummary.total)),
                      },
                      description: `NEXT RAIL 支援 - ${selectedRewards
                        .map((r) => r.title)
                        .join(', ')}`,
                    },
                  ],
                };

                const order = await actions.order.create(orderData);
                return order;
              } catch (err) {
                const errorMessage =
                  err instanceof Error ? err.message : '注文作成に失敗しました';
                setError(errorMessage);
                throw err;
              } finally {
                setIsLoading(false);
              }
            }}
            onApprove={async (data: any) => {
              try {
                setIsProcessing(true);
                setError(null);

                console.log('📤 PayPal onApprove 開始:', {
                  orderId: data.orderID,
                  backer: {
                    name: backer.name,
                    email: backer.email,
                    phone_number: backer.phone_number,
                  },
                  selectedRewards,
                  totalAmount,
                });

                // ▼▼▼【修正箇所】▼▼▼
                // BackingContext から取得した backer 情報を完全に含める
                const requestBody = {
                  orderId: data.orderID,
                  totalAmount: checkoutSummary.total,  // システム利用料込みの金額
                  selectedRewards,
                  // 必須フィールド
                  name: backer.name,
                  email: backer.email,
                  // オプショナルフィールド（配送必須時のみ）
                  phone_number: backer.phone_number || undefined,
                  postal_code: backer.postal_code || undefined,
                  prefecture: backer.prefecture || undefined,
                  city: backer.city || undefined,
                  address_line: backer.address_line || undefined,
                };
                // ▲▲▲【修正箇所】▲▲▲

                console.log('📤 /api/checkout/paypal-confirm へ送信:', requestBody);

                const response = await fetch('/api/checkout/paypal-confirm', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(
                    errorData.message || '決済確認に失敗しました'
                  );
                }

                const result = await response.json();

                console.log('✅ PayPal confirm API レスポンス:', result);

                // 成功時の処理
                if (result.success && result.backing_id) {
                  resetCart();
                  router.push(`/backing/confirmation?backing_id=${result.backing_id}&amount=${checkoutSummary.total}&method=paypal`);
                } else {
                  throw new Error(result.message || 'backing_id が返されませんでした');
                }
              } catch (err) {
                const errorMessage =
                  err instanceof Error ? err.message : '決済処理に失敗しました';
                setError(errorMessage);
                console.error('❌ PayPal 決済エラー:', err);
              } finally {
                setIsProcessing(false);
              }
            }}
            onError={(err: any) => {
              const errorMessage =
                err?.message || '予期しないエラーが発生しました';
              setError(errorMessage);
              console.error('❌ PayPal エラー:', err);
            }}
            onCancel={() => {
              setError('決済がキャンセルされました');
            }}
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'pay',
            }}
          />
        </div>

        {/* 説明 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6 text-sm text-gray-700">
          <p className="font-semibold text-gray-900 mb-2">💡 ご注意</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• PayPal アカウントがなくてもクレジットカードで支払えます</li>
            <li>• 決済処理中はページを離れないでください</li>
            <li>• SSL 通信で安全に保護されています</li>
          </ul>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}