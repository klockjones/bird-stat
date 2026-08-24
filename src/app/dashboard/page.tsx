import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EntryRow = {
  end_stock: number;
  added_stock: number;
  used_stock: number;
  created_at: string;
};

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date());
}

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
    .select("end_stock,added_stock,used_stock,created_at")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const entries = (entriesData ?? []) as EntryRow[];
  const currentStock = entries[0]?.end_stock ?? 0;
  const totalAdded = entries.reduce((sum, entry) => sum + entry.added_stock, 0);
  const totalUsed = entries.reduce((sum, entry) => sum + entry.used_stock, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthUsed = entries
    .filter((entry) => entry.created_at.slice(0, 7) === currentMonth)
    .reduce((sum, entry) => sum + entry.used_stock, 0);
  const stockRatio = currentStock + totalUsed === 0 ? 0 : Math.min((currentStock / (currentStock + totalUsed)) * 100, 100);
  const userInitial = (user.email?.[0] ?? "U").toUpperCase();

  return (
    <main className="ios-home-shell">
      <header className="ios-home-topbar">
        <div>
          <p className="ios-home-date">Today · {formatToday()}</p>
          <h1 className="ios-home-title">셔틀콕 운영</h1>
        </div>
        <div className="ios-home-meta">
          <span className="ios-user-badge">{userInitial}</span>
          <SignOutButton />
        </div>
      </header>

      <section className="ios-home-hero-card">
        <div className="ios-hero-copy">
          <span className="ios-hero-label">Current stock</span>
          <strong className="ios-hero-value">{currentStock}</strong>
          <p>최근 등록 기준 남아 있는 셔틀콕 수량입니다.</p>
        </div>

        <div className="ios-hero-meter">
          <div className="ios-hero-meter-track">
            <div className="ios-hero-meter-fill" style={{ width: `${stockRatio}%` }} />
          </div>
          <div className="ios-hero-meter-caption">
            <span>총 사용 {totalUsed}</span>
            <span>잔량 비율 {Math.round(stockRatio)}%</span>
          </div>
        </div>
      </section>

      <section className="ios-stat-grid">
        <article className="ios-stat-card">
          <span>입고</span>
          <strong>{totalAdded}</strong>
        </article>
        <article className="ios-stat-card">
          <span>이번 달 사용</span>
          <strong>{monthUsed}</strong>
        </article>
        <article className="ios-stat-card">
          <span>기록 수</span>
          <strong>{entries.length}</strong>
        </article>
      </section>

      <section className="ios-action-section">
        <div className="ios-section-header">
          <h2>빠른 이동</h2>
          <span>앱 홈 바로가기</span>
        </div>

        <div className="ios-action-list">
          <Link className="ios-action-row" href="/entries/new">
            <span className="ios-action-row-icon add">＋</span>
            <div>
              <strong>신규 등록</strong>
              <p>수량과 사진 기록 추가</p>
            </div>
          </Link>
          <Link className="ios-action-row" href="/stats">
            <span className="ios-action-row-icon trend">↗</span>
            <div>
              <strong>사용 통계</strong>
              <p>최근 3개월 사용량 확인</p>
            </div>
          </Link>
          <Link className="ios-action-row" href="/board">
            <span className="ios-action-row-icon board">≣</span>
            <div>
              <strong>History</strong>
              <p>등록 내용 한줄 목록 보기</p>
            </div>
          </Link>
          <Link className="ios-action-row" href="/users">
            <span className="ios-action-row-icon users">◎</span>
            <div>
              <strong>사용자 정보</strong>
              <p>운영 사용자 정보 확인</p>
            </div>
          </Link>
        </div>
      </section>

      <nav className="ios-bottom-nav" aria-label="Mobile navigation">
        <Link className="ios-bottom-item active" href="/dashboard">
          <span>⌂</span>
          <small>Home</small>
        </Link>
        <Link className="ios-bottom-item" href="/board">
          <span>≣</span>
          <small>History</small>
        </Link>
        <Link className="ios-bottom-item center" href="/entries/new">
          <span>＋</span>
        </Link>
        <Link className="ios-bottom-item" href="/stats">
          <span>↗</span>
          <small>Stats</small>
        </Link>
        <Link className="ios-bottom-item" href="/users">
          <span>◎</span>
          <small>Users</small>
        </Link>
      </nav>
    </main>
  );
}
