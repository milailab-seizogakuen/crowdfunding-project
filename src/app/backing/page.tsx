'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RewardSelector } from '@/components/RewardSelector';
import { useBackingContext } from '@/context/BackingContext';
import { RewardData, DashboardData } from '@/types/backing';

export default function BackingPage() {
  const router = useRouter();
  const { selectedRewards, totalAmount, updateRewardQuantity, removeReward } = useBackingContext();

  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // リターンデータ取得
        const rewardsRes = await fetch('/api/rewards');
        if (!rewardsRes.ok) throw new Error('Failed to fetch rewards');
        const rewardsData = await rewardsRes.json();
        setRewards(rewardsData);

        // ダッシュボードデータ取得
        const dashboardRes = await fetch('/api/dashboard');
        if (!dashboardRes.ok) throw new Error('Failed to fetch dashboard');
        const dashboardResponse = await dashboardRes.json();
        setDashboard(dashboardResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProceedToCheckout = () => {
    if (selectedRewards.length > 0) {
      router.push('/backing/checkout');
    } else {
      alert('リターンを1つ以上選択してください。');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">エラーが発生しました</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:underline"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="https://i.imgur.com/92eVr1d.jpeg"
                alt="NEXT RAIL"
                className="h-14 w-auto"
                style={{ aspectRatio: '2 / 1' }}
              />
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              ← プロジェクトに戻る
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            リターンを選択
          </h1>
          <p className="text-xl text-gray-600">
            ご支援いただきありがとうございます！ご希望のリターンを選択してください。
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32 lg:pb-0">
          <div className="lg:col-span-2">
            <RewardSelector
              rewards={rewards}
              rewardStats={dashboard?.rewardStats || {}}
            />
          </div>

          {/* Sidebar - Desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🛒</span>支援内容
                </h3>
                {selectedRewards.length > 0 ? (
                  <>
                    <div className="space-y-4 mb-4">
                      {selectedRewards.map((r) => (
                        <div key={r.reward_id} className="pb-3 border-b border-gray-200 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-2">
                              <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                                {r.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                ¥{r.unit_price.toLocaleString()} × {r.quantity}
                              </p>
                            </div>
                            <p className="font-bold text-blue-600 text-sm whitespace-nowrap">
                              ¥{(r.unit_price * r.quantity).toLocaleString()}
                            </p>
                          </div>
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateRewardQuantity(r.reward_id, r.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-bold transition"
                            >
                              −
                            </button>
                            <span className="text-sm font-semibold text-gray-700 min-w-[2rem] text-center">
                              {r.quantity}
                            </span>
                            <button
                              onClick={() => updateRewardQuantity(r.reward_id, r.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-md text-blue-700 font-bold transition"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeReward(r.reward_id)}
                              className="ml-auto text-xs text-red-600 hover:text-red-700 hover:underline"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">合計金額</span>
                        <span className="text-3xl font-bold text-blue-600">
                          ¥{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">リターンが選択されていません</p>
                  </div>
                )}

                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedRewards.length === 0}
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  レジに進む
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Popup */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
          <div className="max-w-5xl mx-auto px-4 py-4">
            {selectedRewards.length > 0 ? (
              <div className="space-y-3">
                {/* Expandable Details */}
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">選択中: {selectedRewards.length}件</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ¥{totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 group-open:hidden">詳細 ▼</span>
                        <span className="text-sm text-gray-500 hidden group-open:inline">閉じる ▲</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleProceedToCheckout();
                          }}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                          レジに進む
                        </button>
                      </div>
                    </div>
                  </summary>

                  {/* Expanded Content */}
                  <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                    {selectedRewards.map((r) => (
                      <div key={r.reward_id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-gray-900 text-sm flex-1">
                            {r.title}
                          </p>
                          <p className="font-bold text-blue-600 text-sm ml-2">
                            ¥{(r.unit_price * r.quantity).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateRewardQuantity(r.reward_id, r.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded-md text-gray-700 font-bold transition border border-gray-300"
                            >
                              −
                            </button>
                            <span className="text-sm font-semibold text-gray-700 min-w-[2rem] text-center">
                              {r.quantity}
                            </span>
                            <button
                              onClick={() => updateRewardQuantity(r.reward_id, r.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-md text-blue-700 font-bold transition border border-blue-300"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeReward(r.reward_id)}
                            className="text-xs text-red-600 hover:text-red-700 hover:underline"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-gray-500 text-sm">リターンを選択してください</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}