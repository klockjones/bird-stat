import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EntryPhotoRow = {
  id: string;
  storage_path: string;
};

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
  entry_photos: EntryPhotoRow[] | null;
};

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(date));
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
    .select(
      "id,user_id,entry_date,title,location,start_stock,added_stock,used_stock,end_stock,notes,created_at,profiles(display_name),entry_photos(id,storage_path)",
    )
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const entries = (entriesData ?? []) as unknown as EntryRow[];
  const photoPaths = entries.flatMap((entry) => entry.entry_photos?.map((photo) => photo.storage_path) ?? []);
  const uniquePhotoPaths = [...new Set(photoPaths)];
  const signedUrlMap = new Map<string, string>();

  if (uniquePhotoPaths.length > 0) {
    const { data: signedData } = await supabase.storage.from("entry-photos").createSignedUrls(uniquePhotoPaths, 60 * 60);

    signedData?.forEach((item, index) => {
      if (item?.signedUrl) {
        signedUrlMap.set(uniquePhotoPaths[index], item.signedUrl);
      }
    });
  }

  const groupedEntries = entries.reduce<Record<string, EntryRow[]>>((groups, entry) => {
    groups[entry.entry_date] ??= [];
    groups[entry.entry_date].push(entry);
    return groups;
  }, {});

  const currentStock = entries[0]?.end_stock ?? 0;
  const totalAdded = entries.reduce((sum, entry) => sum + entry.added_stock, 0);
  const totalUsed = entries.reduce((sum, entry) => sum + entry.used_stock, 0);

  return (
    <main className="dashboard-shell">
      <section className="hero-card dashboard-hero">
        <div className="protected-header">
          <div>
            <span className="route-chip">/dashboard</span>
            <h1>셔틀콕 기록 게시판</h1>
          </div>
          <SignOutButton />
        </div>

        <p className="session-note">현재 로그인 사용자: {user.email}</p>

        <div className="summary-grid dashboard-summary">
          <article className="summary-card-panel">
            <span>현재 재고</span>
            <strong>{currentStock}</strong>
          </article>
          <article className="summary-card-panel">
            <span>총 입고</span>
            <strong>{totalAdded}</strong>
          </article>
          <article className="summary-card-panel">
            <span>총 사용</span>
            <strong>{totalUsed}</strong>
          </article>
          <article className="summary-card-panel">
            <span>기록 수</span>
            <strong>{entries.length}</strong>
          </article>
        </div>

        <p>
          신규 기록은 <Link className="route-link" href="/entries/new">/entries/new</Link> 에서 추가할 수 있습니다.
        </p>
      </section>

      {entries.length === 0 ? (
        <section className="route-card empty-board">
          <h2>아직 기록이 없습니다.</h2>
          <p>첫 기록을 추가하면 날짜별로 이 게시판에 자동 정리됩니다.</p>
        </section>
      ) : (
        Object.entries(groupedEntries).map(([date, dateEntries]) => (
          <section className="date-section" key={date}>
            <div className="date-section-header">
              <div>
                <h2>{formatDateLabel(date)}</h2>
                <p>{dateEntries.length}개 기록</p>
              </div>
            </div>

            <div className="entry-card-list">
              {dateEntries.map((entry) => (
                <article className="entry-card" key={entry.id}>
                  <div className="entry-card-header">
                    <div>
                      <h3>{entry.title}</h3>
                      <p>
                        작성자: {entry.profiles?.display_name ?? "이름 없음"}
                        {entry.location ? ` · ${entry.location}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="entry-stats">
                    <div>
                      <span>시작</span>
                      <strong>{entry.start_stock}</strong>
                    </div>
                    <div>
                      <span>입고</span>
                      <strong>{entry.added_stock}</strong>
                    </div>
                    <div>
                      <span>사용</span>
                      <strong>{entry.used_stock}</strong>
                    </div>
                    <div>
                      <span>종료</span>
                      <strong>{entry.end_stock}</strong>
                    </div>
                  </div>

                  <p className="entry-notes">{entry.notes ?? "상세 메모 없음"}</p>

                  {entry.entry_photos && entry.entry_photos.length > 0 ? (
                    <div className="entry-photo-grid">
                      {entry.entry_photos.map((photo) => {
                        const signedUrl = signedUrlMap.get(photo.storage_path);

                        if (!signedUrl) {
                          return null;
                        }

                        return (
                          <Image
                            alt="셔틀콕 기록 사진"
                            className="entry-photo"
                            height={120}
                            key={photo.id}
                            src={signedUrl}
                            unoptimized
                            width={120}
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
