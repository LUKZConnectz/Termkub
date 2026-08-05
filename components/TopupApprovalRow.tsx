'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveTopup, rejectTopup } from '@/app/admin/actions';

export default function TopupApprovalRow({ request }: { request: any }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handle(action: (id: string) => Promise<any>) {
    startTransition(async () => {
      const result = await action(request.id);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="card flex flex-wrap items-center justify-between gap-4 !p-4">
      <div>
        <p className="font-semibold">{request.profiles?.username}</p>
        <p className="text-sm text-white/50">
          ฿{request.amount.toLocaleString()} · {new Date(request.created_at).toLocaleString('th-TH')}
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
      <div className="flex items-center gap-3">
        {request.slip_url ? (
          <a href={request.slip_url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
            ดูสลิป
          </a>
        ) : (
          <span className="text-sm text-white/40">ยังไม่มีสลิป</span>
        )}
        <button className="btn-accent !px-4 !py-1.5" disabled={isPending || !request.slip_url} onClick={() => handle(approveTopup)}>
          อนุมัติ
        </button>
        <button className="btn-ghost !px-4 !py-1.5" disabled={isPending} onClick={() => handle(rejectTopup)}>
          ปฏิเสธ
        </button>
      </div>
    </div>
  );
}
