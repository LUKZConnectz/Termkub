import { createClient } from '@/lib/supabase/server';
import CartRow from '@/components/CartRow';
import CheckoutButton from '@/components/CheckoutButton';

export default async function CartPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from('cart_items')
    .select('id, quantity, product:products(*)')
    .eq('user_id', user!.id);

  const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user!.id).single();

  const list = (items || []) as any[];
  const total = list.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">ตะกร้าสินค้า</h1>
      {list.length === 0 && <p className="text-white/60">ยังไม่มีสินค้าในตะกร้า</p>}

      <div className="flex flex-col gap-3">
        {list.map((item) => (
          <CartRow key={item.id} item={item} />
        ))}
      </div>

      {list.length > 0 && (
        <div className="card mt-6 flex flex-col gap-3">
          <div className="flex justify-between text-lg">
            <span>ยอดรวม</span>
            <span className="font-black text-accent">฿{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-white/60">
            <span>ยอดเงินคงเหลือ</span>
            <span>฿{(profile?.balance || 0).toLocaleString()}</span>
          </div>
          <CheckoutButton insufficientFunds={(profile?.balance || 0) < total} />
        </div>
      )}
    </div>
  );
}
