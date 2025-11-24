import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { RewardData, DashboardData, BackerData, BackingData, BackingItemData } from '@/types/backing';

/**
 * Google Sheets API クライアントを初期化
 */
function getAuthClient(): JWT {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

/**
 * Google Sheets インスタンスを取得
 */
function getSheetsClient() {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

/**
 * crowdfunding-sheet から rewards シートのデータを取得
 */
export async function getRewardsFromSheet(): Promise<RewardData[]> {
  try {
    const sheets = getSheetsClient();
    const sheetId = process.env.CROWDFUNDING_SHEET_ID;

    if (!sheetId) {
      throw new Error('CROWDFUNDING_SHEET_ID is not set');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'rewards!A:F', // reward_id, title, unit_price, description, requires_shipping, image_url
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return []; // ヘッダーのみ

    const headers = rows[0]; // A=reward_id, B=title, C=unit_price, D=description, E=requires_shipping, F=image_url
    const rewards: RewardData[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue; // reward_id が空の行をスキップ

      rewards.push({
        reward_id: String(row[0]),
        title: String(row[1] || ''),
        unit_price: Number(row[2] || 0),
        description: String(row[3] || ''),
        requires_shipping: String(row[4] || 'FALSE').toUpperCase() === 'TRUE',
        image_url: String(row[5] || ''),
      });
    }

    return rewards;
  } catch (error) {
    console.error('Error fetching rewards from sheet:', error);
    throw error;
  }
}

/**
 * crowdfunding-sheet から dashboard シートのデータを取得
 */
export async function getDashboardFromSheet(): Promise<DashboardData> {
  try {
    const sheets = getSheetsClient();
    const sheetId = process.env.CROWDFUNDING_SHEET_ID;

    if (!sheetId) {
      throw new Error('CROWDFUNDING_SHEET_ID is not set');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'dashboard!A:B', // ラベルと値
    });

    const rows = response.data.values || [];

    // 値を抽出（2列構成: A=ラベル, B=値）
    const dashboardMap: { [key: string]: number } = {};
    const rewardStats: { [key: string]: number } = {};

    for (const row of rows) {
      if (!row[0]) continue;
      const label = String(row[0]);
      const value = row[1];
      console.log(`📊 Dashboard Row: ${label} = ${value}`);

      // 基本情報の抽出
      if (label === '目標金額') {
        dashboardMap['targetAmount'] = Number(value || 0);
      } else if (label === '現在の支援金額') {
        dashboardMap['currentAmount'] = Number(value || 0);
      } else if (label === '支援者数') {
        dashboardMap['backerCount'] = Number(value || 0);
      } else if (label === '目標達成率 (%)') {
        dashboardMap['achievementRate'] = Number(value || 0);
      } else if (label === '残り金額') {
        dashboardMap['remainingAmount'] = Number(value || 0);
      }
      // リターン別統計の抽出
      else if (label.includes('支援数')) {
        const match = label.match(/^([R0-9]+)支援数$/);
        if (match) {
          const rewardId = match[1];
          rewardStats[rewardId] = Number(value || 0);
        }
      }
    }

    const targetAmount = dashboardMap['targetAmount'] || 100000;
    const currentAmount = dashboardMap['currentAmount'] || 0;
    // 達成率を計算 (小数第1位まで)
    const achievementRate = targetAmount > 0
      ? Math.round((currentAmount / targetAmount) * 100 * 10) / 10
      : 0;

    return {
      targetAmount,
      currentAmount,
      backerCount: dashboardMap['backerCount'] || 0,
      achievementRate,
      remainingAmount: dashboardMap['remainingAmount'] || 0,
      rewardStats,
    };
  } catch (error) {
    console.error('Error fetching dashboard from sheet:', error);
    throw error;
  }
}

/**
 * 次の backer_id を生成（B001, B002, ...）
 */
async function getNextBackerId(): Promise<string> {
  try {
    const sheets = getSheetsClient();
    const customerSheetId = process.env.CROWDFUNDING_CUSTOMER_SHEET_ID;

    if (!customerSheetId) {
      throw new Error('CROWDFUNDING_CUSTOMER_SHEET_ID is not set');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: customerSheetId,
      range: 'backers!A:A', // backer_id 列
    });

    const rows = response.data.values || [];
    const maxNum = rows.reduce((max, row) => {
      const match = String(row[0]).match(/^B(\d+)$/);
      if (match) {
        return Math.max(max, parseInt(match[1], 10));
      }
      return max;
    }, 0);

    const nextId = `B${String(maxNum + 1).padStart(3, '0')}`;
    console.log(`📝 Next backer_id: ${nextId}`);
    return nextId;
  } catch (error) {
    console.error('❌ Error generating next backer ID:', error);
    throw error;
  }
}

/**
 * 次の backing_id を生成（BACK001, BACK002, ...）
 */
async function getNextBackingId(): Promise<string> {
  try {
    const sheets = getSheetsClient();
    const customerSheetId = process.env.CROWDFUNDING_CUSTOMER_SHEET_ID;

    if (!customerSheetId) {
      throw new Error('CROWDFUNDING_CUSTOMER_SHEET_ID is not set');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: customerSheetId,
      range: 'backings!A:A', // backing_id 列
    });

    const rows = response.data.values || [];
    const maxNum = rows.reduce((max, row) => {
      const match = String(row[0]).match(/^BACK(\d+)$/);
      if (match) {
        return Math.max(max, parseInt(match[1], 10));
      }
      return max;
    }, 0);

    const nextId = `BACK${String(maxNum + 1).padStart(3, '0')}`;
    console.log(`📝 Next backing_id: ${nextId}`);
    return nextId;
  } catch (error) {
    console.error('❌ Error generating next backing ID:', error);
    throw error;
  }
}

/**
 * 次の backing_item_id を生成（BIT001, BIT002, ...）
 */
async function getNextBackingItemId(): Promise<string> {
  try {
    const sheets = getSheetsClient();
    const customerSheetId = process.env.CROWDFUNDING_CUSTOMER_SHEET_ID;

    if (!customerSheetId) {
      throw new Error('CROWDFUNDING_CUSTOMER_SHEET_ID is not set');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: customerSheetId,
      range: 'backing_items!A:A', // backing_item_id 列
    });

    const rows = response.data.values || [];
    const maxNum = rows.reduce((max, row) => {
      const match = String(row[0]).match(/^BIT(\d+)$/);
      if (match) {
        return Math.max(max, parseInt(match[1], 10));
      }
      return max;
    }, 0);

    return `BIT${String(maxNum + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('❌ Error generating next backing item ID:', error);
    throw error;
  }
}

/**
 * backers シートに支援者情報を追加
 */
async function addBacker(backer: BackerData): Promise<string> {
  try {
    console.log(`👤 Adding backer: ${backer.name} (${backer.email})`);

    const sheets = getSheetsClient();
    const customerSheetId = process.env.CROWDFUNDING_CUSTOMER_SHEET_ID;

    if (!customerSheetId) {
      throw new Error('CROWDFUNDING_CUSTOMER_SHEET_ID is not set');
    }

    const backer_id = await getNextBackerId();
    const now = new Date().toISOString();

    const values = [
      [
        backer_id,                              // A: backer_id
        backer.name,                            // B: name
        backer.email,                           // C: email
        backer.phone_number || '',              // D: phone_number
        backer.postal_code || '',               // E: postal_code
        backer.prefecture || '',                // F: prefecture
        backer.city || '',                      // G: city
        backer.address_line || '',              // H: address_line
        now,                                    // I: created_at
        now,                                    // J: updated_at
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: customerSheetId,
      range: 'backers!A:J',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    console.log(`✅ Added backer: ${backer_id}`);
    return backer_id;
  } catch (error) {
    console.error('❌ Error adding backer:', error);
    throw error;
  }
}

/**
 * backings シートに支援ヘッダーを追加
 * 
 * 注意: reward_ids は backing_items シートで正規化管理
 * backings は支援ヘッダー（1行＝1支援）として機能
 */
async function addBacking(
  backer_id: string,
  backing: Omit<BackingData, 'backing_id'>
): Promise<string> {
  try {
    const sheets = getSheetsClient();
    const customerSheetId = process.env.CROWDFUNDING_CUSTOMER_SHEET_ID;

    if (!customerSheetId) {
      throw new Error('CROWDFUNDING_CUSTOMER_SHEET_ID is not set');
    }

    const backing_id = await getNextBackingId();
    const backing_date = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    console.log(`💳 Adding backing: ${backing_id} for backer ${backer_id}`);
    console.log(`  - Amount: ¥${backing.total_amount}`);
    console.log(`  - Method: ${backing.payment_method}`);
    console.log(`  - Status: ${backing.payment_status} / ${backing.order_status}`);

    // backing_items で reward を管理するため、reward_ids は不要
    const values = [
      [
        backing_id,                              // A: backing_id
        backer_id,                              // B: backer_id
        backing_date,                           // C: backing_date
        backing.total_amount,                   // D: total_amount
        backing.payment_method,                 // E: payment_method
        backing.payment_status,                 // F: payment_status
        backing.order_status,                   // G: order_status
        backing.transaction_id || '',           // H: transaction_id
        backing.created_at,                     // I: created_at
        backing.notes || '',                    // J: notes
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: customerSheetId,
      range: 'backings!A:J',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    console.log(`✅ Added backing: ${backing_id}`);
    return backing_id;
  } catch (error) {
    console.error('❌ Error adding backing:', error);
    throw error;
  }
}

/**
 * backing_items シートに支援詳細を追加
 * 
 * 複数のリターンを選択した場合、複数行が追加される
 */
async function addBackingItems(
  backing_id: string,
  items: Array<{ reward_id: string; quantity: number; unit_price: number }>
): Promise<string[]> {
  try {
    const sheets = getSheetsClient();
    const customerSheetId = process.env.CROWDFUNDING_CUSTOMER_SHEET_ID;

    if (!customerSheetId) {
      throw new Error('CROWDFUNDING_CUSTOMER_SHEET_ID is not set');
    }

    const backingItemIds: string[] = [];
    const values: any[] = [];

    console.log(`📦 Adding ${items.length} backing items for backing ${backing_id}`);

    for (const item of items) {
      const backing_item_id = await getNextBackingItemId();
      const subtotal = item.quantity * item.unit_price;

      backingItemIds.push(backing_item_id);
      values.push([
        backing_item_id,                        // A: backing_item_id
        backing_id,                             // B: backing_id
        item.reward_id,                         // C: reward_id
        item.quantity,                          // D: quantity
        item.unit_price,                        // E: unit_price
        subtotal,                               // F: subtotal
        '',                                     // G: notes
      ]);

      console.log(`  - ${backing_item_id}: ${item.reward_id} x ${item.quantity} = ¥${subtotal}`);
    }

    if (values.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: customerSheetId,
        range: 'backing_items!A:G',
        valueInputOption: 'RAW',
        requestBody: { values },
      });
      console.log(`✅ Added ${backingItemIds.length} backing items`);
    }

    return backingItemIds;
  } catch (error) {
    console.error('❌ Error adding backing items:', error);
    throw error;
  }
}

/**
 * 注文作成（backer + backing + backing_items）
 * 
 * フロー:
 * 1. backers シートに支援者情報を追加 → backer_id 取得
 * 2. backings シートに支援ヘッダーを追加 → backing_id 取得
 * 3. backing_items シートに支援詳細を追加（複数行可能）
 */
export async function createOrder(
  backer: BackerData,
  backingData: Omit<BackingData, 'backing_id'>,
  items: Array<{ reward_id: string; quantity: number; unit_price: number }>
): Promise<{ backer_id: string; backing_id: string }> {
  try {
    console.log(`\n🎯 ========================================`);
    console.log(`🎯 ORDER CREATION STARTED`);
    console.log(`🎯 ========================================\n`);

    const backer_id = await addBacker(backer);
    const backing_id = await addBacking(backer_id, backingData);
    await addBackingItems(backing_id, items);

    console.log(`\n✨ ========================================`);
    console.log(`✨ ORDER CREATED SUCCESSFULLY!`);
    console.log(`✨ ========================================`);
    console.log(`✨ Backer ID: ${backer_id}`);
    console.log(`✨ Backing ID: ${backing_id}`);
    console.log(`✨ Total Amount: ¥${backingData.total_amount}`);
    console.log(`✨ Items Count: ${items.length}`);
    console.log(`✨ ========================================\n`);

    return { backer_id, backing_id };
  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ ORDER CREATION FAILED!');
    console.error('❌ ========================================');
    console.error('❌ Error:', error);
    console.error('❌ ========================================\n');
    throw error;
  }
}
