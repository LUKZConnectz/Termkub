# Freal Boxser — Next.js + Supabase

เว็บถูกย้ายจาก static HTML/localStorage ไปเป็น Next.js (App Router) ต่อกับ Supabase จริง
ระบบเติมเงินเปลี่ยนจากลิงก์อั่งเปาเป็น **QR พร้อมเพย์ (PromptPay)** — ผู้ใช้สแกนจ่าย อัปโหลดสลิป แอดมินกดอนุมัติ ระบบเติมเงินเข้าบัญชีอัตโนมัติ

## 1) สร้างโปรเจกต์ Supabase

1. ไปที่ https://supabase.com → New Project (เลือก region สิงคโปร์เพื่อ latency ต่ำสุดสำหรับไทย)
2. รอจน project สร้างเสร็จ (~2 นาที)
3. ไปที่ **Project Settings → API** แล้วคัดลอก 3 ค่านี้:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (เก็บเป็นความลับ ห้ามใส่ในโค้ด client)

## 2) รัน SQL schema

1. ไปที่ **SQL Editor** ใน Supabase Studio
2. คัดลอกทั้งไฟล์ `supabase/schema.sql` ในโปรเจกต์นี้ไปวางแล้ว Run
3. คำสั่งนี้จะสร้าง: ตาราง `profiles/products/cart_items/orders/order_items/donations/topup_requests`, ฟังก์ชัน RPC (`checkout_cart`, `approve_topup`, `reject_topup`), RLS policies ทั้งหมด, storage bucket ชื่อ `slips` สำหรับเก็บรูปสลิป, และสินค้าตัวอย่าง 10 ชิ้น

## 3) ตั้งค่า Auth

1. ไปที่ **Authentication → Providers** เปิด Email ให้ทำงาน (เปิดอยู่โดย default)
2. ถ้าไม่อยากให้ผู้ใช้ต้องยืนยันอีเมลก่อน login (เหมือนระบบเดิมที่ไม่มีการยืนยัน) ไปที่ **Authentication → Settings** ปิด "Confirm email"

## 4) ตั้งเป็นแอดมิน

หลังสมัครสมาชิกบัญชีแรกผ่านหน้าเว็บแล้ว รันคำสั่งนี้ใน SQL Editor เพื่อยกระดับเป็นแอดมิน:

```sql
update public.profiles set role = 'admin' where username = 'ชื่อผู้ใช้ของคุณ';
```

## 5) ตั้งค่าเลขพร้อมเพย์ที่จะรับเงิน

ในไฟล์ `.env.local` ใส่เบอร์โทรหรือเลขบัตรประชาชน 13 หลักของบัญชีที่จะรับเงินเข้า `PROMPTPAY_ID` — ระบบจะสร้าง QR ตามยอดเงินที่ผู้ใช้ระบุโดยอัตโนมัติ (ใช้ไลบรารี `promptpay-qr`)

## 6) ติดตั้งและรันโปรเจกต์

```bash
cp .env.local.example .env.local   # แล้วกรอกค่าตามข้อ 1 และ 5
npm install
npm run dev
```

เปิด http://localhost:3000

## โครงสร้างระบบเติมเงิน (QR flow)

1. ผู้ใช้เข้า `/topup` เลือก/กรอกจำนวนเงิน → กด "สร้าง QR พร้อมเพย์"
2. ระบบสร้างแถวใน `topup_requests` (status = `pending`) และ generate QR image (server-side, ไม่เก็บเลขบัญชีไว้ฝั่ง client)
3. ผู้ใช้สแกนจ่ายจริงผ่านแอปธนาคาร แล้วอัปโหลดรูปสลิป → ไฟล์ขึ้น Supabase Storage bucket `slips`, request เปลี่ยนเป็น `submitted`
4. แอดมินเข้า `/admin` เห็นรายการรอตรวจสอบพร้อมลิงก์ดูสลิป กดอนุมัติ → เรียก RPC `approve_topup` (atomic, เติมยอดเข้า `profiles.balance` และเปลี่ยน status เป็น `approved`)

> หมายเหตุ: ระบบนี้ยังเป็นการอนุมัติด้วยคน (manual) เพราะ Supabase ไม่มีทาง verify การโอนเงินจริงอัตโนมัติ ถ้าต้องการ auto-verify ต้องต่อ webhook จากธนาคาร/ผู้ให้บริการรับชำระเงิน (เช่น Omise, 2C2P, SCB Open API) เพิ่มเติม — บอกได้ถ้าต้องการให้ต่อให้

## โครงสร้างไฟล์หลัก

```
app/
  page.tsx              ร้านค้า (อ่านสินค้าจาก Supabase)
  login/ register/      Supabase Auth (email + password)
  cart/                 ตะกร้า (เก็บใน DB จริง ผูกกับ user)
  topup/                หน้าเติมเงิน QR พร้อมเพย์
  orders/                ประวัติออเดอร์
  profile/               ยอดเงินคงเหลือ
  donate/                ระบบโดเนท
  admin/                 อนุมัติเติมเงิน / จัดการสินค้า / ดูออเดอร์
lib/supabase/            client.ts (browser), server.ts (server components/actions)
lib/promptpay.ts         สร้าง QR payload + แปลงเป็นรูป
supabase/schema.sql       schema + RLS + RPC ทั้งหมด
middleware.ts             ป้องกันหน้า /cart /topup /orders /profile /admin ต้อง login (และ /admin ต้องเป็น admin)
```

## ยังไม่ได้ทำ / อาจต้องต่อเพิ่ม

- Auto-verify การโอนเงินผ่าน bank API แทนการอนุมัติมือ
- อัปโหลดรูปสินค้า (ตอนนี้มีแค่ field `image_url` เตรียมไว้)
- ระบบแจ้งเตือน (อีเมล/LINE Notify) เมื่อมีคำขอเติมเงินใหม่หรือได้รับการอนุมัติ
