'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useBackingContext } from '@/context/BackingContext';

export default function BankCheckoutPage() {
  const router = useRouter();
  const {
    selectedRewards,
    backer,
    hasShippingRequirement,
    calculateCheckoutSummary,
  } = useBackingContext();

  // 手数料込みの金額を計算
  const checkoutSummary = calculateCheckoutSummary('bank');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // バリデーション: リターンが選択されていない場合は ホームにリダイレクト
  if (!selectedRewards || selectedRewards.length === 0) {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        router.push('/backing');
      }, 1000);
    }
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://i.imgur.com/92eVr1d.jpeg"
                alt="NEXT RAIL"
                width={112}
                height={56}
                className="h-14 w-auto"
              />
            </Link>
          </div>
        </header>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-4">
              リターンが選択されていません
            </p>
            <p className="text-gray-600">リダイレクト中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 振込先情報（環境変数から取得、デフォルト値を設定）
  const bankInfo = {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'paypay銀行',
    branchName: process.env.NEXT_PUBLIC_BRANCH_NAME || 'かわせみ支店（007）',
    accountType: process.env.NEXT_PUBLIC_ACCOUNT_TYPE || '普通',
    accountNumber: process.env.NEXT_PUBLIC_ACCOUNT_NUMBER || '7930772',
    accountHolder: process.env.NEXT_PUBLIC_ACCOUNT_HOLDER || 'キタユウスケ',
  };

  // 注文確定処理
  const handleConfirmOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!backer || !selectedRewards || selectedRewards.length === 0) {
        setError('支援者情報またはリターン情報が不足しています');
        setIsLoading(false);
        return;
      }

      // 1. selectedRewards を items 配列に変換
      const items = selectedRewards.map(reward => ({
        reward_id: reward.reward_id,
        quantity: reward.quantity,
        unit_price: reward.unit_price,
      }));

      // 2. backing オブジェクトを構築
      const backing = {
        total_amount: checkoutSummary.total,  // システム利用料込みの金額
        payment_method: 'bank',
        payment_status: 'pending',
        order_status: 'pending',
        transaction_id: '', // 銀行振込は不要
        notes: 'Bank transfer',
      };

      // 5. デバッグログを追加
      console.log('🚀 /api/checkout にリクエスト送信...');
      console.log('  - Backing:', JSON.stringify(backing));
      console.log('  - Items:', JSON.stringify(items));

      // 3. /api/checkout へのリクエストボディを修正
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
        throw new Error(result.error || '注文の作成に失敗しました');
      }

      // 4. エラーハンドリングを改善
      const backing_id = result.data?.backing_id;
      if (!backing_id) {
        throw new Error('レスポンスに backing_id が含まれていません');
      }

      console.log('✅ Bank transfer order created:', backing_id);

      // 完了ページへリダイレクト
      router.push(`/backing/confirmation?backing_id=${backing_id}&method=bank`);

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : '注文の確定に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://i.imgur.com/92eVr1d.jpeg"
              alt="NEXT RAIL"
              width={112}
              height={56}
              className="h-14 w-auto"
            />
          </Link>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* ページタイトル */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              🏦 銀行振込で支援
            </h1>
            <p className="text-gray-600">
              以下の振込先情報をご確認の上、お振込みください
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">❌ エラー</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* メインコンテンツ */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 左カラム: 振込先情報とプロセス */}
            <div className="lg:col-span-2 space-y-6">
              {/* ステップ表示 */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-blue-600">
                  支援までの流れ
                </h3>
                <div className="space-y-4">
                  {/* ステップ1 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        支援者情報確認
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        お支払い前に支援者情報をご確認ください
                      </p>
                    </div>
                  </div>

                  {/* ステップ2 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        振込先情報を確認
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        下記の銀行口座にお振込みください
                      </p>
                    </div>
                  </div>

                  {/* ステップ3 */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        注文を確定する
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        下記の「注文を確定する」ボタンをクリック
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 振込先情報カード */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <h3 className="font-bold text-lg text-yellow-900 mb-6">
                  💳 振込先情報
                </h3>

                <div className="space-y-4 text-yellow-900">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold">銀行名</span>
                    <span className="text-right">{bankInfo.bankName}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="font-semibold">支店名</span>
                    <span className="text-right">{bankInfo.branchName}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="font-semibold">口座種別</span>
                    <span className="text-right">{bankInfo.accountType}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="font-semibold">口座番号</span>
                    <span className="text-right font-mono text-lg tracking-widest">
                      {bankInfo.accountNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="font-semibold">口座名義</span>
                    <span className="text-right">{bankInfo.accountHolder}</span>
                  </div>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-bold text-red-900 mb-4">
                  ⚠️ 重要なお知らせ
                </h3>
                <ul className="space-y-2 text-red-800 text-sm">
                  <li>
                    ✓ <strong>3営業日以内</strong>にお振込みください
                  </li>
                  <li>
                    ✓ 期限を過ぎたご支援は
                    <strong>キャンセル</strong>となります
                  </li>
                  <li>✓ 振込手数料はご負担ください</li>
                  <li>
                    ✓ 入金確認後、成果物の発送準備を開始いたします
                  </li>
                  <li>
                    ✓ ご不明な点は、このメールにご返信ください
                  </li>
                </ul>
              </div>

              {/* 支援者情報確認 */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-blue-600 mb-4">
                  📋 支援者情報
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>お名前:</strong> {backer?.name || '-'}
                  </p>
                  <p>
                    <strong>メール:</strong> {backer?.email || '-'}
                  </p>
                  {hasShippingRequirement && (
                    <>
                      <p>
                        <strong>電話番号:</strong> {backer?.phone_number || '-'}
                      </p>
                      <p>
                        <strong>配送先住所:</strong>
                      </p>
                      <div className="ml-4 text-sm text-gray-600">
                        <p>〒{backer?.postal_code || '-'}</p>
                        <p>
                          {backer?.prefecture || '-'} {backer?.city || '-'}
                        </p>
                        <p>{backer?.address_line || '-'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 右カラム: サマリー */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-8">
                <h3 className="text-lg font-bold text-blue-600 mb-4">
                  支援内容
                </h3>

                {/* リターン一覧 */}
                <div className="space-y-3 mb-4">
                  {selectedRewards.map((reward) => (
                    <div
                      key={`${reward.reward_id}-${Math.random()}`}
                      className="flex justify-between items-start text-sm border-b border-gray-200 pb-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {reward.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          ¥{reward.unit_price.toLocaleString()} × {reward.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ¥{(reward.unit_price * reward.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                {/* 合計金額 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      合計金額
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{checkoutSummary.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 配送情報 */}
                {hasShippingRequirement && (
                  <div className="bg-green-50 rounded-lg p-4 mb-6 text-sm">
                    <p className="font-semibold text-green-900 mb-2">
                      📮 配送について
                    </p>
                    <p className="text-green-800">
                      配送が必要なリターンが含まれています。上記の住所にお届けいたします。
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ボタンセクション */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={goBack}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← 戻る
            </button>

            <button
              onClick={handleConfirmOrder}
              disabled={isLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>処理中...</span>
                </>
              ) : (
                <>
                  <span>🏦</span>
                  <span>注文を確定する</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
