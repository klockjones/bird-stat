"use client";

import { useRouter } from "next/navigation";
import { ComponentProps, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "sign-in" | "sign-up";

export function AuthForm() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (mode === "sign-up" && password !== passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setMessage(error.message);
          return;
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("회원가입이 완료되었습니다. 이메일 인증 설정이 켜져 있다면 메일을 확인한 뒤 로그인해 주세요.");
      setMode("sign-in");
      setPassword("");
      setPasswordConfirm("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-tabs">
        <button
          className={mode === "sign-in" ? "auth-tab active" : "auth-tab"}
          onClick={() => setMode("sign-in")}
          type="button"
        >
          로그인
        </button>
        <button
          className={mode === "sign-up" ? "auth-tab active" : "auth-tab"}
          onClick={() => setMode("sign-up")}
          type="button"
        >
          회원가입
        </button>
      </div>

      {mode === "sign-up" ? (
        <label className="field">
          표시 이름
          <input
            autoComplete="name"
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="예: 클럽 운영자"
            required
            value={displayName}
          />
        </label>
      ) : null}

      <label className="field">
        이메일
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="field">
        비밀번호
        <input
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="6자 이상"
          required
          type="password"
          value={password}
        />
      </label>

      {mode === "sign-up" ? (
        <label className="field">
          비밀번호 확인
          <input
            autoComplete="new-password"
            minLength={6}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="비밀번호를 한 번 더 입력하세요"
            required
            type="password"
            value={passwordConfirm}
          />
        </label>
      ) : null}

      <button className="primary-action" disabled={isSubmitting} type="submit">
        {isSubmitting ? "처리 중..." : mode === "sign-in" ? "로그인" : "회원가입"}
      </button>

      <p className="auth-help">
        {mode === "sign-in"
          ? "기존 사용자 계정으로 로그인합니다."
          : "회원가입 시 profiles 테이블에 표시 이름이 자동 생성됩니다."}
      </p>

      {message ? <p className="auth-message">{message}</p> : null}
    </form>
  );
}
