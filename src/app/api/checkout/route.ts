import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getRewardsFromSheet } from '@/lib/googleSheets';
import { BackerData, BackingData } from '@/types/backing';

/**
 * POST /api/checkout
 * 注文作成エンドポイント（Google Sheets に支援情報を保存）
 *
 * リクエストボディ:
 * {
 *   "backer": {
 *     "name": "田中太郎",
 *     "email": "tanaka@example.com",
 *     "phone_number": "090-1234-5678",      // 配送必須の場合のみ
 *     "postal_code": "431-3125",           // 配送必須の場合のみ
 *     "prefecture": "静岡県",              // 配送必須の場合のみ
 *     "city": "浜松市北区",                // 配送必須の場合のみ
 *     "address_line": "新都田1-2-3"       // 配送必須の場合のみ
 *   },
 *   "backing": {
 *     "total_amount": 13000,
 *     "payment_method": "paypal" | "jpyc" | "bank",
 *     "payment_status": "pending" | "completed",
 *     "order_status": "pending" | "received",
 *     "transaction_id": "paypal_tx_123",   // 決済方法によって異なる
 *     "notes": "テスト支援"
 *   },
 *   "items": [
 *     {
 *       "reward_id": "R001",
 *       "quantity": 1,
 *       "unit_price": 3000
 *     },
 *     {
 *       "reward_id": "R002",
 *       "quantity": 2,
 *       "unit_price": 5000
 *     }
 *   ]
 * }
 *
 * レスポンス (成功):
 * {
 *   "success": true,
 *   "data": {
 *     "backing_id": "BACK001",
 *     "backer_id": "B001",
 *     ...
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // --- 基本バリデーション ---
    if (!body.backer || !body.backing || !body.items) {
      return NextResponse.json({ success: false, error: 'Missing required fields: backer, backing, items' }, { status: 400 });
    }

    const { backer, backing, items } = body;

    if (!backer.name || !backer.email) {
      return NextResponse.json({ success: false, error: 'Missing required backer fields: name, email' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(backer.email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    if (!backing.total_amount || !backing.payment_method || !backing.payment_status || !backing.order_status) {
      return NextResponse.json({ success: false, error: 'Missing required backing fields: total_amount, payment_method, payment_status, order_status' }, { status: 400 });
    }
    if (!['paypal', 'jpyc', 'bank'].includes(backing.payment_method)) {
      return NextResponse.json({ success: false, error: 'Invalid payment_method. Must be one of: paypal, jpyc, bank' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'items must be a non-empty array' }, { status: 400 });
    }
    for (const item of items) {
      if (!item.reward_id || !item.quantity || !item.unit_price) {
        return NextResponse.json({ success: false, error: 'Each item must have reward_id, quantity, and unit_price' }, { status: 400 });
      }
    }

    // --- 配送先住所バリデーション ---
    const allRewards = await getRewardsFromSheet();
    const rewardsMap = new Map(allRewards.map(r => [r.reward_id, r]));

    const requiresShipping = items.some((item: { reward_id: string }) => {
      const reward = rewardsMap.get(item.reward_id);
      return reward?.requires_shipping;
    });

    if (requiresShipping) {
      const requiredFields = ['phone_number', 'postal_code', 'prefecture', 'city', 'address_line'];
      const missingFields = requiredFields.filter(field => !backer[field]);
      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Shipping address is required. Missing fields: ${missingFields.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // --- データ構築 ---
    const backerData: BackerData = {
      backer_id: '', // API で自動生成
      name: backer.name,
      email: backer.email,
      phone_number: backer.phone_number || undefined,
      postal_code: backer.postal_code || undefined,
      prefecture: backer.prefecture || undefined,
      city: backer.city || undefined,
      address_line: backer.address_line || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const backingData: Omit<BackingData, 'backing_id'> = {
      backer_id: '', // API で自動生成
      backing_date: new Date().toISOString(),
      total_amount: Number(backing.total_amount),
      payment_method: backing.payment_method,
      payment_status: backing.payment_status,
      order_status: backing.order_status,
      transaction_id: backing.transaction_id || undefined,
      created_at: new Date().toISOString(),
      notes: backing.notes || '',
    };

    // --- 注文作成 ---
    const { backer_id, backing_id } = await createOrder(backerData, backingData, items);

    // TODO: Phase 9 でメール送信機能を追加

    return NextResponse.json(
      {
        success: true,
        data: {
          backing_id,
          backer_id,
          total_amount: backing.total_amount,
          payment_method: backing.payment_method,
          message: 'Order created successfully.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error in POST /api/checkout:');
    console.error(`- Timestamp: ${new Date().toISOString()}`);
    if (error instanceof Error) {
      console.error(`- Error Type: ${error.name}`);
      console.error(`- Message: ${error.message}`);
      console.error(`- Stack: ${error.stack}`);
    } else {
      console.error('- Error object:', error);
    }

    // Google Sheets APIエラーの可能性を示唆
    const errorMessage = error instanceof Error 
      ? `Failed to create order. Please check Google Sheets API connection and permissions. Details: ${error.message}`
      : 'An unknown error occurred while creating the order.';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}