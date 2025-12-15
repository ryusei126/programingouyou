import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';

// ログアウト
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const accessToken = authHeader.substring(7);
  const { json, status } = await SupabaseAuthService.logout(accessToken);
  
  // 成功時は空レスポンスまたはメッセージを返す
  if (status >= 200 && status < 300) {
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  }
  
  return NextResponse.json(json, { status });
}