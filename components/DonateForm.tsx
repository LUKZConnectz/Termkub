'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { donate } from '@/app/donate/actions';

export default function DonateForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await donate(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="card flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        จำนวนเงิน (บาท)
        <input className="input" type="number" name="amount" min={1} step="0.01" required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        ข้อความ (ไม่บังคับ)
        <input className="input" type="text" name="message" maxLength={200} />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">ขอบคุณสำหรับการสนับสนุน!</p>}
      <button className="btn-accent" type="submit" disabled={isPending}>
        {isPending ? 'กำลังส่ง...' : 'โดเนทเลย'}
      </button>
    </form>
  );
}
