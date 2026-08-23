import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-shell">
      <section className="auth-story hero-card">
        <span className="route-chip">Bird Stat</span>
        <p className="eyebrow">Shuttlecock Operations Dashboard</p>
        <h1>셔틀콕 운영 대시보드</h1>
        <p className="hero-copy">
          날짜별 기록, 수량 흐름, 사진 메모를 함께 관리하도록 설계된 셔틀콕 운영용 내부 대시보드입니다.
        </p>
        <div className="auth-feature-list">
          <article>
            <strong>전체 공유 보드</strong>
            <span>모든 운영 사용자가 같은 기록 흐름을 확인합니다.</span>
          </article>
          <article>
            <strong>사용자별 입력</strong>
            <span>작성자는 `auth.uid()` 기준으로 안전하게 연결됩니다.</span>
          </article>
          <article>
            <strong>모바일 사진 최적화</strong>
            <span>업로드 전에 자동 압축해 저장량과 속도를 함께 관리합니다.</span>
          </article>
        </div>
      </section>

      <section className="route-card auth-panel">
        <span className="route-chip">/login</span>
        <h2>로그인 또는 회원가입</h2>
        <p className="auth-help">
          회원가입 시 display name이 `profiles` 테이블로 자동 생성됩니다. 최초 운영자 등록 후에는 기존 계정으로 로그인해 사용하면 됩니다.
        </p>
        <AuthForm />
      </section>
    </main>
  );
}
