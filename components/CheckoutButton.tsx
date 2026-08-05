'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { checkoutCart } from '@/app/cart/actions';

export default function CheckoutButton({ insufficientFunds }: { insufficientFunds: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleCheckout() {
    startTransition(async () => {
      const result = await checkoutCart();
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/orders');
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {insufficientFunds && (
        <p className="text-sm text-amber-700">ยอดเงินไม่พอ กรุณาเติมเงินก่อนชำระเงิน</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-accent" disabled={isPending || insufficientFunds} onClick={handleCheckout}>
        {isPending ? 'กำลังชำระเงิน...' : 'ชำระเงิน'}
      </button>
    </div>
  );
}
