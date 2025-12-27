'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RewardData } from '@/types/backing';
import { formatCurrency } from '@/utils/formatting';

interface RewardCardProps {
  reward: RewardData;
  backerCount?: number;
  onSelect: (reward: RewardData, quantity: number) => void;
  navigateOnSelect?: boolean;
}

/**
 * RewardCard コンポーネント
 * リターンを表示し、選択できるカード（For Good 風デザイン）
 */
export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  backerCount,
  onSelect,
  navigateOnSelect = false,
}) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const handleSelect = () => {
    onSelect(reward, quantity);
    setQuantity(1); // リセット
    if (navigateOnSelect) {
      router.push('/backing');
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 1;
    setQuantity(Math.max(1, value));
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      {/* 画像部分 */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <Image
          src={reward.image_url}
          alt={reward.title}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          priority={false}
        />
        {/* 配送情報バッジ */}
        {reward.requires_shipping && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            配送あり
          </div>
        )}
      </div>

      {/* コンテンツ部分 */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        {/* タイトル */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
          {reward.title}
        </h3>

        {/* 説明 */}
        <p className="text-sm text-gray-600 line-clamp-3 flex-1">
          {reward.description}
        </p>

        {/* 区切り線 */}
        <div className="h-px bg-gray-200"></div>

        {/* 価格 - 大きく目立つ */}
        <div className="pt-2">
          <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">
            1口の金額
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(reward.unit_price)}
          </p>
        </div>

        {/* 数量選択 - より見やすく */}
        <div className="space-y-2">
          <label htmlFor={`quantity-${reward.reward_id}`} className="text-sm font-semibold text-gray-700">
            数量を選択
          </label>
          <div className="flex items-center gap-3">
            <input
              id={`quantity-${reward.reward_id}`}
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-semibold text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
              style={{ color: '#000000' }}
            />
            <span className="text-sm text-gray-600">個</span>
          </div>
        </div>

        {/* 合計金額表示 */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-1">このセットの合計</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(reward.unit_price * quantity)}
          </p>
        </div>

        {/* 支援者数表示 */}
        {backerCount !== undefined && (
          <div className="flex justify-end">
            <span className="text-sm text-gray-600 font-medium">
              👥 {backerCount}人が支援中
            </span>
          </div>
        )}

        {/* 選択ボタン */}
        <button
          onClick={handleSelect}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          このリターンを選ぶ
        </button>
      </div>
    </div>
  );
};
