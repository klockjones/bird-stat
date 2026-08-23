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
    <main className="simple-page auth-layout">
      <section className="route-card">
        <span className="route-chip">/login</span>
        <h1>Bird Stat 로그인</h1>
        <p className="auth-help">
          5명 규모의 운영 사용자 기준으로 이메일 로그인부터 연결합니다. 회원가입 시 display name이
          `profiles` 테이블로 자동 생성되도록 앞 단계에서 트리거를 준비해 두었습니다.
        </p>
        <AuthForm />
      </section>
    </main>
  );
}
