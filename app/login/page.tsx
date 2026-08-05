import Link from 'next/link';
import { login } from '@/app/auth/actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string; registered?: string };
}) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-5 py-8">
      <div className="grid w-[min(430px,100%)] justify-items-center gap-5 rounded-2xl border border-border bg-white p-9 shadow-[0_22px_60px_rgba(16,24,40,0.10)]">
        <div className="logo-mark !w-[108px] !h-[76px]">
          <span className="flex flex-col items-center">
            <span className="logo-main !text-[27px]">FREAL</span>
            <span className="logo-sub !text-[13px]">BOXSER</span>
          </span>
        </div>

        <div className="text-center">
          <p className="text-[13px] font-black text-[#b3293b]">ยินดีต้อนรับกลับ</p>
          <h1 className="mb-1.5 mt-1 text-[28px] font-black leading-tight">เข้าสู่ระบบ</h1>
          <p className="text-sm leading-relaxed text-muted">เข้าสู่ระบบเพื่อช้อปและเติมเงินในร้าน</p>
        </div>

        {searchParams.registered && (
          <p className="w-full rounded-lg bg-green-50 px-4 py-2 text-center text-sm text-green-700">
            สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ
          </p>
        )}
        {searchParams.error && (
          <p className="w-full rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-accent">
            {searchParams.error}
          </p>
        )}

        <form action={login} className="grid w-full gap-3">
          <input type="hidden" name="next" value={searchParams.next || '/'} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-extrabold">อีเมล</span>
            <input className="input" type="email" name="email" required autoComplete="email" />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-extrabold">รหัสผ่าน</span>
            <input className="input" type="password" name="password" required autoComplete="current-password" />
          </label>
          <button type="submit" className="btn-accent mt-1 h-[42px] w-full">เข้าสู่ระบบ</button>
        </form>

        <p className="text-sm text-muted">
          ยังไม่มีบัญชี? <Link href="/register" className="font-bold text-accent">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
