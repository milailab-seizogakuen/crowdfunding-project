'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="https://i.imgur.com/JnSQQvm.jpeg"
                                alt="18きっぷ遠足ロゴ"
                                width={50}
                                height={50}
                                className="rounded-full"
                            />
                            <span className="text-xl font-bold text-gray-900">18きっぷ遠足</span>
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
                        利用規約
                    </h1>

                    <div className="space-y-8 text-base text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第1条（適用）
                            </h2>
                            <p>
                                本規約は、GroundMole（以下「当方」）が運営する18きっぷ遠足プロジェクト（以下「本サービス」）の利用条件を定めるものです。支援者の皆様（以下「ユーザー」）には、本規約に従って本サービスをご利用いただきます。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第2条（支援の申込み）
                            </h2>
                            <p>
                                ユーザーは、本サービスにおいて、当方の定める方法により支援の申込みを行うものとします。支援の申込みが完了した時点で、ユーザーと当方との間に契約が成立するものとします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第3条（支援金の支払い）
                            </h2>
                            <p>
                                ユーザーは、支援申込み時に選択した支払方法により、支援金を支払うものとします。支払方法は、JPYC決済（Polygonチェーン）または銀行振込となります。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第4条（返金について）
                            </h2>
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
                                <p className="font-bold text-red-900 mb-2">
                                    重要：返金に関する規定
                                </p>
                                <p className="text-red-900">
                                    当方は、プロジェクトが中止となった場合を除き、いかなる理由があっても支援金の返金には応じられません。支援前に十分ご検討の上、お申込みください。
                                </p>
                            </div>
                            <p className="mt-3">
                                プロジェクトが中止となった場合は、支援金の全額を返金いたします。返金方法については、別途ご連絡いたします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第5条（リターンの提供）
                            </h2>
                            <p>
                                当方は、プロジェクト期間終了後、各リターンに記載された時期にリターン商品を発送いたします。天候や交通事情等により、発送が遅れる場合がございますので、予めご了承ください。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第6条（禁止事項）
                            </h2>
                            <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはならないものとします：</p>
                            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                                <li>法令または公序良俗に違反する行為</li>
                                <li>犯罪行為に関連する行為</li>
                                <li>当方のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                                <li>当方のサービスの運営を妨害するおそれのある行為</li>
                                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                                <li>不正アクセスをし、またはこれを試みる行為</li>
                                <li>他のユーザーに成りすます行為</li>
                                <li>当方が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
                                <li>その他、当方が不適切と判断する行為</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第7条（本サービスの提供の停止等）
                            </h2>
                            <p>
                                当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします：
                            </p>
                            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                                <li>その他、当方が本サービスの提供が困難と判断した場合</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第8条（免責事項）
                            </h2>
                            <p>
                                当方は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第9条（利用規約の変更）
                            </h2>
                            <p>
                                当方は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の本規約は、本サービス上に表示した時点より効力を生じるものとします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                第10条（準拠法・裁判管轄）
                            </h2>
                            <p>
                                本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当方の所在地を管轄する裁判所を専属的合意管轄とします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-3">
                                お問い合わせ
                            </h2>
                            <p>
                                本規約に関するお問い合わせは、以下までご連絡ください。
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mt-3">
                                <p><strong>GroundMole</strong></p>
                                <p>運営統括責任者: 北 祐介</p>
                                <p>電話番号: 09068368707</p>
                            </div>
                        </section>

                        <p className="text-sm text-gray-500 mt-8">
                            制定日：2024年11月24日
                        </p>
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
