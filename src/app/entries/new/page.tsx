import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { NewEntryForm } from "@/components/entries/new-entry-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewEntryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: latestEntry } = await supabase
    .from("entries")
    .select("end_stock")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="simple-page">
      <section className="route-card">
        <div className="protected-header">
          <div>
            <span className="route-chip">/entries/new</span>
            <h1>인증된 신규 기록 화면</h1>
          </div>
          <SignOutButton />
        </div>
        <p className="session-note">현재 로그인 사용자: {user.email}</p>
        <p className="auth-help">
          기록의 소유권은 항상 현재 로그인한 사용자 `auth.uid()`로 저장됩니다. 저장 후에는{" "}
          <Link className="route-link" href="/dashboard">
            /dashboard
          </Link>
          에서 전체 기록을 확인할 수 있습니다.
        </p>
        <NewEntryForm defaultStartStock={latestEntry?.end_stock ?? 0} userId={user.id} />
      </section>
    </main>
  );
}
