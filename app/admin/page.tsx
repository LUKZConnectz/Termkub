import { createClient } from '@/lib/supabase/server';
import TopupApprovalRow from '@/components/TopupApprovalRow';
import ProductAdminForm from '@/components/ProductAdminForm';

export default async function AdminPage() {
  const supabase = createClient();

  const { data: topups } = await supabase
    .from('topup_requests')
    .select('*, profiles(username)')
    .in('status', ['pending', 'submitted'])
    .order('created_at', { ascending: true });

  const { data: products } = await supabase.from('products').select('*').order('created_at');

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-3xl font-black">แผงควบคุมแอดมิน</h1>

      <section>
        <h2 className="mb-3 text-xl font-bold">คำขอเติมเงินที่รอตรวจสอบ</h2>
        <div className="flex flex-col gap-2">
          {(!topups || topups.length === 0) && <p className="text-white/50">ไม่มีคำขอค้างอยู่</p>}
          {topups?.map((req: any) => (
            <TopupApprovalRow key={req.id} request={req} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">จัดการสินค้า</h2>
        <ProductAdminForm products={products || []} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">ออเดอร์ล่าสุด</h2>
        <div className="flex flex-col gap-2">
          {recentOrders?.map((order: any) => (
            <div key={order.id} className="card flex items-center justify-between !p-4">
              <span>{order.profiles?.username}</span>
              <span className="text-sm text-white/50">{new Date(order.created_at).toLocaleString('th-TH')}</span>
              <span className="font-bold text-accent">฿{order.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
