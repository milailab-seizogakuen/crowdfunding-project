'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useBackingContext } from '@/context/BackingContext';
import Link from 'next/link';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

    if (backing_id_param) {
      setBacking_id(backing_id_param);
      if (backer_id_param) setBacker_id(backer_id_param);
      if (amount_param) setTotalAmount(parseInt(amount_param));
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

          {/* SNSシェアボタン */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              シェアする
            </h2>
            <div className="flex flex-wrap gap-3">
              {/* Twitter/X シェアボタン */}
              <button
                onClick={() => {
                  const shareText = encodeURIComponent('NEXTRAILで『「旅教育」で子供たちに冒険を！ほぼ子どもたちだけで行く18きっぷ遠足を続けたい』に支援しました！🚄');
                  const shareUrl = encodeURIComponent('https://nextrail.uzuraya-kitakita.work/');
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
                  window.open(twitterUrl, '_blank', 'width=550,height=420');
                }}
                className="flex-1 min-w-[120px] bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="hidden sm:inline">Twitter</span>
                <span className="sm:hidden">X</span>
              </button>

              {/* Facebook シェアボタン */}
              <button
                onClick={() => {
                  const shareUrl = encodeURIComponent('https://nextrail.uzuraya-kitakita.work/');
                  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
                  window.open(facebookUrl, '_blank', 'width=550,height=420');
                }}
                className="flex-1 min-w-[120px] bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>

              {/* LINE シェアボタン */}
              <button
                onClick={() => {
                  const shareText = encodeURIComponent('NEXTRAILで『「旅教育」で子供たちに冒険を！ほぼ子どもたちだけで行く18きっぷ遠足を続けたい』に支援しました！🚄');
                  const shareUrl = encodeURIComponent('https://nextrail.uzuraya-kitakita.work/');
                  const lineUrl = `https://social-plugins.line.me/web/share?url=${shareUrl}&text=${shareText}`;
                  window.open(lineUrl, '_blank', 'width=550,height=420');
                }}
                className="flex-1 min-w-[120px] bg-[#06C755] hover:bg-[#05b048] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.766.062 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <span>LINE</span>
              </button>
            </div>
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

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-slate-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}