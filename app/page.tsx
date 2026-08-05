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
  const totalStock = list.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div>
      {/* Hero */}
      <section className="rounded-[7px] border border-border bg-gradient-to-br from-soft to-white p-10 text-center">
        <span className="badge bg-accent/10 text-accent">โปรโมชั่นแนะนำ</span>
        <h1 className="mt-2 text-3xl font-black">Freal Boxser Shop</h1>
        <p className="mt-1 text-muted">สินค้าคุณภาพ พร้อมระบบเติมเงินผ่าน QR พร้อมเพย์</p>
      </section>

      {/* Stats */}
      <section className="my-5 grid grid-cols-2 gap-5 md:grid-cols-4">
        {[
          { label: 'สินค้าทั้งหมด', value: list.length },
          { label: 'สินค้าคงเหลือรวม', value: totalStock },
          { label: 'สินค้าแนะนำ', value: list.filter((p) => p.featured).length },
          { label: 'สินค้าใกล้หมด', value: list.filter((p) => p.stock <= p.low_stock).length },
        ].map((stat) => (
          <article key={stat.label} className="relative min-h-[77px] overflow-hidden rounded-[7px] border border-border bg-white p-4">
            <span className="block text-sm text-[#1f2024]">{stat.label}</span>
            <strong className="relative z-10 mt-0.5 block text-2xl font-black tracking-tight">{stat.value}</strong>
          </article>
        ))}
      </section>

      {/* Product grid */}
      <section className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((p, i) => (
          <article key={p.id} className="relative overflow-hidden rounded-md border border-[#dedfe4] bg-white shadow-sm">
            {p.featured && <span className="badge red absolute left-0 top-0 z-10 !rounded-none !rounded-br bg-accent text-white">สินค้ายอดนิยม</span>}
            <div className={`product-image ${p.featured ? 'is-featured' : ''}`} />
            <div className="px-3 py-2.5">
              <h2 className="truncate text-[17px] font-black leading-tight">{p.name}</h2>
              <p className="truncate text-xs text-[#22242a]">{p.description}</p>
              <strong className={`text-lg font-black ${p.featured ? 'text-[#b3293b]' : 'text-[#3f4046]'}`}>
                ฿ {p.price.toLocaleString()}
              </strong>
              <p className="mt-1 text-xs text-muted">
                {p.stock > 0 ? `เหลือ ${p.stock} ชิ้น` : 'สินค้าหมด'}
              </p>
              <div className="mt-2">
                <AddToCartButton productId={p.id} disabled={p.stock <= 0} />
              </div>
            </div>
          </article>
        ))}
        {list.length === 0 && <p className="col-span-full text-muted">ยังไม่มีสินค้าในระบบ</p>}
      </section>
    </div>
  );
}
