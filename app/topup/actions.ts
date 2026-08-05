'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { generatePromptPayQr } from '@/lib/promptpay';

export async function createTopupRequest(amount: number) {
  if (!amount || amount <= 0) return { error: 'กรุณาระบุจำนวนเงินให้ถูกต้อง' };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'กรุณาเข้าสู่ระบบก่อน' };

  const { data: request, error } = await supabase
    .from('topup_requests')
    .insert({ user_id: user.id, amount, status: 'pending' })
    .select()
    .single();

  if (error) return { error: error.message };

  const qrDataUrl = await generatePromptPayQr(amount);

  revalidatePath('/topup');
  return { request, qrDataUrl };
}

export async function submitTopupSlip(requestId: string, slipUrl: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('topup_requests')
    .update({ slip_url: slipUrl, status: 'submitted' })
    .eq('id', requestId);

  if (error) return { error: error.message };
  revalidatePath('/topup');
  return { success: true };
}
