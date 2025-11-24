import { NextResponse } from 'next/server';
import { getRewardsFromSheet } from '@/lib/googleSheets';

/**
 * GET /api/rewards
 * 公開用: Google Sheets から rewards データを取得
 * 
 * レスポンス:
 * [
 *   {
 *     "reward_id": "R001",
 *     "title": "デジタル報告書セット",
 *     "unit_price": 3000,
 *     "description": "PDF報告書",
 *     "requires_shipping": false,
 *     "image_url": "https://..."
 *   },
 *   ...
 * ]
 */
export async function GET() {
  try {
    const rewards = await getRewardsFromSheet();
    
    return NextResponse.json(rewards, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/rewards:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
