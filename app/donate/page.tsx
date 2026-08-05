import { createClient } from '@/lib/supabase/server';
import DonateForm from '@/components/DonateForm';

export default async function DonatePage() {
  const supabase = createClient();
  const { data: donations } = await supabase
    .from('donations')
    .select('amount, created_at, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(20);

  const total = (donations || []).reduce((sum: number, d: any) => sum + d.amount, 0);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-center text-3xl font-black">โดเนทสนับสนุนร้าน</h1>
      <p className="mb-6 text-center text-muted">ยอดโดเนทรวม ฿{total.toLocaleString()}</p>
      <DonateForm />

      <h2 className="mb-3 mt-8 text-lg font-bold">ผู้สนับสนุนล่าสุด</h2>
      <div className="flex flex-col gap-2">
        {(donations || []).map((d: any, i: number) => (
          <div key={i} className="card flex items-center justify-between !p-4">
            <span>{d.profiles?.username || 'ผู้ใจดี'}</span>
            <span className="font-bold text-accent">฿{d.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
