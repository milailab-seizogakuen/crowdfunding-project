'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBackingContext } from '@/context/BackingContext';
import { JPYCPayment } from '@/components/payment/JPYCPayment';

/**
 * /backing/checkout/jpyc ページ
 * JPYC (暗号資産) 決済ページ
 * - JPYCPayment コンポーネント表示
 * - 署名生成 + トランザクション実行
 * - 完了後に確認ページへ遷移
 */
export default function JPYCCheckoutPage() {
  const router = useRouter();
  const { selectedRewards, totalAmount, backer } = useBackingContext();

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

  // 決済成功時のハンドラ
  const handlePaymentSuccess = async (transactionHash: string) => {
    console.log('✅ JPYC 決済成功:', transactionHash);

    try {
      // 1. selectedRewards を items 配列に変換
      const items = selectedRewards.map(reward => ({
        reward_id: reward.reward_id,
        quantity: reward.quantity,
        unit_price: reward.unit_price,
      }));

      // 2. backing オブジェクトを構築
      const backing = {
        total_amount: totalAmount,
        payment_method: 'jpyc',
        payment_status: 'completed',
        order_status: 'received',
        transaction_id: transactionHash,
        notes: 'JPYC payment',
      };

      // 3. /api/checkout にリクエスト送信
      console.log('🚀 /api/checkout にリクエスト送信...');
      console.log('  - Backing:', JSON.stringify(backing));
      console.log('  - Items:', JSON.stringify(items));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backer,
          backing,
          items,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '支援情報の保存に失敗しました');
      }

      console.log('✅ 支援情報を Google Sheets に保存:', result);

      const backing_id = result.data?.backing_id;
      if (!backing_id) {
        throw new Error('レスポンスに backing_id が含まれていません');
      }

      // 4. 確認ページへリダイレクト
      router.push(`/backing/confirmation?backing_id=${backing_id}&method=jpyc&tx_hash=${transactionHash}`);
    } catch (error) {
      console.error('❌ 支援情報の保存中にエラーが発生しました:', error);
      alert(error instanceof Error ? error.message : '不明なエラーが発生しました。管理者にお問い合わせください。');
    }
  };

  // 決済失敗時のハンドラ
  const handlePaymentError = (error: string) => {
    console.error('❌ JPYC 決済エラー:', error);
    alert(`エラーが発生しました: ${error}`);
  };

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
            🔗 JPYC で決済
          </h1>
          <p className="text-xl text-gray-600">
            MetaMask を使用して、ガスレスで暗号資産 (JPYC) により支援できます。
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メイン決済フォーム */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🔐</span>JPYC 決済フロー
              </h2>

              {/* 説明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm font-semibold mb-3">📋 決済フロー</p>
                <ol className="text-blue-700 text-sm space-y-2">
                  <li><strong>ステップ 1:</strong> MetaMask で EIP-712 署名を生成（ガス代なし）</li>
                  <li><strong>ステップ 2:</strong> バックエンドに署名を送信</li>
                  <li><strong>ステップ 3:</strong> Polygon で ガスレストランザクション実行</li>
                  <li><strong>ステップ 4:</strong> 完了ページへリダイレクト</li>
                </ol>
              </div>

              {/* JPYCPayment コンポーネント */}
              <JPYCPayment
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-yellow-800 font-semibold mb-3">⚠️ ご注意</p>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>✓ MetaMask を事前にインストール・ウォレット作成してください</li>
                <li>✓ Polygon ネットワークに接続してください</li>
                <li>✓ JPYC トークンを十分に保有していることを確認してください</li>
                <li>✓ トランザクションは取り消せません</li>
              </ul>
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
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-3 px-4 rounded-lg border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold transition-all"
                >
                  MetaMask をインストール →
                </a>
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
