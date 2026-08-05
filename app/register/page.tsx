import Link from 'next/link';
import { register } from '@/app/auth/actions';

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-sm">
      <div className="card">
        <h1 className="mb-6 text-center text-2xl font-black">สมัครสมาชิก</h1>

        {searchParams.error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {searchParams.error}
          </p>
        )}

        <form action={register} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            ชื่อผู้ใช้
            <input className="input" type="text" name="username" required minLength={3} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            อีเมล
            <input className="input" type="email" name="email" required autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            รหัสผ่าน
            <input className="input" type="password" name="password" required minLength={6} autoComplete="new-password" />
          </label>
          <button type="submit" className="btn-accent mt-2">สมัครสมาชิก</button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-accent">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
