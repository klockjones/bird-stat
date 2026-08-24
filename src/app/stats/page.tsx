import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EntryStatRow = {
  added_stock: number;
  used_stock: number;
  end_stock: number;
  entry_date: string;
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { month: "long" }).format(date);
}

export default async function StatsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entries } = await supabase
    .from("entries")
    .select("added_stock,used_stock,end_stock,entry_date")
    .order("created_at", { ascending: false });

  const typedEntries = (entries ?? []) as EntryStatRow[];
  const totalAdded = typedEntries.reduce((sum, entry) => sum + entry.added_stock, 0);
  const totalUsed = typedEntries.reduce((sum, entry) => sum + entry.used_stock, 0);
  const latestStock = typedEntries[0]?.end_stock ?? 0;

  const now = new Date();
  const monthStarts = [2, 1, 0].map((diff) => new Date(now.getFullYear(), now.getMonth() - diff, 1));
  const monthlyStats = monthStarts.map((monthDate) => {
    const key = monthKey(monthDate);
    const monthEntries = typedEntries.filter((entry) => monthKey(new Date(entry.entry_date)) === key);
    const used = monthEntries.reduce((sum, entry) => sum + entry.used_stock, 0);
    const added = monthEntries.reduce((sum, entry) => sum + entry.added_stock, 0);

    return {
      key,
      label: monthLabel(monthDate),
      used,
      added,
      count: monthEntries.length,
    };
  });

  const maxUsed = Math.max(...monthlyStats.map((month) => month.used), 1);

  return (
    <main className="ios-subpage-shell">
      <section className="ios-subpage-card">
        <div className="ios-subpage-topbar">
          <div>
            <span className="route-chip">Stats</span>
            <h1 className="ios-subpage-title">사용 통계</h1>
          </div>
          <SignOutButton />
        </div>

        <div className="ios-stat-grid secondary-stat-grid">
          <article className="ios-stat-card">
            <span>현재 재고</span>
            <strong>{latestStock}</strong>
          </article>
          <article className="ios-stat-card">
            <span>총 입고</span>
            <strong>{totalAdded}</strong>
          </article>
          <article className="ios-stat-card">
            <span>총 사용</span>
            <strong>{totalUsed}</strong>
          </article>
        </div>

        <section className="stats-panel">
          <div className="ios-section-header">
            <div>
              <p className="eyebrow">3 Months</p>
              <h2>최근 3개월 사용량</h2>
            </div>
          </div>

          <div className="monthly-stats-list">
            {monthlyStats.map((month) => (
              <article className="monthly-stat-card" key={month.key}>
                <div className="monthly-stat-header">
                  <div>
                    <strong>{month.label}</strong>
                    <p>{month.count}개 기록</p>
                  </div>
                  <span>{month.used}개 사용</span>
                </div>

                <div className="monthly-bar-track">
                  <div className="monthly-bar-fill" style={{ width: `${(month.used / maxUsed) * 100}%` }} />
                </div>

                <div className="monthly-stat-footer">
                  <span>입고 {month.added}</span>
                  <span>사용 {month.used}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
