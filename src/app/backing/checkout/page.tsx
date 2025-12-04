'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBackingContext } from '@/context/BackingContext';

/**
 * /backing/checkout ページ
 * チェックアウト画面
 * - 選択リターンの確認
 * - 支援者情報入力（名前・メール・配送先※条件付き）
 * - 決済方法選択
 * - 注文確定ボタン
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { selectedRewards, totalAmount, hasShippingRequirement, backer, setBacker, paymentMethod, setPaymentMethod, calculateCheckoutSummary } = useBackingContext();

  // 手数料計算結果
  const checkoutSummary = paymentMethod
    ? calculateCheckoutSummary(paymentMethod)
    : { subtotal: totalAmount, systemFee: 0, jpycDiscount: 0, total: totalAmount };

  useEffect(() => {
    console.log(' PayPal ページ読み込み');
    console.log('  - selectedRewards:', selectedRewards);
    console.log('  - totalAmount:', totalAmount);
    console.log('  - backer:', backer);
  }, [selectedRewards, totalAmount, backer]);

  // フォームの入力状態
  const [formData, setFormData] = useState({
    name: backer.name || '',
    email: backer.email || '',
    phone_number: backer.phone_number || '',
    postal_code: backer.postal_code || '',
    prefecture: backer.prefecture || '',
    city: backer.city || '',
    address_line: backer.address_line || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // 郵便番号から住所を自動入力
  const fetchAddressFromPostalCode = async (postalCode: string) => {
    // ハイフンを除去して7桁の数字のみにする
    const cleanedCode = postalCode.replace(/-/g, '');

    // 7桁でない場合は何もしない
    if (cleanedCode.length !== 7 || !/^\d{7}$/.test(cleanedCode)) {
      return;
    }

    setIsLoadingAddress(true);
    try {
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedCode}`);
      const data = await response.json();

      if (data.status === 200 && data.results && data.results.length > 0) {
        const result = data.results[0];
        setFormData((prev) => ({
          ...prev,
          prefecture: result.address1,
          city: result.address2 + result.address3,
        }));
        // 住所取得成功時はエラーをクリア
        setErrors((prev) => ({
          ...prev,
          postal_code: '',
          prefecture: '',
          city: '',
        }));
      } else {
        // 住所が見つからない場合
        setErrors((prev) => ({
          ...prev,
          postal_code: '郵便番号が見つかりませんでした',
        }));
      }
    } catch (error) {
      console.error('住所取得エラー:', error);
      setErrors((prev) => ({
        ...prev,
        postal_code: '住所の取得に失敗しました',
      }));
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '支援者名は必須です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (hasShippingRequirement) {
      if (!formData.phone_number.trim()) {
        newErrors.phone_number = '電話番号は必須です';
      }
      if (!formData.postal_code.trim()) {
        newErrors.postal_code = '郵便番号は必須です';
      }
      if (!formData.prefecture.trim()) {
        newErrors.prefecture = '都道府県は必須です';
      }
      if (!formData.city.trim()) {
        newErrors.city = '市区町村は必須です';
      }
      if (!formData.address_line.trim()) {
        newErrors.address_line = '番地以下は必須です';
      }
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = '決済方法を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム入力ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // 郵便番号が入力された場合、住所を自動取得
    if (name === 'postal_code') {
      const cleanedCode = value.replace(/-/g, '');
      if (cleanedCode.length === 7 && /^\d{7}$/.test(cleanedCode)) {
        fetchAddressFromPostalCode(value);
      }
    }
  };

  // 送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // バッカー情報を Context に保存
      setBacker(formData);

      // 決済方法に応じて分岐
      if (paymentMethod === 'bank') {
        // 銀行振込: 確認ページへ（手動決済フロー）
        router.push('/backing/checkout/bank');
      } else if (paymentMethod === 'jpyc') {
        // JPYC決済: JPYC 決済ページへ
        router.push('/backing/checkout/jpyc');
      } else if (paymentMethod === 'paypal') {
        // PayPal決済: PayPal 決済ページへ（システム利用料込み）
        const summary = calculateCheckoutSummary(paymentMethod);
        router.push(`/backing/checkout/paypal?amount=${summary.total}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // リターンが選択されていない場合
  if (selectedRewards.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            リターンが選択されていません
          </h1>
          <p className="text-gray-600 mb-6">
            リターン選択ページからリターンを選択してください。
          </p>
          <Link
            href="/backing"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            リターン選択に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="https://i.imgur.com/92eVr1d.jpeg"
                  alt="NEXT RAIL"
                  width={112}
                  height={56}
                  className="h-14 w-auto"
                />
              </Link>
            </div>
            <Link
              href="/backing"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← リターン選択に戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ページタイトル */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💳 チェックアウト
          </h1>
          <p className="text-xl text-gray-600">
            支援情報を入力して、決済方法を選択してください。
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインフォーム */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* セクション1: 支援者情報 */}
              <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>👤</span>支援者情報
                </h2>

                <div className="space-y-6">
                  {/* 名前 */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                      支援者名 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="例: 田中太郎"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-black font-medium ${errors.name
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                        }`}
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* メール */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                      メールアドレス <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="例: tanaka@example.com"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-black font-medium ${errors.email
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                        }`}
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    <p className="text-xs text-gray-600 mt-2">確認メールと決済通知を送信します</p>
                  </div>
                </div>
              </section>

              {/* セクション2: 配送情報（条件付き） */}
              {hasShippingRequirement && (
                <section className="bg-blue-50 p-8 rounded-xl shadow-lg border border-blue-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span>📍</span>配送先住所
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    選択されたリターンに配送が必要なため、配送先住所をご入力ください
                  </p>

                  <div className="space-y-6">
                    {/* 電話番号 */}
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-900 mb-2">
                        電話番号 <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        placeholder="例: 090-1234-5678"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-black font-medium ${errors.phone_number
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-blue-500'
                          }`}
                      />
                      {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
                    </div>

                    {/* 郵便番号 */}
                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-semibold text-gray-900 mb-2">
                        郵便番号 <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="postal_code"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          placeholder="例: 431-3125"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-black font-medium ${errors.postal_code
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {isLoadingAddress && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      {errors.postal_code && <p className="text-red-600 text-sm mt-1">{errors.postal_code}</p>}
                      <p className="text-xs text-gray-500 mt-1">7桁の郵便番号を入力すると住所が自動入力されます</p>
                    </div>

                    {/* 都道府県 */}
                    <div>
                      <label htmlFor="prefecture" className="block text-sm font-semibold text-gray-900 mb-2">
                        都道府県 <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="prefecture"
                        name="prefecture"
                        value={formData.prefecture}
                        onChange={handleInputChange}
                        placeholder="例: 静岡県"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-black font-medium ${errors.prefecture
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-blue-500'
                          }`}
                      />
                      {errors.prefecture && <p className="text-red-600 text-sm mt-1">{errors.prefecture}</p>}
                    </div>

                    {/* 市区町村 */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
                        市区町村 <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="例: 浜松市北区"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition text-black font-medium ${errors.city
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-blue-500'
                          }`}
                      />
                      {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                    </div>

                    {/* 番地以下 */}
                    <div>
                      <label htmlFor="address_line" className="block text-sm font-semibold text-gray-900 mb-2">
                        番地以下 <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id="address_line"
                        name="address_line"
                        value={formData.address_line}
                        onChange={handleInputChange}
                        placeholder="例: 新都田1-2-3"
                        rows={3}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition resize-none text-black font-medium ${errors.address_line
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-blue-500'
                          }`}
                      />
                      {errors.address_line && <p className="text-red-600 text-sm mt-1">{errors.address_line}</p>}
                    </div>
                  </div>
                </section>
              )}

              {/* セクション3: 決済方法 */}
              <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>💳</span>決済方法
                </h2>

                <div className="space-y-4">
                  {/* 銀行振込 */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${paymentMethod === 'bank'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">🏦 銀行振込</p>
                      <p className="text-sm text-gray-600 mt-1">
                        決済完了後、振込先情報をメールでお送りします
                      </p>
                    </div>
                  </label>

                  {/* PayPal */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${paymentMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">💳 PayPal</p>
                      <p className="text-sm text-gray-600 mt-1">
                        クレジットカード、デビットカードでお支払いいただけます
                      </p>
                    </div>
                  </label>

                  {/* JPYC */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${paymentMethod === 'jpyc'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="jpyc"
                      checked={paymentMethod === 'jpyc'}
                      onChange={() => setPaymentMethod('jpyc')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">🔗 JPYC（暗号資産）</p>
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                          手数料無料
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        MetaMask を使用した暗号資産での決済（ガスレス）
                      </p>
                    </div>
                  </label>
                </div>

                {errors.paymentMethod && <p className="text-red-600 text-sm mt-4">{errors.paymentMethod}</p>}
              </section>

              {/* 送信ボタン */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${isSubmitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl active:scale-95'
                    }`}
                >
                  {isSubmitting ? '処理中...' : '注文を確定する'}
                </button>

                <Link
                  href="/backing"
                  className="py-4 px-6 rounded-lg font-semibold text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  戻る
                </Link>
              </div>
            </form>
          </div>

          {/* サイドバー：注文サマリー */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* 選択リターン確認 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📦</span>注文内容
                </h3>

                <div className="space-y-4 mb-4">
                  {selectedRewards.map((reward) => (
                    <div
                      key={reward.reward_id}
                      className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {reward.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          ¥{reward.unit_price.toLocaleString()} × {reward.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-blue-600 text-sm whitespace-nowrap">
                        ¥{(reward.unit_price * reward.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* お支払い内容 */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm">【お支払い内容】</h4>

                  {/* リターン合計 */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">リターン合計:</span>
                    <span className="font-semibold text-gray-900">
                      ¥{checkoutSummary.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* システム利用料 */}
                  {paymentMethod && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">システム利用料(5%):</span>
                      <span className="font-semibold text-gray-900">
                        ¥{checkoutSummary.systemFee.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* JPYC割引 */}
                  {paymentMethod === 'jpyc' && checkoutSummary.jpycDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-600 font-semibold">JPYC割引(5%):</span>
                      <span className="font-semibold text-green-600">
                        -¥{checkoutSummary.jpycDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* 区切り線 */}
                  {paymentMethod && (
                    <div className="border-t-2 border-gray-300 my-2"></div>
                  )}

                  {/* お支払い合計 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">お支払い合計</span>
                      <span className="text-3xl font-bold text-blue-600">
                        ¥{paymentMethod ? checkoutSummary.total.toLocaleString() : totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* JPYC特典メッセージ */}
                  {paymentMethod === 'jpyc' && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-700 text-center">
                        🎉 JPYC決済で手数料無料！
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 情報 */}
              <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-gray-900">ℹ️ ご注意</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ 確認メールが送信されます</li>
                  <li>✓ 銀行振込の場合、3営業日以内にお振込みください</li>
                  <li>✓ 支援後のキャンセルはできません</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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