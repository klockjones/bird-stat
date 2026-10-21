import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { UseEntryForm } from "@/components/entries/use-entry-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function UseEntryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 가장 최근 기록의 종료 재고를 시작 재고로 사용
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
        <span className="route-chip">사용 기록</span>
        <h1>사용 기록</h1>
        <p className="auth-help">오늘 사용한 셔틀콕 수량을 빠르게 기록합니다.</p>
      </section>

      <UseEntryForm defaultStartStock={latestEntry?.end_stock ?? 0} userId={user.id} />
    </main>
  );
}
