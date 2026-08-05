'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCartQuantity, removeFromCart } from '@/app/cart/actions';

export default function CartRow({ item }: { item: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function changeQty(delta: number) {
    startTransition(async () => {
      await updateCartQuantity(item.id, item.quantity + delta);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeFromCart(item.id);
      router.refresh();
    });
  }

  return (
    <div className="card flex items-center justify-between gap-4">
      <div>
        <p className="font-bold">{item.product?.name}</p>
        <p className="text-sm text-muted">฿{item.product?.price?.toLocaleString()} / ชิ้น</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-ghost !px-3 !py-1" disabled={isPending} onClick={() => changeQty(-1)}>-</button>
        <span className="w-6 text-center">{item.quantity}</span>
        <button className="btn-ghost !px-3 !py-1" disabled={isPending} onClick={() => changeQty(1)}>+</button>
        <button className="text-sm text-red-600 hover:underline" disabled={isPending} onClick={remove}>ลบ</button>
      </div>
    </div>
  );
}
