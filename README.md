# Bird Stat

셔틀콕 수량과 사진 기록을 날짜별 게시판 형태로 관리하는 Next.js 기반 웹 대시보드입니다.

## 현재 스택

- Next.js App Router
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- GitHub
- Vercel

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
- 보호 라우트 (`/dashboard`, `/entries/new`, `/board`, `/stats`, `/users`)
- 모바일 홈형 대시보드
- History 한 줄 리스트 화면
- 최근 3개월 사용 통계
- 운영 사용자 정보 화면
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

## 배포

운영 URL:

```text
https://bird-stat.vercel.app
```

## 다음 개선 후보

- 수정 / 삭제 기능
- 남은 모바일 UX 미세조정
- Supabase 데이터 관리 기능 보강
