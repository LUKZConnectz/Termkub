import { createClient } from '@/lib/supabase/server';

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">ออเดอร์ของฉัน</h1>
      {(!orders || orders.length === 0) && <p className="text-white/60">ยังไม่มีออเดอร์</p>}
      <div className="flex flex-col gap-4">
        {orders?.map((order: any) => (
          <div key={order.id} className="card">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-white/50">
                {new Date(order.created_at).toLocaleString('th-TH')}
              </span>
              <span className="badge bg-green-500/10 text-green-400">{order.status}</span>
            </div>
            <ul className="mb-2 flex flex-col gap-1 text-sm text-white/80">
              {order.order_items.map((item: any) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <span>รวม</span>
              <span className="text-accent">฿{order.total.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
