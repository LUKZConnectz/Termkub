import Link from 'next/link';
import { login } from '@/app/auth/actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string; registered?: string };
}) {
  return (
    <div className="mx-auto max-w-sm">
      <div className="card">
        <h1 className="mb-6 text-center text-2xl font-black">เข้าสู่ระบบ</h1>

        {searchParams.registered && (
          <p className="mb-4 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-400">
            สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ
          </p>
        )}
        {searchParams.error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {searchParams.error}
          </p>
        )}

        <form action={login} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={searchParams.next || '/'} />
          <label className="flex flex-col gap-1 text-sm">
            อีเมล
            <input className="input" type="email" name="email" required autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            รหัสผ่าน
            <input className="input" type="password" name="password" required autoComplete="current-password" />
          </label>
          <button type="submit" className="btn-accent mt-2">เข้าสู่ระบบ</button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          ยังไม่มีบัญชี? <Link href="/register" className="text-accent">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
