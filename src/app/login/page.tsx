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
    <main className="ios-auth-shell">
      <section className="ios-auth-hero">
        <span className="route-chip">Bird Stat</span>
        <p className="ios-home-date">Shuttlecock Operations Dashboard</p>
        <h1 className="ios-auth-title">셔틀콕 운영 대시보드</h1>
        <p className="hero-copy ios-auth-copy">
          셔틀콕 수량, 사진 메모, 운영 기록을 모바일에서 빠르게 정리하고 공유하는 내부 관리 화면입니다.
        </p>
      </section>

      <section className="ios-auth-panel">
        <div className="ios-section-header auth-section-title">
          <div>
            <h2>로그인</h2>
            <span>기존 계정으로 바로 시작</span>
          </div>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
