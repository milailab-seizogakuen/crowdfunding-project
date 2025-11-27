'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="https://i.imgur.com/92eVr1d.jpeg"
                                alt="NEXT RAIL"
                                className="h-14 w-auto"
                                style={{ aspectRatio: '2 / 1' }}
                            />
                        </Link>
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            トップページに戻る
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b-4 border-orange-500 pb-4">
                        特定商取引法に関する表記
                    </h1>

                    <div className="space-y-8">
                        {/* 販売価格について */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                販売価格について
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed">
                                販売価格は、表示された金額（表示価格/消費税込）と致します。
                            </p>
                        </section>

                        {/* 配送料について */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                配送料について
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed">
                                すべてプロジェクト起案者の負担となります
                            </p>
                        </section>

                        {/* 代金の支払時期と方法 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                代金(対価)の支払時期と方法
                            </h2>
                            <div className="space-y-2 text-base text-gray-700 leading-relaxed">
                                <p><strong>支払方法:</strong> JPYC決済（Polygonチェーン、ガス代は当方にて負担）、銀行振込がご利用頂けます。</p>
                                <p><strong>支払時期:</strong> 商品注文時点でお支払いが確定いたします。</p>
                            </div>
                        </section>

                        {/* 返品についての特約事項 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                返品についての特約事項
                            </h2>
                            <div className="space-y-2 text-base text-gray-700 leading-relaxed">
                                <p>商品に欠陥があった場合、交換にて対応いたします。</p>
                                <p>お客様都合による返品・交換には応じかねますので、ご了承ください。</p>
                            </div>
                        </section>

                        {/* 役務または商品の引き渡し時期 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                役務または商品の引き渡し時期
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed">
                                プロジェクト期間終了後、該当の月に発送いたします
                            </p>
                        </section>

                        {/* 事業者の名称および連絡先 */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                事業者の名称および連絡先
                            </h2>
                            <div className="bg-gray-50 p-6 rounded-lg space-y-2 text-base text-gray-700">
                                <p><strong>屋号:</strong> GroundMole</p>
                                <p><strong>氏名:</strong> 北 祐介</p>
                                <p><strong>所在地:</strong> 〒636-0822 奈良県生駒郡信貴ケ丘3-6-3</p>
                                <p><strong>電話番号:</strong> 09068368707</p>
                                <p><strong>運営統括責任者:</strong> 北 祐介</p>
                            </div>
                        </section>
                    </div>

                    {/* Back to Top Button */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/"
                            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            トップページに戻る
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-gray-400">
                        © 2024 18きっぷ遠足 - GroundMole. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
