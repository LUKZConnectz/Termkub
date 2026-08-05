'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function approveTopup(requestId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('approve_topup', { request_id: requestId });
  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function rejectTopup(requestId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('reject_topup', { request_id: requestId });
  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function upsertProduct(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') || '');
  const payload = {
    name: String(formData.get('name') || ''),
    description: String(formData.get('description') || ''),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    low_stock: Number(formData.get('low_stock') || 3),
    featured: formData.get('featured') === 'on',
  };

  if (id) {
    await supabase.from('products').update(payload).eq('id', id);
  } else {
    await supabase.from('products').insert(payload);
  }
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  await supabase.from('products').delete().eq('id', id);
  revalidatePath('/admin');
  revalidatePath('/');
}
