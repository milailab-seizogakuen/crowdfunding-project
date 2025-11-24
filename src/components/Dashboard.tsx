'use client';

import React, { useState, useEffect } from 'react';
import { DashboardData } from '@/types/backing';
import { formatCurrency } from '@/utils/formatting';
import { PROJECT_END_DATE } from '@/lib/mockData';

interface DashboardProps {
  data: DashboardData;
}

/**
 * Dashboard コンポーネント
 * クラウドファンディングの進捗を表示（For Good 風デザイン）
 */
export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const remaining = Math.ceil((PROJECT_END_DATE - now) / (1000 * 60 * 60 * 24));
      setDaysLeft(Math.max(0, remaining));
    };

    updateCountdown(); // 初回実行
    const interval = setInterval(updateCountdown, 1000 * 60); // 1分ごと更新
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
      {/* 上部：支援総額と目標金額 */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 font-bold mb-1">現在の支援総額</p>
        <div className="flex items-end gap-4 flex-wrap">
          <p className="text-5xl font-bold text-gray-900 tracking-tight">
            {formatCurrency(data.currentAmount)}
          </p>
          <div className="pb-2 text-gray-500 font-medium">
            <span className="mx-1">/</span>
            <span className="text-sm">目標</span>
            <span className="ml-1 text-lg">{formatCurrency(data.targetAmount)}</span>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mb-8 relative">
        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-orange-500 transition-all duration-500 relative flex items-center justify-end pr-3"
            style={{ width: `${Math.min(data.achievementRate, 100)}%` }}
          >
            <span className="text-white font-bold text-xl drop-shadow-sm">
              {data.achievementRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* 下部：支援者数と残り日数 */}
      <div className="flex items-center gap-12 border-b border-gray-100 pb-8 mb-6">
        {/* 支援者数 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">支援者</p>
            <p className="text-3xl font-bold text-gray-900">
              {data.backerCount}<span className="text-lg font-normal text-gray-500 ml-1">人</span>
            </p>
          </div>
        </div>

        {/* 残り日数 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">残り</p>
            <p className="text-3xl font-bold text-gray-900">
              {daysLeft}<span className="text-lg font-normal text-gray-500 ml-1">日</span>
            </p>
          </div>
        </div>
      </div>

      {/* リターン別統計（既存の機能維持） */}

    </div>
  );
};
