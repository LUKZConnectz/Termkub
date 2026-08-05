'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addToCart(productId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'กรุณาเข้าสู่ระบบก่อน' };

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
  } else {
    await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity: 1 });
  }

  revalidatePath('/cart');
  revalidatePath('/');
  return { success: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = createClient();
  if (quantity <= 0) {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
  } else {
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
  }
  revalidatePath('/cart');
}

export async function removeFromCart(cartItemId: string) {
  const supabase = createClient();
  await supabase.from('cart_items').delete().eq('id', cartItemId);
  revalidatePath('/cart');
}

export async function checkoutCart() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('checkout_cart');
  if (error) return { error: error.message };
  revalidatePath('/cart');
  revalidatePath('/orders');
  revalidatePath('/profile');
  return { orderId: data as string };
}
