import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder, extractPayPalAmount } from '@/lib/paypal';
import { createOrder } from '@/lib/googleSheets';
import { BackerData, BackingData } from '@/types/backing';

export async function POST(request: NextRequest) {
  console.log('\n🎯 ========================================');
  console.log('🎯 POST /api/checkout/paypal-confirm');
  console.log('🎯 ========================================\n');

  try {
    const body = await request.json();
    const {
      orderId,
      name,
      email,
      phone_number,
      postal_code,
      prefecture,
      city,
      address_line,
      selectedRewards,
      totalAmount,
    } = body;

    if (!orderId || !name || !email || !selectedRewards || !totalAmount) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📋 Request payload:`);
    console.log(`  - Order ID: ${orderId}`);
    console.log(`  - Name: ${name}`);
    console.log(`  - Email: ${email}`);
    console.log(`  - Total Amount: ¥${totalAmount}`);
    console.log(`  - Rewards: ${selectedRewards.length}`);

    // ステップ1: PayPal Order をキャプチャして金額検証
    console.log('\n✅ STEP 1: Capturing PayPal order...');
    const orderData = await capturePayPalOrder(orderId);
    const paypalAmount = extractPayPalAmount(orderData);

    console.log(`  - PayPal Amount: ${paypalAmount}`);
    console.log(`  - Expected Amount: ${totalAmount}`);

    // 金額検証（改ざん防止）
    if (Math.round(paypalAmount * 100) !== Math.round(totalAmount * 100)) {
      console.error(
        `❌ Amount mismatch: PayPal=${paypalAmount}, Expected=${totalAmount}`
      );
      return NextResponse.json(
        { success: false, message: 'Payment amount mismatch' },
        { status: 400 }
      );
    }

    console.log('✅ Amount validation passed');

    // ステップ2: Google Sheets に支援情報を保存
    console.log('\n✅ STEP 2: Saving to Google Sheets...');

    const backerData: BackerData = {
      name,
      email,
      phone_number: phone_number || undefined,
      postal_code: postal_code || undefined,
      prefecture: prefecture || undefined,
      city: city || undefined,
      address_line: address_line || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const backingData: Omit<BackingData, 'backing_id'> = {
      backing_date: new Date().toISOString(),
      total_amount: totalAmount,
      payment_method: 'paypal',
      payment_status: 'completed',
      order_status: 'received',
      transaction_id: orderId,
      created_at: new Date().toISOString(),
      notes: `PayPal Payment - Order ID: ${orderId}`,
    };

    const backingItems = selectedRewards.map((reward) => ({
      reward_id: reward.reward_id,
      quantity: reward.quantity,
      unit_price: reward.unit_price,
    }));

    const { backer_id, backing_id } = await createOrder(
      backerData,
      backingData,
      backingItems
    );

    console.log('✅ Google Sheets save completed');

    console.log(`\n✨ PAYPAL CONFIRMATION SUCCESSFUL!`);
    console.log(`✨ Backer ID: ${backer_id}`);
    console.log(`✨ Backing ID: ${backing_id}\n`);

    return NextResponse.json({
      success: true,
      backing_id,
      backer_id,
      message: 'Payment confirmed and order created',
    });
  } catch (error) {
    console.error('\n❌ PAYPAL CONFIRMATION FAILED!');
    console.error('❌ Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}