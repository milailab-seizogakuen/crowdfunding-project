'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBackingContext } from '@/context/BackingContext';
import { PayPalCheckout } from '@/components/PayPalCheckout';

/**
 * /backing/checkout/paypal ページ
 * PayPal 決済ページ
 * - PayPal Checkout Integration
 * - 決済後に確認ページへ遷移
 */
export default function PayPalCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedRewards, totalAmount: contextAmount, backer } = useBackingContext();

  // URL パラメータから金額を取得
  const amountFromUrl = searchParams.get('amount') ? parseInt(searchParams.get('amount')!) : 0;
  const totalAmount = amountFromUrl || contextAmount || 0;

  useEffect(() => {
    console.log(' PayPal ページ読み込み');
    console.log('  - selectedRewards:', selectedRewards);
    console.log('  - totalAmount:', totalAmount);
    console.log('  - backer:', backer);
  }, [selectedRewards, totalAmount, backer]);

  // リターンが選択されていない場合
  if (selectedRewards.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            リターンが選択されていません
          </h1>
          <p className="text-gray-600 mb-6">
            リターン選択ページからリターンを選択してください。
          </p>
          <Link
            href="/backing"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            リターン選択に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                🚄 NEXT RAIL
              </Link>
            </div>
            <Link
              href="/backing"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← リターン選択に戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ページタイトル */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💳 PayPal で決済
          </h1>
          <p className="text-xl text-gray-600">
            PayPal を使用して、クレジットカードまたはデビットカードで支援できます。
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メイン決済フォーム */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🔐</span>PayPal 決済
              </h2>

              {/* 説明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm font-semibold mb-3">📋 決済フロー</p>
                <ol className="text-blue-700 text-sm space-y-2">
                  <li><strong>ステップ 1:</strong> 「PayPal で支援」ボタンをクリック</li>
                  <li><strong>ステップ 2:</strong> PayPal ログイン（PayPal アカウント不要）</li>
                  <li><strong>ステップ 3:</strong> クレジットカード情報を入力</li>
                  <li><strong>ステップ 4:</strong> 決済確認</li>
                  <li><strong>ステップ 5:</strong> 完了ページへリダイレクト</li>
                </ol>
              </div>

              {/* PayPal 決済コンポーネント */}
              <div className="mb-6">
                <PayPalCheckout />
              </div>

              {/* 注意事項 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-semibold mb-3">📝 PayPal について</p>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>✓ PayPal アカウントがなくてもクレジットカードで支払えます</li>
                  <li>✓ 世界中のクレジットカード・デビットカードに対応</li>
                  <li>✓ 安全で確立された決済システムです</li>
                  <li>✓ 通常数分で決済が完了します</li>
                </ul>
              </div>
            </div>

            {/* 補足 */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6">
              <h3 className="font-bold text-gray-900 mb-4">⚙️ 技術情報</h3>
              <p className="text-gray-700 text-sm mb-3">
                PayPal Checkout を使用することで、安全で迅速な決済処理が実現できます。
              </p>
              <p className="text-gray-600 text-sm">
                <strong>実装予定:</strong> Phase 7 で PayPal SDK の統合とフローの実装が予定されています。
              </p>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* 選択リターン確認 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📦</span>注文内容
                </h3>

                <div className="space-y-4 mb-4">
                  {selectedRewards.map((reward) => (
                    <div
                      key={reward.reward_id}
                      className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {reward.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          ¥{reward.unit_price.toLocaleString()} × {reward.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-blue-600 text-sm whitespace-nowrap">
                        ¥{(reward.unit_price * reward.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 合計金額 */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">合計金額</span>
                    <span className="text-3xl font-bold text-blue-600">
                      ¥{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 支援者情報 */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">👤 支援者情報</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-semibold">名前:</span> {backer.name}</p>
                  <p><span className="font-semibold">メール:</span> {backer.email}</p>
                </div>
              </div>

              {/* リンク */}
              <div className="space-y-2">
                <Link
                  href="/backing"
                  className="block text-center py-3 px-4 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition-all"
                >
                  リターン選択に戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="border-t border-gray-700 pt-8">
            <p className="text-center text-sm">
              &copy; 2025 NEXT RAIL. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
