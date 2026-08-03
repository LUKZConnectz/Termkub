'use client';

import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';

type Ticket = {
  code: string;
  amount: number;
  bank: string;
  slipName: string;
  slipUrl: string;
  note: string;
  createdAt: Date;
  status: 'pending' | 'confirmed';
};

const PRESETS = [100, 300, 500, 1000, 2000];

const BANKS = [
  { id: 'kbank', name: 'ธนาคารกสิกรไทย', account: '123-4-56789-0', holder: 'บจก. เพนเทอร์ ดิวา' },
  { id: 'scb', name: 'ธนาคารไทยพาณิชย์', account: '987-6-54321-0', holder: 'บจก. เพนเทอร์ ดิวา' },
];

function Icon({ name }: { name: 'copy' | 'check' | 'upload' | 'clock' | 'ticket' | 'image' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2 };
  const paths: Record<typeof name, ReactNode> = {
    copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>,
    check: <path d="M20 6 9 17l-5-5" />,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
    ticket: <><path d="M3 9a2 2 0 1 0 0 6v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a2 2 0 1 1 0-6V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z" /><path d="M13 6v2M13 11v2M13 16v2" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  };
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

export default function TopupPage() {
  const [amount, setAmount] = useState<number | null>(300);
  const [customAmount, setCustomAmount] = useState('');
  const [bankId, setBankId] = useState(BANKS[0].id);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [justSubmitted, setJustSubmitted] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bank = useMemo(() => BANKS.find((b) => b.id === bankId)!, [bankId]);
  const finalAmount = customAmount ? Number(customAmount) : amount ?? 0;
  const canSubmit = finalAmount > 0 && !!slipFile;

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  }

  function copyAccount() {
    navigator.clipboard?.writeText(bank.account.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function submit() {
    if (!canSubmit || !slipFile) return;
    const code = `TU-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;
    const ticket: Ticket = {
      code,
      amount: finalAmount,
      bank: bank.name,
      slipName: slipFile.name,
      slipUrl: slipPreview ?? '',
      note,
      createdAt: new Date(),
      status: 'pending',
    };
    setTickets((prev) => [ticket, ...prev]);
    setJustSubmitted(code);
    setAmount(300);
    setCustomAmount('');
    setSlipFile(null);
    setSlipPreview(null);
    setNote('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <main className="topup-page">
      <header className="topup-top">
        <a className="topup-back" href="/">← กลับหน้าแรก</a>
        <h1>เติมเงินเข้ากระเป๋า</h1>
        <p>โอนเงินแล้วแนบสลิป ทีมงานตรวจสอบและยืนยันยอดให้ด้วยมือ ปลอดภัย ไม่มีค่าธรรมเนียม</p>
      </header>

      <div className="topup-grid">
        <section className="topup-panel" aria-labelledby="amount-heading">
          <h2 id="amount-heading"><span className="step-badge">1</span>เลือกจำนวนเงิน</h2>
          <div className="amount-chips">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className={`chip ${amount === p && !customAmount ? 'chip-active' : ''}`}
                onClick={() => { setAmount(p); setCustomAmount(''); }}
              >
                ฿{p.toLocaleString()}
              </button>
            ))}
          </div>
          <label className="custom-amount">
            <span>หรือระบุจำนวนเอง</span>
            <div className="custom-amount-input">
              <span>฿</span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
          </label>

          <h2><span className="step-badge">2</span>โอนเงินไปที่บัญชี</h2>
          <div className="bank-tabs">
            {BANKS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`bank-tab ${bankId === b.id ? 'bank-tab-active' : ''}`}
                onClick={() => setBankId(b.id)}
              >
                {b.name}
              </button>
            ))}
          </div>
          <div className="bank-card">
            <div className="bank-card-row">
              <span className="bank-card-label">เลขบัญชี</span>
              <div className="bank-card-account">
                <strong>{bank.account}</strong>
                <button type="button" className="copy-btn" onClick={copyAccount} aria-label="คัดลอกเลขบัญชี">
                  <Icon name={copied ? 'check' : 'copy'} />
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </button>
              </div>
            </div>
            <div className="bank-card-row">
              <span className="bank-card-label">ชื่อบัญชี</span>
              <span>{bank.holder}</span>
            </div>
            <div className="bank-card-row">
              <span className="bank-card-label">ยอดที่ต้องโอน</span>
              <span className="bank-card-amount">฿{finalAmount ? finalAmount.toLocaleString() : '—'}</span>
            </div>
          </div>
        </section>

        <section className="topup-panel" aria-labelledby="slip-heading">
          <h2 id="slip-heading"><span className="step-badge">3</span>แนบสลิปโอนเงิน</h2>
          <label className={`dropzone ${slipPreview ? 'dropzone-filled' : ''}`}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="sr-only-input" />
            {slipPreview ? (
              <img src={slipPreview} alt="ตัวอย่างสลิปที่แนบ" />
            ) : (
              <>
                <Icon name="upload" />
                <span>แตะเพื่ออัปโหลดรูปสลิป</span>
                <em>รองรับ JPG, PNG</em>
              </>
            )}
          </label>
          {slipFile && <p className="file-name"><Icon name="image" />{slipFile.name}</p>}

          <label className="note-field">
            <span>หมายเหตุถึงแอดมิน (ถ้ามี)</span>
            <textarea
              rows={3}
              placeholder="เช่น โอนจากบัญชีชื่ออื่น, เวลาที่โอน ฯลฯ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <button type="button" className="submit-btn" disabled={!canSubmit} onClick={submit}>
            ส่งคำขอเติมเงิน ฿{finalAmount ? finalAmount.toLocaleString() : '0'}
          </button>
          <p className="review-note"><Icon name="clock" />แอดมินตรวจสอบและยืนยันยอดด้วยมือ ปกติภายใน 15–30 นาที</p>

          {justSubmitted && (
            <p className="success-note"><Icon name="check" />ส่งคำขอ {justSubmitted} แล้ว รอผลด้านล่าง</p>
          )}
        </section>
      </div>

      {tickets.length > 0 && (
        <section className="ticket-history" aria-labelledby="history-heading">
          <h2 id="history-heading"><Icon name="ticket" />ประวัติคำขอ</h2>
          <div className="ticket-list">
            {tickets.map((t) => (
              <article className="ticket" key={t.code}>
                <div className="ticket-main">
                  <div className="ticket-top">
                    <span className="ticket-code">{t.code}</span>
                    <span className={`ticket-status ${t.status === 'pending' ? 'is-pending' : 'is-confirmed'}`}>
                      {t.status === 'pending' ? 'รอแอดมินตรวจสอบ' : 'ยืนยันแล้ว'}
                    </span>
                  </div>
                  <p className="ticket-amount">฿{t.amount.toLocaleString()}</p>
                  <p className="ticket-meta">{t.bank} · {t.createdAt.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  {t.note && <p className="ticket-note">"{t.note}"</p>}
                </div>
                <div className="ticket-stub">
                  {t.slipUrl && <img src={t.slipUrl} alt="สลิปที่แนบ" />}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
