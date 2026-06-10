# VIVA RICH

8명이 함께 쓰는 월간 일정 및 네이버 카페 인증글 체크 보드입니다.

## 현재 가능한 기능

- 월별 일정 추가, 수정, 삭제
- 퀸즈 일정 / 경제 캘린더 / 숙제 및 후기 / 카페 일정 분류
- 8명 아침·저녁 인증 현황 확인
- 각 멤버가 자기 이름에서 아침·저녁 인증 링크 직접 등록 및 수정
- Supabase 연결 시 8명의 기기 간 공동 저장 및 실시간 동기화

## 실행

```bash
npm install
npm run dev
```

## Supabase 공동 저장 연결

1. Supabase SQL Editor에서 `supabase/schema.sql` 내용을 한 번 실행합니다.
2. Vercel 프로젝트의 Environment Variables에 아래 값을 추가합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Vercel에서 Production을 다시 배포합니다.

환경변수가 없으면 기존처럼 브라우저 로컬 저장 방식으로 작동합니다.

## 네이버 카페 자동 확인 연결

회원 전용 카페 글은 일반 서버에서 공개 API로 읽을 수 없습니다. 자동 확인은 사용자의
PC에서 로그인된 브라우저 프로필을 이용하는 별도 수집기로 연결하는 방식이 적합합니다.

수집기는 오전/저녁 예약 시간에 지정 게시판을 열고, 당일 날짜와 8명 이름을 검색한 뒤
최신 게시글 URL을 이 앱의 저장소로 전송하도록 구성합니다.
