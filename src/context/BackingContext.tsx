'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  RewardData,
  SelectedReward,
  BackerData,
  BackingContextType,
  JPYCPaymentState,
} from '@/types/backing';

/**
 * BackingContext
 * リターン選択、支援者情報、決済方法を管理する Context
 */
const BackingContext = createContext<BackingContextType | undefined>(undefined);

/**
 * BackingProvider コンポーネント
 */
export const BackingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // リターン選択状態
  const [selectedRewards, setSelectedRewards] = useState<SelectedReward[]>([]);

  // 支援者情報
  const [backer, setBacker] = useState<Partial<BackerData>>({});

  // 決済方法
  const [paymentMethod, setPaymentMethod] = useState<
    'paypal' | 'jpyc' | 'bank' | null
  >(null);

  // JPYC 決済状態
  const [jpycPaymentState, setJpycPaymentStateRaw] = useState<JPYCPaymentState>({
    signature: null,
    transactionHash: null,
    isProcessing: false,
    error: null,
  });

  /**
   * JPYC 決済状態を更新（部分更新対応）
   */
  const setJpycPaymentState = useCallback((state: Partial<JPYCPaymentState>) => {
    setJpycPaymentStateRaw((prev) => ({ ...prev, ...state }));
  }, []);

  /**
   * リターンを追加
   * 既に選択されている場合は数量を足す
   */
  const addReward = useCallback((reward: RewardData, quantity: number) => {
    setSelectedRewards((prev) => {
      const existing = prev.find((r) => r.reward_id === reward.reward_id);

      if (existing) {
        // 既存の場合は数量を加算
        return prev.map((r) =>
          r.reward_id === reward.reward_id
            ? { ...r, quantity: r.quantity + quantity }
            : r
        );
      }

      // 新規の場合は追加
      return [
        ...prev,
        {
          ...reward,
          quantity,
        },
      ];
    });
  }, []);

  /**
   * リターンを削除
   */
  const removeReward = useCallback((reward_id: string) => {
    setSelectedRewards((prev) =>
      prev.filter((r) => r.reward_id !== reward_id)
    );
  }, []);

  /**
   * リターンの数量を更新
   * 0以下の場合は削除
   */
  const updateRewardQuantity = useCallback(
    (reward_id: string, quantity: number) => {
      if (quantity <= 0) {
        removeReward(reward_id);
        return;
      }

      setSelectedRewards((prev) =>
        prev.map((r) =>
          r.reward_id === reward_id ? { ...r, quantity } : r
        )
      );
    },
    [removeReward]
  );

  /**
   * リターン選択をクリア
   */
  const clearRewards = useCallback(() => {
    setSelectedRewards([]);
  }, []);

  /**
   * 合計金額を計算
   * 各リターンの (unit_price × quantity) の合計
   */
  const totalAmount = selectedRewards.reduce(
    (sum, reward) => sum + reward.unit_price * reward.quantity,
    0
  );

  /**
   * 配送が必要かどうかを判定
   * requires_shipping = true のリターンが1つ以上存在する場合
   */
  const hasShippingRequirement = selectedRewards.some(
    (reward) => reward.requires_shipping
  );

  /**
   * カートをリセット
   */
  const resetCart = useCallback(() => {
    setSelectedRewards([]);
    setBacker({});
    setPaymentMethod(null);
    setJpycPaymentStateRaw({
      signature: null,
      transactionHash: null,
      isProcessing: false,
      error: null,
    });
  }, []);

  const value: BackingContextType = {
    // リターン選択
    selectedRewards,
    addReward,
    removeReward,
    updateRewardQuantity,
    clearRewards,

    // 支援者情報
    backer,
    setBacker,

    // 決済方法
    paymentMethod,
    setPaymentMethod,

    // JPYC 決済状態
    jpycPaymentState,
    setJpycPaymentState,

    // 計算結果
    totalAmount,
    hasShippingRequirement,

    // リセット
    resetCart,
  };

  return (
    <BackingContext.Provider value={value}>{children}</BackingContext.Provider>
  );
};

/**
 * useBackingContext フック
 * BackingContext を使用するコンポーネント内で使用
 */
export const useBackingContext = (): BackingContextType => {
  const context = useContext(BackingContext);

  if (!context) {
    throw new Error(
      'useBackingContext must be used within BackingProvider'
    );
  }

  return context;
};
