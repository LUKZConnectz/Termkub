'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-wide">
          <span className="text-accent">FREAL</span> BOXSER
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="btn-ghost !px-3 !py-1.5">ร้านค้า</Link>
          {profile && (
            <>
              <Link href="/cart" className="btn-ghost !px-3 !py-1.5">ตะกร้า</Link>
              <Link href="/topup" className="btn-ghost !px-3 !py-1.5">เติมเงิน</Link>
              <Link href="/orders" className="btn-ghost !px-3 !py-1.5">ออเดอร์</Link>
              <Link href="/donate" className="btn-ghost !px-3 !py-1.5">โดเนท</Link>
              {profile.role === 'admin' && (
                <Link href="/admin" className="btn-ghost !px-3 !py-1.5">แอดมิน</Link>
              )}
              <Link href="/profile" className="badge border border-border bg-black/30">
                {profile.username} · ฿{profile.balance.toLocaleString()}
              </Link>
              <button onClick={handleLogout} className="btn-ghost !px-3 !py-1.5">ออกจากระบบ</button>
            </>
          )}
          {!profile && (
            <>
              <Link href="/login" className="btn-ghost !px-3 !py-1.5">เข้าสู่ระบบ</Link>
              <Link href="/register" className="btn-accent !px-4 !py-1.5">สมัครสมาชิก</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
