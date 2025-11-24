'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dashboard } from '@/components/Dashboard';
import { RewardSelector } from '@/components/RewardSelector';
import { ProjectDetails } from '@/components/ProjectDetails';
import { projectInfo } from '@/lib/mockData';

interface DashboardData {
  targetAmount: number;
  currentAmount: number;
  backerCount: number;
  achievementRate: number;
  remainingAmount: number;
  rewardStats: { [key: string]: number };
}

interface RewardData {
  reward_id: string;
  title: string;
  unit_price: number;
  description: string;
  requires_shipping: boolean;
  image_url: string;
}

export default function Home() {
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

  // ローディング中
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

  // エラー表示
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">エラーが発生しました</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://i.imgur.com/Xg72KDR.png"
                alt="NEXT RAIL logo"
                className="h-11 w-auto"
                style={{ aspectRatio: '4 / 1' }}
              />
            </div>
            <nav className="hidden md:flex gap-8">
              <a href="#overview" className="text-gray-600 hover:text-gray-900 font-medium">
                プロジェクト
              </a>
              <a href="#rewards" className="text-gray-600 hover:text-gray-900 font-medium">
                リターン
              </a>
              <a href="https://forms.gle/Qt4wgB68uLjnrC2f6" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 font-medium">
                お問い合わせ
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: プロジェクト本文 */}
          <div className="lg:col-span-2 space-y-8">
            {/* ヒーロー画像 */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
              <Image
                src={projectInfo.mainImageUrl}
                alt={projectInfo.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* タイトル・タグライン */}
            <section id="overview" className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                {projectInfo.title}
              </h1>
              <p className="text-xl text-gray-600 font-semibold">
                {projectInfo.tagline}
              </p>
            </section>

            {/* ダッシュボード（モバイル表示用） */}
            <div className="lg:hidden">
              {dashboard && <Dashboard data={dashboard} />}
              {dashboard && dashboard.remainingAmount !== undefined && (
                <Link
                  href="/backing"
                  className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-all shadow-lg block text-center mt-4"
                >
                  今すぐ支援する
                </Link>
              )}
            </div>

            {/* 主な説明 */}
            <ProjectDetails />

            {/* 主催者情報 */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                👤 プロジェクト主催者
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img
                  src="https://cdn.peatix.com/event/4565825/cover-iRRhNjQPGOLTmCvVjhosZGcniKWs6kBm.png"
                  alt={projectInfo.organizerName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-200"
                />
                <div className="text-center sm:text-left">
                  <p className="text-xl font-bold text-gray-900">
                    {projectInfo.organizerName}
                  </p>
                  <p className="text-gray-700">
                    {projectInfo.organizerBio}
                  </p>
                </div>
              </div>
            </section>

            {/* FAQセクション */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                ❓ よくある質問
              </h2>
              <div className="space-y-3">
                {[
                  {
                    q: '支援するとなにがもらえるのか？',
                    a: '選択したリターンに応じて、報告書やステッカー、特産品などをお送りします。詳細は下記のリターン一覧をご確認ください。',
                  },
                  {
                    q: 'いつ配送されるのか？',
                    a: '目標金額に到達後、2～3ヶ月以内に配送予定です。配送が必要なリターンをご選択された方には、開始1週間後にメールでお知らせします。',
                  },
                  {
                    q: '複数のリターンを選ぶことはできるのか？',
                    a: 'はい、可能です。下記のリターン一覧から複数のリターンを選択して、一度にご支援いただけます。',
                  },
                  {
                    q: '支援後にキャンセルはできるのか？',
                    a: '申し訳ございませんが、支援後のキャンセルは原則お受けできません。ご不明な点がある場合は、お気軽にお問い合わせください。',
                  },
                ].map((faq, index) => (
                  <details
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                  >
                    <summary className="font-semibold text-gray-900 cursor-pointer">
                      {faq.q}
                    </summary>
                    <p className="mt-2 text-gray-700">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* 右カラム: サイドバー（デスクトップ表示用） */}
          <div className="hidden lg:block lg:col-span-1 space-y-8">
            {/* Dashboard コンポーネント */}
            {dashboard && <Dashboard data={dashboard} />}

            {/* 支援ボタン（For Good 風に） */}
            {dashboard && dashboard.remainingAmount !== undefined && (
              <Link
                href="/backing"
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-all shadow-lg block text-center"
              >
                今すぐ支援する
              </Link>
            )}

            {/* RewardSelector コンポーネント */}
            <div id="rewards">
              {rewards.length > 0 && <RewardSelector rewards={rewards} />}
            </div>
          </div>
        </div>

        {/* リターン一覧（モバイル表示用） */}
        <div className="lg:hidden mt-8" id="rewards">
          {rewards.length > 0 && <RewardSelector rewards={rewards} />}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img
                src="https://i.imgur.com/91k5WtN.png"
                alt="18きっぷ遠足ロゴ"
                className="h-11 w-auto mb-4"
                style={{ aspectRatio: '4 / 1' }}
              />
              <p className="text-sm">
                AI時代における、「人間にしかできないこと」を探求する旅プロジェクト。
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">リンク</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">ホーム</a></li>
                <li><a href="#overview" className="hover:text-white transition-colors">プロジェクト</a></li>
                <li><a href="#rewards" className="hover:text-white transition-colors">リターン</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">法人情報</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">利用規約</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">プライバシー</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">特商法</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">SNS</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://x.com/seizogakuen" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://www.facebook.com/GyavyHazard" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="https://www.instagram.com/18kipensoku/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
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