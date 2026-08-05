'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/app/cart/actions';

export default function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await addToCart(productId);
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage('เพิ่มลงตะกร้าแล้ว');
        router.refresh();
      }
      setTimeout(() => setMessage(null), 2500);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button className="btn-accent" onClick={handleClick} disabled={disabled || isPending}>
        {isPending ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
      </button>
      {message && <span className="text-xs text-white/60">{message}</span>}
    </div>
  );
}
