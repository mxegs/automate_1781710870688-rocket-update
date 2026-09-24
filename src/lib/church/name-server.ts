import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function churchDisplayName(churchId?: string | null): Promise<string> {
  const id = churchId?.trim();
  if (!id) return 'your church';
  const db = getSupabaseAdmin();
  if (!db) return 'your church';
  const { data } = await db.from('churches').select('name').eq('id', id).maybeSingle();
  return data?.name?.trim() || 'your church';
}
