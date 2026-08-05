import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Freal Boxser',
  description: 'ร้านค้าและระบบเติมเงิน Freal Boxser',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  return (
    <html lang="th">
      <body>
        <Header profile={profile} />
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">{children}</main>
      </body>
    </html>
  );
}
