'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function donate(formData: FormData) {
  const amount = Number(formData.get('amount'));
  const message = String(formData.get('message') || '');

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'กรุณาเข้าสู่ระบบก่อน' };
  if (!amount || amount <= 0) return { error: 'จำนวนเงินไม่ถูกต้อง' };

  const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
  if (!profile || profile.balance < amount) return { error: 'ยอดเงินไม่พอ' };

  await supabase.from('donations').insert({ user_id: user.id, amount, message });
  await supabase.from('profiles').update({ balance: profile.balance - amount }).eq('id', user.id);

  revalidatePath('/donate');
  revalidatePath('/profile');
  return { success: true };
}
