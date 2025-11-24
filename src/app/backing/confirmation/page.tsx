'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBackingContext } from '@/context/BackingContext'; // ★修正: useBackingContext をインポート
import Link from 'next/link';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ★修正: useContext(BackingContext) を useBackingContext() に変更
  const { selectedRewards, clearRewards } = useBackingContext();

  const [backing_id, setBacking_id] = useState<string | null>(null);
  const [backer_id, setBacker_id] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // URLパラメータから backing_id を取得
    const backing_id_param = searchParams.get('backing_id');
    const backer_id_param = searchParams.get('backer_id');
    const amount_param = searchParams.get('amount');

    if (backing_id_param) { // backer_id はオプショナルかもしれないので、backing_idのみチェック
      setBacking_id(backing_id_param);
      if(backer_id_param) setBacker_id(backer_id_param);
      if(amount_param) setTotalAmount(parseInt(amount_param));
      setIsLoading(false);
    } else {
      // パラメータがない場合は ホームページにリダイレクト
      router.push('/');
    }
  }, [searchParams, router]);

  const handleBackToHome = () => {
    clearRewards();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 成功メッセージ */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              ✨ ご支援ありがとうございます！
            </h1>
            <p className="text-lg text-slate-600">
              支援が確定しました。確認メールをお送りしました。
            </p>
          </div>

          {/* 支援ID */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              支援ID
            </h2>
            <p className="text-2xl font-mono font-bold text-blue-600 break-all">
              {backing_id}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              このIDは重要です。メールでも送信されています。
            </p>
          </div>

          {/* リターン内容確認 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              📦 ご選択いただいたリターン
            </h2>
            <div className="space-y-3">
              {selectedRewards && selectedRewards.length > 0 ? (
                selectedRewards.map((reward) => (
                  <div
                    key={reward.reward_id}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {reward.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        数量: {reward.quantity}個
                      </p>
                    </div>
                    <p className="font-bold text-slate-900">
                      ¥{(reward.unit_price * reward.quantity).toLocaleString('ja-JP')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">リターン情報が見つかりません</p>
              )}
            </div>
          </div>

          {/* 合計金額 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900">合計金額</p>
              <p className="text-3xl font-bold text-blue-600">
                ¥{totalAmount?.toLocaleString('ja-JP') || '0'}
              </p>
            </div>
          </div>

          {/* 次のステップ */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-amber-900 mb-3">📧 次のステップ</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start">
                <span className="mr-3">✓</span>
                <span>確認メールをご確認ください</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">✓</span>
                <span>
                  メール内に配送情報がございます（配送が必要な場合）
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">✓</span>
                <span>ご不明な点はお気軽にお問い合わせください</span>
              </li>
            </ul>
          </div>

          {/* ボタン */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleBackToHome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              🏠 ホームに戻る
            </button>
            <Link
              href="/"
              className="w-full text-center bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              プロジェクト詳細を見る
            </Link>
          </div>
        </div>

        {/* サポート情報 */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-slate-600 text-sm mb-3">
            ご質問やご不明な点がございましたら
          </p>
          <a
            href="mailto:support@example.com"
            className="text-blue-600 hover:underline font-semibold"
          >
            お問い合わせ
          </a>
        </div>
      </div>
    </div>
  );
}