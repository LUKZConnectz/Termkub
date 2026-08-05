'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createTopupRequest, submitTopupSlip } from '@/app/topup/actions';
import type { TopupRequest } from '@/lib/types';

const PRESET_AMOUNTS = [50, 100, 300, 500, 1000];

const STATUS_LABEL: Record<string, string> = {
  pending: 'รอสแกนจ่าย',
  submitted: 'รอตรวจสอบสลิป',
  approved: 'เติมเงินสำเร็จ',
  rejected: 'ถูกปฏิเสธ',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-white/10 text-muted',
  submitted: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
};

export default function TopupFlow({ history }: { history: TopupRequest[] }) {
  const [amount, setAmount] = useState<number>(100);
  const [activeRequest, setActiveRequest] = useState<TopupRequest | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await createTopupRequest(amount);
      if (result.error) {
        setError(result.error);
        return;
      }
      setActiveRequest(result.request as TopupRequest);
      setQrDataUrl(result.qrDataUrl || null);
    });
  }

  async function handleSlipUpload(file: File) {
    if (!activeRequest) return;
    setUploading(true);
    setError(null);

    const path = `${activeRequest.user_id}/${activeRequest.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('slips').upload(path, file, {
      upsert: true,
    });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from('slips').getPublicUrl(path);
    const result = await submitTopupSlip(activeRequest.id, publicUrl.publicUrl);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setActiveRequest({ ...activeRequest, status: 'submitted', slip_url: publicUrl.publicUrl });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {!activeRequest && (
        <div className="card flex flex-col gap-4">
          <label className="text-sm text-muted">เลือกจำนวนเงินที่ต้องการเติม</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`btn-ghost !px-4 !py-1.5 ${amount === preset ? '!border-accent !bg-accent !text-white' : ''}`}
              >
                ฿{preset}
              </button>
            ))}
          </div>
          <input
            className="input"
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-accent" onClick={handleGenerate} disabled={isPending}>
            {isPending ? 'กำลังสร้าง QR...' : 'สร้าง QR พร้อมเพย์'}
          </button>
        </div>
      )}

      {activeRequest && qrDataUrl && activeRequest.status === 'pending' && (
        <div className="card flex flex-col items-center gap-4 text-center">
          <p className="text-muted">สแกน QR เพื่อชำระเงินจำนวน</p>
          <p className="text-2xl font-black text-accent">฿{activeRequest.amount.toLocaleString()}</p>
          <Image src={qrDataUrl} alt="PromptPay QR" width={260} height={260} className="rounded-xl border border-border" unoptimized />
          <p className="text-xs text-muted">หลังโอนเงินแล้ว อัปโหลดสลิปเพื่อยืนยันการเติมเงิน</p>

          <label className="btn-accent cursor-pointer">
            {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดสลิปโอนเงิน'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && handleSlipUpload(e.target.files[0])}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="text-sm text-muted hover:underline" onClick={() => { setActiveRequest(null); setQrDataUrl(null); }}>
            ยกเลิกและเริ่มใหม่
          </button>
        </div>
      )}

      {activeRequest && activeRequest.status === 'submitted' && (
        <div className="card text-center">
          <p className="mb-2 text-lg font-bold">ส่งสลิปแล้ว กำลังรอแอดมินตรวจสอบ</p>
          <p className="text-sm text-muted">ยอดเงิน ฿{activeRequest.amount.toLocaleString()} จะถูกเติมเข้าบัญชีเมื่อได้รับการอนุมัติ</p>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-bold">ประวัติการเติมเงิน</h2>
        <div className="flex flex-col gap-2">
          {history.length === 0 && <p className="text-sm text-muted">ยังไม่มีประวัติ</p>}
          {history.map((req) => (
            <div key={req.id} className="card flex items-center justify-between !p-4">
              <div>
                <p className="font-semibold">฿{req.amount.toLocaleString()}</p>
                <p className="text-xs text-muted">{new Date(req.created_at).toLocaleString('th-TH')}</p>
              </div>
              <span className={`badge ${STATUS_COLOR[req.status]}`}>{STATUS_LABEL[req.status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
