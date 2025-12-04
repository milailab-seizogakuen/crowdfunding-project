'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="https://i.imgur.com/92eVr1d.jpeg"
                                alt="NEXT RAIL"
                                width={112}
                                height={56}
                                className="h-14 w-auto"
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
                        プライバシーポリシー
                    </h1>

                    <div className="space-y-8 text-base text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                個人情報の取り扱いについて
                            </h2>
                            <p>
                                GroundMole（以下「当方」）は、18きっぷ遠足プロジェクトにおいて、支援者様の個人情報を以下の方針に基づき適切に取り扱います。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                収集する個人情報
                            </h2>
                            <p>当方は、以下の個人情報を収集する場合があります：</p>
                            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                                <li>氏名</li>
                                <li>住所</li>
                                <li>電話番号</li>
                                <li>メールアドレス</li>
                                <li>支援内容に関する情報</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                個人情報の利用目的
                            </h2>
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-4">
                                <p className="font-bold text-orange-900">
                                    重要：支援者様の個人情報は、リターン商品の発送のみに使用いたします。
                                </p>
                            </div>
                            <p>具体的には、以下の目的で利用いたします：</p>
                            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                                <li>リターン商品の発送</li>
                                <li>発送に関する連絡</li>
                                <li>商品に関するお問い合わせへの対応</li>
                            </ul>
                            <p className="mt-3">
                                上記以外の目的で個人情報を使用することは一切ございません。また、第三者への提供や営業目的での利用も行いません。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                個人情報の管理
                            </h2>
                            <p>
                                当方は、支援者様の個人情報を厳重に管理し、漏洩、紛失、改ざん等が発生しないよう、適切な安全管理措置を講じます。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                個人情報の第三者提供
                            </h2>
                            <p>
                                当方は、法令に基づく場合を除き、支援者様の個人情報を第三者に提供することはありません。ただし、配送業者への発送に必要な情報の提供は除きます。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                個人情報の開示・訂正・削除
                            </h2>
                            <p>
                                支援者様ご本人から個人情報の開示、訂正、削除等のご請求があった場合は、合理的な期間内に対応いたします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                お問い合わせ
                            </h2>
                            <p>
                                個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mt-3">
                                <p><strong>GroundMole</strong></p>
                                <p>運営統括責任者: 北 祐介</p>
                                <p>電話番号: 09068368707</p>
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
