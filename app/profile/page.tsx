import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  return (
    <div className="mx-auto max-w-md">
      <div className="card flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-black">{profile?.username}</h1>
        <p className="text-sm text-muted">{user?.email}</p>
        <p className="mt-4 text-3xl font-black text-accent">฿{(profile?.balance || 0).toLocaleString()}</p>
        <p className="text-sm text-muted">ยอดเงินคงเหลือ</p>
      </div>
    </div>
  );
}
