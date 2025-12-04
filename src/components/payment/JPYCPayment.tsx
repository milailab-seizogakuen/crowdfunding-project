'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { jpycService } from '@/lib/jpyc/jpycService';
import { useBackingContext } from '@/context/BackingContext';
import WalletConnectButton from '@/components/WalletConnectButton';
import { clientToSigner } from '@/lib/ethers-adapters';

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
  // 1. すべてのhooksを先に呼び出す
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { totalAmount, jpycPaymentState, setJpycPaymentState, calculateCheckoutSummary } = useBackingContext();

  // 手数料込みの金額を計算（JPYCは割引で相殺されるため実質totalAmountと同じ）
  const checkoutSummary = calculateCheckoutSummary('jpyc');

  // 2. accountを計算（hooksの直後）
  const account = address || null;

  // 3. useState hooks
  const [isSigningOrSubmitting, setIsSigningOrSubmitting] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [web3Error, setWeb3Error] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // 4. useEffect hooks（accountを使える）
  // Convert walletClient to signer
  useEffect(() => {
    if (walletClient) {
      try {
        const ethersSigner = clientToSigner(walletClient);
        setSigner(ethersSigner);
        setWeb3Error(null);
      } catch (err: any) {
        console.error('Error setting up signer:', err);
        setWeb3Error(err.message || 'ウォレットの設定に失敗しました');
      }
    } else {
      setSigner(null);
    }
  }, [walletClient]);

  // 残高取得
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !account || !signer?.provider) {
        setBalance(null);
        return;
      }

      setIsLoadingBalance(true);
      try {
        const balanceWei = await jpycService.getBalance(account, signer.provider);
        const balanceNumber = Number(balanceWei) / 1e18;
        setBalance(balanceNumber.toLocaleString('ja-JP', { maximumFractionDigits: 2 }));
      } catch (err: any) {
        console.error('残高取得エラー:', err);
        setBalance(null);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [isConnected, account, signer]);

  // 金額を整数(Wei)に変換してから文字列化（JPYC割引後の金額）
  const amountInWei = BigInt(Math.floor(checkoutSummary.total * 1e18)).toString();

  // バックエンドウォレットアドレス
  const backendWallet = process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS || '0xE36A43fA750745E8A27522b927e84EE1B50e31D5';

  /**
   * ステップ1: MetaMask で EIP-712 署名を生成
   */
  const handleGenerateSignature = async () => {
    if (!isConnected || !account || !signer) {
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
        newDeadline,
        signer  // ← signerを渡す
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

  // 署名生成済みかチェック
  const isSignatureGenerated = jpycPaymentState.signature !== null;
  const isTransactionComplete = jpycPaymentState.transactionHash !== null;

  // 未接続時の表示
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-gray-300 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🔗 JPYC決済
          </h3>
          <p className="text-gray-600 mb-6">
            ウォレットを接続して決済を開始してください
          </p>
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
        </div>
      </div>
    );
  }

  // 接続済み時の表示
  return (
    <div className="space-y-6">
      {/* 接続情報と残高 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">接続情報</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">接続ウォレット:</span>
            <span className="text-gray-900 font-mono">
              {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">JPYC残高:</span>
            {isLoadingBalance ? (
              <span className="text-gray-500">読み込み中...</span>
            ) : balance ? (
              <span className="text-gray-900 font-bold">{balance} JPYC</span>
            ) : (
              <span className="text-gray-500">取得できませんでした</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">支払額:</span>
            <span className="text-blue-600 font-bold text-lg">
              {checkoutSummary.total.toLocaleString()} JPYC
            </span>
          </div>
          {balance && parseFloat(balance.replace(/,/g, '')) < checkoutSummary.total && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p className="text-red-800 text-sm font-semibold">
                ⚠️ 残高が不足しています
              </p>
              <p className="text-red-600 text-xs mt-1">
                必要な残高: {checkoutSummary.total.toLocaleString()} JPYC
              </p>
            </div>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {(jpycPaymentState.error || web3Error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">エラー</p>
          <p className="text-red-600 text-sm">{jpycPaymentState.error || web3Error}</p>
        </div>
      )}

      {/* ステップ1: 署名生成 */}
      <div className={`border rounded-lg p-4 transition ${isSignatureGenerated ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
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
          disabled={isSigningOrSubmitting || isTransactionComplete || !!(balance && parseFloat(balance.replace(/,/g, '')) < checkoutSummary.total)}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
        >
          {isSigningOrSubmitting ? '署名中...' : '署名を生成'}
        </button>
      </div>

      {/* ステップ2: トランザクション実行 */}
      <div className={`border rounded-lg p-4 transition ${isTransactionComplete ? 'bg-green-50 border-green-300' : isSignatureGenerated ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300 opacity-50'
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
    </div>
  );
};
