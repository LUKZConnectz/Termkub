import { createClient } from '@/lib/supabase/server';
import TopupFlow from '@/components/TopupFlow';

export default async function TopupPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: history } = await supabase
    .from('topup_requests')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-center text-3xl font-black">เติมเงินผ่าน PromptPay QR</h1>
      <TopupFlow history={history || []} />
    </div>
  );
}
