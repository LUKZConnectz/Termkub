'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upsertProduct, deleteProduct } from '@/app/admin/actions';
import type { Product } from '@/lib/types';

export default function ProductAdminForm({ products }: { products: Product[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await upsertProduct(formData);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteProduct(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={handleSubmit} className="card grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className="input sm:col-span-2" name="name" placeholder="ชื่อสินค้า" required />
        <input className="input sm:col-span-2" name="description" placeholder="รายละเอียด" />
        <input className="input" name="price" type="number" step="0.01" placeholder="ราคา" required />
        <input className="input" name="stock" type="number" placeholder="สต็อก" required />
        <input className="input" name="low_stock" type="number" placeholder="แจ้งเตือนสต็อกต่ำ" defaultValue={3} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" /> สินค้าแนะนำ
        </label>
        <button className="btn-accent sm:col-span-2" type="submit" disabled={isPending}>
          เพิ่มสินค้าใหม่
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {products.map((p) => (
          <div key={p.id} className="card flex items-center justify-between !p-4">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-white/50">฿{p.price.toLocaleString()} · สต็อก {p.stock}</p>
            </div>
            <button className="text-sm text-red-400 hover:underline" disabled={isPending} onClick={() => handleDelete(p.id)}>
              ลบ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
