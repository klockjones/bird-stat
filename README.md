# Bird Stat

셔틀콕 수량과 사진 기록을 날짜별 게시판 형태로 관리하는 Next.js 기반 웹 대시보드입니다.

## 현재 스택

- Next.js App Router
- Supabase Auth
- Supabase Postgres
- Supabase Storage

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```

## 현재 구현 범위

- 이메일 회원가입 / 로그인 / 로그아웃
- 보호 라우트 (`/dashboard`, `/entries/new`)
- 날짜별 기록 조회 게시판
- 재고 수량 입력 및 종료 수량 자동 계산
- 이미지 압축 후 Supabase Storage 업로드
- 전체 사용자 기록 조회
- 작성자 표시명 표시

## 환경변수

`.env.local` 파일에 아래 값이 필요합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 주의 사항

- `.env.local` 은 Git에 커밋하지 않습니다.
- Supabase `service_role` / secret key는 프론트엔드에 넣지 않습니다.
- 모바일 원본 이미지는 업로드 전에 클라이언트에서 압축되도록 설계되어 있습니다.

## 남은 단계

- GitHub 연결
- Vercel 배포
- 운영 환경 검증
