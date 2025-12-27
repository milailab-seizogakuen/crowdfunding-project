'use client';

import React from 'react';
import { RewardCard } from './RewardCard';
import { useBackingContext } from '@/context/BackingContext';
import { RewardData } from '@/types/backing';
import { formatCurrency } from '@/utils/formatting';

interface RewardSelectorProps {
  rewards: RewardData[];
  rewardStats?: Record<string, number>;
  navigateOnSelect?: boolean;
}

/**
 * RewardSelector コンポーネント
 * リターン一覧を表示し、複数選択可能にする（For Good 風デザイン）
 */
export const RewardSelector: React.FC<RewardSelectorProps> = ({ rewards, rewardStats, navigateOnSelect }) => {
  const { addReward, selectedRewards, removeReward } = useBackingContext();

  const handleSelectReward = (reward: RewardData, quantity: number) => {
    addReward(reward, quantity);
  };

  // 選択済みリターンの合計金額を計算
  const totalAmount = selectedRewards.reduce(
    (sum, r) => sum + r.unit_price * r.quantity,
    0
  );

  return (
    <div className="space-y-8">
      {/* 選択済みリターン表示 - For Good 風 */}
      {selectedRewards.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-md">
          <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>選択中のリターン
          </h3>

          <div className="space-y-3 mb-6">
            {selectedRewards.map((reward) => (
              <div
                key={reward.reward_id}
                className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">
                    {reward.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(reward.unit_price)} × <span className="font-bold">{reward.quantity}</span>個
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 text-lg">
                    {formatCurrency(reward.unit_price * reward.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 合計金額 */}
          <div className="bg-white border-t-2 border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-700">合計金額</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* リターン一覧 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🎁</span>リターンを選ぶ（複数選択可能）
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.reward_id}
              reward={reward}
              backerCount={rewardStats?.[reward.reward_id]}
              onSelect={handleSelectReward}
              navigateOnSelect={navigateOnSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
