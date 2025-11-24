import { NextResponse } from 'next/server';
import { getDashboardFromSheet } from '@/lib/googleSheets';

/**
 * GET /api/dashboard
 * 公開用: Google Sheets から dashboard データを取得
 * 
 * レスポンス:
 * {
 *   "success": true,
 *   "data": {
 *     "targetAmount": 100000,
 *     "currentAmount": 76500,
 *     "backerCount": 45,
 *     "achievementRate": 76.5,
 *     "remainingAmount": 23500,
 *     "rewardStats": {
 *       "R001": 15,
 *       "R002": 12,
 *       "R003": 10,
 *       "R004": 5,
 *       "R005": 3
 *     }
 *   }
 * }
 */
export async function GET() {
  try {
    const dashboard = await getDashboardFromSheet();
    
    return NextResponse.json(
      {
        success: true,
        data: dashboard,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/dashboard:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
