/**
 * リターンデータ
 * 公開用（crowdfunding-rewards シートから取得）
 */
export interface RewardData {
  reward_id: string;              // "R001"
  title: string;                  // "デジタル限定"
  unit_price: number;             // 3000（配送料金込み）
  description: string;            // "PDF報告書"
  requires_shipping: boolean;     // 住所入力が必要かどうか
  image_url: string;              // imgur の画像URL
}

/**
 * 選択されたリターン（フロントエンド用）
 */
export interface SelectedReward extends RewardData {
  quantity: number;               // 数量
}

/**
 * 支援者データ
 * 非公開（crowdfunding-customer!backers シートに保存）
 */
export interface BackerData {
  backer_id: string;              // "B001"
  name: string;                   // "田中太郎"
  email: string;                  // "tanaka@example.com"
  phone_number?: string;          // "090-1234-5678"（配送必須時）
  postal_code?: string;           // "431-3125"（配送必須時）
  prefecture?: string;            // "静岡県"（配送必須時）
  city?: string;                  // "浜松市北区"（配送必須時）
  address_line?: string;          // "新都田1-2-3"（配送必須時）
  created_at?: string;            // ISO 8601 timestamp
  updated_at?: string;            // ISO 8601 timestamp
}

/**
 * 支援ヘッダーデータ
 * 非公開（crowdfunding-customer!backings シートに保存）
 */
export interface BackingData {
  backing_id: string;             // "BACK001"
  backer_id: string;              // "B001"（FK: backers）
  backing_date: string;           // ISO 8601 timestamp
  total_amount: number;           // 8000
  payment_method: 'paypal' | 'jpyc' | 'bank';
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'pending' | 'received' | 'shipped' | 'completed';
  transaction_id?: string;        // "paypal_tx_123"
  created_at: string;             // ISO 8601 timestamp
  notes?: string;                 // 管理者メモ
}

/**
 * 支援詳細データ
 * 非公開（crowdfunding-customer!backing_items シートに保存）
 */
export interface BackingItemData {
  backing_item_id: string;        // "BIT001"
  backing_id: string;             // "BACK001"（FK: backings）
  reward_id: string;              // "R001"（FK: rewards）
  quantity: number;               // 1
  unit_price: number;             // 3000
  subtotal: number;               // 3000
  notes?: string;                 // メモ
}

/**
 * ダッシュボードデータ
 * 公開用（crowdfunding-rewards!dashboard シートから取得）
 */
export interface DashboardData {
  targetAmount: number;           // 100000
  currentAmount: number;          // 76500
  backerCount: number;            // 12
  achievementRate: number;        // 76.5
  remainingAmount: number;        // 23500
  rewardStats: {
    [reward_id: string]: number;  // { "R001": 5, "R002": 3, "R003": 2 }
  };
}

/**
 * チェックアウトフォームのフィールド値
 */
export interface CheckoutFormData extends BackerData {
  selectedRewards: SelectedReward[];
  paymentMethod: 'paypal' | 'jpyc' | 'bank';
}

/**
 * JPYC 署名データ（EIP-712）
 */
export interface JPYCSignature {
  v: number;
  r: string;
  s: string;
  nonce: string;
}

/**
 * JPYC 決済状態
 */
export interface JPYCPaymentState {
  signature: JPYCSignature | null;
  transactionHash: string | null;
  isProcessing: boolean;
  error: string | null;
}

/**
 * チェックアウト明細データ
 */
export interface CheckoutSummary {
  subtotal: number;          // リターン合計
  systemFee: number;         // システム利用料（5%）
  jpycDiscount: number;      // JPYC割引（5%）※JPYC選択時のみ
  total: number;             // お支払い合計
}

/**
 * BackingContext の型
 */
export interface BackingContextType {
  // リターン選択状態
  selectedRewards: SelectedReward[];
  addReward: (reward: RewardData, quantity: number) => void;
  removeReward: (reward_id: string) => void;
  updateRewardQuantity: (reward_id: string, quantity: number) => void;
  clearRewards: () => void;

  // チェックアウト情報
  backer: Partial<BackerData>;
  setBacker: (backer: Partial<BackerData>) => void;

  paymentMethod: 'paypal' | 'jpyc' | 'bank' | null;
  setPaymentMethod: (method: 'paypal' | 'jpyc' | 'bank') => void;

  // JPYC 決済状態
  jpycPaymentState: JPYCPaymentState;
  setJpycPaymentState: (state: Partial<JPYCPaymentState>) => void;

  // 計算結果
  totalAmount: number;
  hasShippingRequirement: boolean;

  // 手数料計算
  calculateCheckoutSummary: (paymentMethod: 'bank' | 'paypal' | 'jpyc') => CheckoutSummary;

  // リセット
  resetCart: () => void;
}
