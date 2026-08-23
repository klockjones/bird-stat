import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EntryRow = {
  id: string;
  user_id: string;
  entry_date: string;
  title: string;
  location: string | null;
  start_stock: number;
  added_stock: number;
  used_stock: number;
  end_stock: number;
  notes: string | null;
  created_at: string;
  profiles: { display_name: string } | null;
  entry_photos: { id: string; storage_path: string }[] | null;
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entriesData, error } = await supabase
    .from("entries")
    .select(
      "id,user_id,entry_date,title,location,start_stock,added_stock,used_stock,end_stock,notes,created_at,profiles(display_name),entry_photos(id,storage_path)",
    )
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const entries = (entriesData ?? []) as unknown as EntryRow[];
  const currentStock = entries[0]?.end_stock ?? 0;
  const totalAdded = entries.reduce((sum, entry) => sum + entry.added_stock, 0);
  const totalUsed = entries.reduce((sum, entry) => sum + entry.used_stock, 0);

  return (
    <main className="dashboard-mobile-shell">
      <section className="dashboard-mobile-hero dashboard-soft-hero">
        <div className="dashboard-mobile-topbar">
          <div>
            <p className="dashboard-mobile-kicker">Today</p>
            <h1>운영 대시보드</h1>
          </div>
          <SignOutButton />
        </div>

        <div className="dashboard-mobile-balance">
          <span>현재 운영 중인 셔틀콕</span>
          <strong>{currentStock}</strong>
          <p>최근 기록 기준으로 남아 있는 수량입니다.</p>
        </div>

        <div className="dashboard-mobile-mini-stats soft-mini-stats">
          <article>
            <span>현재 재고</span>
            <strong>{currentStock}</strong>
          </article>
          <article>
            <span>입고</span>
            <strong>{totalAdded}</strong>
          </article>
          <article>
            <span>사용</span>
            <strong>{totalUsed}</strong>
          </article>
          <article>
            <span>기록</span>
            <strong>{entries.length}</strong>
          </article>
        </div>
      </section>

      <section className="dashboard-action-grid soft-action-grid">
        <Link className="dashboard-action-card" href="/entries/new">
          <span className="dashboard-action-icon">＋</span>
          <strong>신규 등록</strong>
          <small>수량과 사진 기록 추가</small>
        </Link>
        <Link className="dashboard-action-card" href="/stats">
          <span className="dashboard-action-icon">↗</span>
          <strong>사용 통계</strong>
          <small>입고와 사용 흐름 보기</small>
        </Link>
        <Link className="dashboard-action-card" href="/board">
          <span className="dashboard-action-icon">≣</span>
          <strong>History</strong>
          <small>등록 내용 한줄 목록</small>
        </Link>
        <Link className="dashboard-action-card" href="/users">
          <span className="dashboard-action-icon">◎</span>
          <strong>사용자 정보</strong>
          <small>운영 사용자 확인</small>
        </Link>
      </section>
    </main>
  );
}
