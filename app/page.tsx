import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';
import AddToCartButton from '@/components/AddToCartButton';

export default async function ShopPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: true });

  const list = (products || []) as Product[];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">ร้านค้า</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <div key={p.id} className="card flex flex-col gap-3">
            {p.featured && <span className="badge w-fit bg-accent/20 text-accent">แนะนำ</span>}
            <h2 className="text-lg font-bold">{p.name}</h2>
            <p className="text-sm text-white/60">{p.description}</p>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="text-xl font-black text-accent">฿{p.price.toLocaleString()}</span>
              <span className="text-xs text-white/50">
                {p.stock > 0 ? `เหลือ ${p.stock} ชิ้น` : 'สินค้าหมด'}
              </span>
            </div>
            <AddToCartButton productId={p.id} disabled={p.stock <= 0} />
          </div>
        ))}
        {list.length === 0 && <p className="text-white/60">ยังไม่มีสินค้าในระบบ</p>}
      </div>
    </div>
  );
}
