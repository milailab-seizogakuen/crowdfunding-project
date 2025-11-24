'use client';

import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { jpycService } from '@/lib/jpyc/jpycService';
import { useBackingContext } from '@/context/BackingContext';

interface JPYCPaymentProps {
  onSuccess?: (transactionHash: string) => void;
  onError?: (error: string) => void;
}

/**
 * JPYC 決済コンポーネント
 * EIP-712 署名 + ガスレス決済を実装
 */
export const JPYCPayment: React.FC<JPYCPaymentProps> = ({
  onSuccess,
  onError,
}) => {
  const { isConnected, account, connectWallet, isLoading: isWeb3Loading, error: web3Error } = useWeb3();
  const { backer, totalAmount, jpycPaymentState, setJpycPaymentState } = useBackingContext();
  
  const [isSigningOrSubmitting, setIsSigningOrSubmitting] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);

  // 金額を整数（Wei）に変換してから文字列化
  const amountInWei = BigInt(Math.floor(totalAmount * 1e18)).toString();

  // バックエンドウォレットアドレス
  const backendWallet = process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS || '0xE36A43fA750745E8A27522b927e84EE1B50e31D5';

  /**
   * ステップ1: MetaMask で EIP-712 署名を生成
   */
  const handleGenerateSignature = async () => {
    if (!isConnected || !account) {
      setJpycPaymentState({ error: 'ウォレットを接続してください' });
      return;
    }

    setIsSigningOrSubmitting(true);
    setJpycPaymentState({ error: null, isProcessing: true });

    try {
      // Deadline をここで計算・保存
      const newDeadline = Math.floor(Date.now() / 1000) + 3600;
      setDeadline(newDeadline);

      console.log('🔐 EIP-712 署名生成開始...');
      console.log('- Owner:', account);
      console.log('- Spender:', backendWallet);
      console.log('- Amount:', amountInWei);
      console.log('- Deadline:', newDeadline);

      const signature = await jpycService.generatePermitSignature(
        account,
        backendWallet,
        amountInWei,
        newDeadline  // ← 計算した deadline を使用
      );

      console.log('✅ 署名成功:', signature);
      console.log('署名詳細:');
      console.log('- v:', signature.v);
      console.log('- r:', signature.r);
      console.log('- s:', signature.s);
      console.log('- nonce:', signature.nonce);
      if (signature.signature) {
        console.log('- signature:', signature.signature.substring(0, 20) + '...');
      }

      setJpycPaymentState({
        signature,
        error: null,
        isProcessing: false,
      });
    } catch (error: any) {
      console.error('❌ 署名失敗:', error);
      const errorMessage = error.message || '署名の生成に失敗しました';
      setJpycPaymentState({
        error: errorMessage,
        isProcessing: false,
      });
      onError?.(errorMessage);
    } finally {
      setIsSigningOrSubmitting(false);
    }
  };

  /**
   * ステップ2: バックエンドに署名を送信 → Polygon でトランザクション実行
   */
  const handleExecuteTransaction = async () => {
    if (!account || !jpycPaymentState.signature) {
      setJpycPaymentState({ error: '署名が見つかりません。もう一度署名を生成してください。' });
      return;
    }

    setIsSigningOrSubmitting(true);
    setJpycPaymentState({ isProcessing: true, error: null });

    try {
      console.log('🚀 バックエンド API にリクエスト送信...');
      console.log(' API送信時の値:');
      console.log('- deadline:', deadline);  // ← state から取得した deadline を使用

      const response = await fetch('/api/jpyc/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: account,
          spender: backendWallet,
          receiver: backendWallet, // 配送不要の場合はバックエンドウォレット
          amount: amountInWei,
          deadline: deadline,  // ← 同じ deadline を使用
          nonce: jpycPaymentState.signature.nonce,
          signature: {
            v: jpycPaymentState.signature.v,
            r: jpycPaymentState.signature.r,
            s: jpycPaymentState.signature.s,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'トランザクション実行に失敗しました');
      }

      console.log('✅ トランザクション成功:', data);
      setJpycPaymentState({
        transactionHash: data.transferTxHash,
        isProcessing: false,
        error: null,
      });

      onSuccess?.(data.transferTxHash);
    } catch (error: any) {
      console.error('❌ トランザクション失敗:', error);
      const errorMessage = error.message || 'トランザクションの実行に失敗しました';
      setJpycPaymentState({
        error: errorMessage,
        isProcessing: false,
      });
      onError?.(errorMessage);
    } finally {
      setIsSigningOrSubmitting(false);
    }
  };

  // ウォレット未接続
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold mb-4">
            JPYC で決済するには MetaMask を接続してください
          </p>
          <button
            onClick={connectWallet}
            disabled={isWeb3Loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
          >
            {isWeb3Loading ? '接続中...' : 'MetaMask を接続'}
          </button>
          {web3Error && (
            <p className="mt-2 text-red-600 text-sm">{web3Error}</p>
          )}
        </div>
      </div>
    );
  }

  // 署名生成済みかチェック
  const isSignatureGenerated = jpycPaymentState.signature !== null;
  const isTransactionComplete = jpycPaymentState.transactionHash !== null;

  return (
    <div className="space-y-4">
      {/* エラー表示 */}
      {jpycPaymentState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">エラー</p>
          <p className="text-red-600 text-sm">{jpycPaymentState.error}</p>
        </div>
      )}

      {/* ステップ1: 署名生成 */}
      <div className={`border rounded-lg p-4 transition ${
        isSignatureGenerated ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">
            ステップ 1: 署名を生成
          </h3>
          {isSignatureGenerated && (
            <span className="text-green-600 font-bold">✓ 完了</span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4">
          MetaMask で EIP-712 署名を生成します。ガス代はかかりません。
        </p>
        <button
          onClick={handleGenerateSignature}
          disabled={isSigningOrSubmitting || isTransactionComplete}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
        >
          {isSigningOrSubmitting ? '署名中...' : '署名を生成'}
        </button>
      </div>

      {/* ステップ2: トランザクション実行 */}
      <div className={`border rounded-lg p-4 transition ${
        isTransactionComplete ? 'bg-green-50 border-green-300' : isSignatureGenerated ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300 opacity-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">
            ステップ 2: トランザクションを実行
          </h3>
          {isTransactionComplete && (
            <span className="text-green-600 font-bold">✓ 完了</span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4">
          署名をバックエンドに送信して、Polygon でガスレストランザクションを実行します。
          <br />
          <strong>所要時間: 約 5～7 秒</strong>
        </p>
        <button
          onClick={handleExecuteTransaction}
          disabled={!isSignatureGenerated || isSigningOrSubmitting || isTransactionComplete}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
        >
          {isSigningOrSubmitting ? '実行中...' : 'トランザクションを実行'}
        </button>
      </div>

      {/* トランザクション成功時の情報 */}
      {isTransactionComplete && jpycPaymentState.transactionHash && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <p className="text-green-800 font-semibold mb-2">✓ 決済完了</p>
          <p className="text-green-700 text-sm mb-2">
            トランザクションハッシュ:
          </p>
          <div className="bg-white border border-green-200 rounded p-2 mb-3 overflow-x-auto">
            <code className="text-xs text-gray-700 break-all">
              {jpycPaymentState.transactionHash}
            </code>
          </div>
          <a
            href={`https://polygonscan.com/tx/${jpycPaymentState.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 text-sm font-semibold"
          >
            Polygonscan で確認 →
          </a>
        </div>
      )}

      {/* 接続情報 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
        <p className="text-gray-600">
          <span className="font-semibold">接続ウォレット:</span> {account?.substring(0, 6)}...{account?.substring(-4)}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">支援金額:</span> ¥{totalAmount.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
