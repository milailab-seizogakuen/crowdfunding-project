'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider, ethers } from 'ethers';

interface Web3ContextType {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: any | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToPolygon: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const POLYGON_CHAIN_ID = 137;
  const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com';

  // MetaMask が存在するか確認
  const hasMetaMask = () => {
    if (typeof window === 'undefined') return false;
    return (window as any).ethereum !== undefined;
  };

  // ウォレット接続
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!hasMetaMask()) {
        throw new Error('MetaMask がインストールされていません。https://metamask.io/ からダウンロードしてください。');
      }

      const ethereumProvider = (window as any).ethereum;
      const newProvider = new BrowserProvider(ethereumProvider);
      const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' });

      if (accounts.length === 0) {
        throw new Error('ウォレット接続がキャンセルされました。');
      }

      const newSigner = await newProvider.getSigner();
      const chainIdResult = await newProvider.getNetwork();

      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(accounts[0]);
      setChainId(Number(chainIdResult.chainId));
      setIsConnected(true);

      // Polygon チェーンでない場合は自動切り替え
      if (Number(chainIdResult.chainId) !== POLYGON_CHAIN_ID) {
        await switchToPolygon();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'ウォレット接続に失敗しました。';
      setError(errorMessage);
      console.error('ウォレット接続エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ウォレット切断
  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setError(null);
  };

  // Polygon ネットワークに切り替え
  const switchToPolygon = async () => {
    setError(null);

    try {
      const ethereumProvider = (window as any).ethereum;

      // まず wallet_switchEthereumChain を試す
      try {
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${POLYGON_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        // チェーンが追加されていない場合は wallet_addEthereumChain を実行
        if (switchError.code === 4902) {
          await ethereumProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${POLYGON_CHAIN_ID.toString(16)}`,
                chainName: 'Polygon',
                rpcUrls: [POLYGON_RPC_URL],
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://polygonscan.com'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      // チェーン変更後、チェーン ID を更新
      const chainIdHex = await ethereumProvider.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainIdHex, 16));
    } catch (err: any) {
      const errorMessage = err.message || 'Polygon チェーンへの切り替えに失敗しました。';
      setError(errorMessage);
      console.error('Polygon 切り替えエラー:', err);
    }
  };

  // MetaMask イベントリスナーの設定
  useEffect(() => {
    if (!hasMetaMask()) return;

    const ethereumProvider = (window as any).ethereum;

    // アカウント変更時
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    // チェーン変更時
    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);

      if (newChainId !== POLYGON_CHAIN_ID && isConnected) {
        setError(`警告: 現在のチェーンは Polygon (${POLYGON_CHAIN_ID}) ではなく、チェーン ID ${newChainId} です。`);
      } else {
        setError(null);
      }
    };

    // 接続時
    const handleConnect = () => {
      setIsConnected(true);
    };

    // 切断時
    const handleDisconnect = () => {
      disconnectWallet();
    };

    ethereumProvider.on('accountsChanged', handleAccountsChanged);
    ethereumProvider.on('chainChanged', handleChainChanged);
    ethereumProvider.on('connect', handleConnect);
    ethereumProvider.on('disconnect', handleDisconnect);

    return () => {
      ethereumProvider.removeListener('accountsChanged', handleAccountsChanged);
      ethereumProvider.removeListener('chainChanged', handleChainChanged);
      ethereumProvider.removeListener('connect', handleConnect);
      ethereumProvider.removeListener('disconnect', handleDisconnect);
    };
  }, [isConnected]);

  const value: Web3ContextType = {
    isConnected,
    account,
    chainId,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    isLoading,
    error,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// useWeb3 カスタムフック
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 は Web3Provider の内部で使用してください。');
  }
  return context;
};
