import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EntryRow = {
  id: string;
  entry_date: string;
  title: string;
  location: string | null;
  used_stock: number;
  end_stock: number;
  created_at: string;
  profiles: { display_name: string } | null;
};

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function BoardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entriesData, error } = await supabase
    .from("entries")
    .select("id,entry_date,title,location,used_stock,end_stock,created_at,profiles(display_name)")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const entries = (entriesData ?? []) as unknown as EntryRow[];

  return (
    <main className="ios-subpage-shell">
      <section className="ios-subpage-card">
        <div className="ios-subpage-topbar">
          <div>
            <span className="route-chip">History</span>
            <h1 className="ios-subpage-title">등록 히스토리</h1>
          </div>
          <SignOutButton />
        </div>

        {entries.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>아직 기록이 없습니다. 신규 등록에서 첫 기록을 추가해 보세요.</p>
          </div>
        ) : (
          <div className="history-list ios-history-list">
            <div className="history-table-header">
              <span>날짜</span>
              <span>제목</span>
              <span>사용</span>
              <span>종료</span>
              <span>사용자</span>
            </div>
            {entries.map((entry) => (
              <article className="history-row-card" key={entry.id}>
                <span>{formatDateLabel(entry.entry_date)}</span>
                <strong>{entry.title}</strong>
                <span>{entry.used_stock}</span>
                <strong className="history-strong-value">{entry.end_stock}</strong>
                <span>{entry.profiles?.display_name ?? "이름 없음"}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
