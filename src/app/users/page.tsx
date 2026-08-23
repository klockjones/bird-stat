import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  display_name: string;
};

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profiles } = await supabase.from("profiles").select("id,display_name").order("created_at", { ascending: true });
  const typedProfiles = (profiles ?? []) as ProfileRow[];

  return (
    <main className="simple-page">
      <section className="route-card">
        <div className="protected-header">
          <div>
            <span className="route-chip">/users</span>
            <h1>운영 사용자</h1>
          </div>
          <SignOutButton />
        </div>

        <section className="users-summary-panel">
          <div>
            <span>현재 등록 인원</span>
            <strong>{typedProfiles.length}명</strong>
          </div>
          <p>셔틀콕 기록을 입력하고 조회할 수 있는 운영 사용자 목록입니다.</p>
        </section>

        <div className="users-grid-list">
          {typedProfiles.map((profile, index) => (
            <article className="user-detail-card" key={profile.id}>
              <div className="user-detail-top">
                <span className="user-pill-avatar large-avatar">{profile.display_name.slice(0, 1)}</span>
                <span className="user-order-chip">#{String(index + 1).padStart(2, "0")}</span>
              </div>

              <div className="user-detail-body">
                <p className="eyebrow">Member</p>
                <strong>{profile.display_name}</strong>
                <p className="user-subtle-copy">기록 작성 및 전체 보드 조회 가능</p>
              </div>
            </article>
          ))}
        </div>

        <div className="user-pill-list compact-user-pills">
          {typedProfiles.map((profile) => (
            <article className="user-pill-card" key={`${profile.id}-compact`}>
              <span className="user-pill-avatar">{profile.display_name.slice(0, 1)}</span>
              <strong>{profile.display_name}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
