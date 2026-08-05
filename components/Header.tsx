'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, ShoppingBasket, WalletCards, ReceiptText, HeartHandshake, Settings, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

export default function Header({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 h-[88px] border-b border-border bg-white">
      <div className="mx-auto flex h-full w-[min(1024px,calc(100%-40px))] flex-wrap items-center justify-between gap-3 py-2">
        <Link href="/" className="logo-mark" aria-label="Freal Boxser">
          <span className="flex flex-col items-center">
            <span className="logo-main">FREAL</span>
            <span className="logo-sub">BOXSER</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2.5 text-sm">
          <Link href="/" className="btn-ghost !gap-1.5 !px-3 !py-1.5 !shadow-none">
            <Store size={16} strokeWidth={2.6} /> ร้านค้า
          </Link>
          {profile && (
            <>
              <Link href="/cart" className="btn-ghost !gap-1.5 !px-3 !py-1.5 !shadow-none">
                <ShoppingBasket size={16} strokeWidth={2.6} /> ตะกร้า
              </Link>
              <Link href="/topup" className="btn-ghost !gap-1.5 !px-3 !py-1.5 !shadow-none">
                <WalletCards size={16} strokeWidth={2.6} /> เติมเงิน
              </Link>
              <Link href="/orders" className="btn-ghost !gap-1.5 !px-3 !py-1.5 !shadow-none">
                <ReceiptText size={16} strokeWidth={2.6} /> ออเดอร์
              </Link>
              <Link href="/donate" className="btn-ghost !gap-1.5 !px-3 !py-1.5 !border-accent !text-accent !shadow-none">
                <HeartHandshake size={16} strokeWidth={2.6} /> โดเนท
              </Link>
              {profile.role === 'admin' && (
                <Link href="/admin" className="btn-ghost !gap-1.5 !px-3 !py-1.5 !shadow-none">
                  <Settings size={16} strokeWidth={2.6} /> แอดมิน
                </Link>
              )}
              <Link href="/profile" className="btn-accent !gap-2 !py-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#9b793e]">
                  <UserRound size={13} strokeWidth={2.6} />
                </span>
                {profile.username} · ฿{profile.balance.toLocaleString()}
              </Link>
              <button onClick={handleLogout} className="btn-ghost !px-3 !py-1.5 !shadow-none">
                ออกจากระบบ
              </button>
            </>
          )}
          {!profile && (
            <>
              <Link href="/login" className="btn-ghost !px-4 !py-1.5 !shadow-none">เข้าสู่ระบบ</Link>
              <Link href="/register" className="btn-accent !px-4 !py-1.5">สมัครสมาชิก</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
