import { NextResponse } from 'next/server';
import { HealthDataStore } from '@/lib/store/health-data';

export async function POST(): Promise<NextResponse> {
  try {
    // Force reload all data from /data folder
    HealthDataStore.loadAllData();

    return NextResponse.json({ success: true, message: 'Data synced successfully' });
  } catch (error) {
    console.error('[HealthAI] Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}
