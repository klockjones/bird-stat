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
    <main className="entry-mobile-shell">
      <section className="entry-mobile-topbar">
        <Link className="entry-back-link" href="/dashboard">
          ← 대시보드
        </Link>
        <SignOutButton />
      </section>

      <section className="entry-mobile-intro">
        <span className="route-chip">새 기록</span>
        <h1>새 운영 기록</h1>
        <p className="session-note">현재 로그인 사용자: {user.email}</p>
        <p className="auth-help">한 번의 입력으로 날짜, 수량, 사진 메모를 함께 저장하고 즉시 히스토리에 반영합니다.</p>
      </section>

      <NewEntryForm defaultStartStock={latestEntry?.end_stock ?? 0} userId={user.id} />
    </main>
  );
}
