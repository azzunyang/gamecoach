# GameCoach

블록체인 기반 1:1 게임 코칭 플랫폼. 스마트컨트랙트 에스크로로 투명한 결제를 보장합니다.

## 기술 스택

- **Frontend / API**: Next.js 15 (App Router) + TypeScript
- **배포**: Cloudflare Pages
- **DB**: Cloudflare D1 (SQLite)
- **세션**: Cloudflare KV
- **결제**: Ethereum Sepolia 스마트컨트랙트 (Hardhat + Solidity)
- **인증**: MetaMask 지갑 서명 (EIP-191 personal_sign) + Discord OAuth2 (마이페이지 연동)

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 — 서브 네비, 히어로 배너(텍스트만), 게임 카테고리 아이콘 필터, 코치 카드(12명), 강의 목록(8개) |
| `/coaches` | 코치 목록 (카테고리 필터, 검색, 썸네일 카드) |
| `/coaches/[id]` | 코치 상세 + 진행 중인 강의 목록 + 수업 신청 모달 |
| `/auth/login` | MetaMask 지갑 로그인 |
| `/auth/register` | MetaMask 지갑 회원가입 (역할 선택만 — 상세 프로필은 다음 단계) |
| `/profile/setup` | 회원가입 직후 프로필 설정 (닉네임·자기소개·게임·티어·가격 등) |
| `/dashboard/coach` | 코치 대시보드 (수업 관리, 슬롯, 프로필, 강의 관리) |
| `/dashboard/coach/lectures` | 코치 강의 목록 관리 (공개/비공개, 삭제) |
| `/dashboard/coach/lectures/new` | 새 강의 등록 |
| `/dashboard/student` | 수강생 대시보드 (수업 내역, 코치 찜, 강의 찜, 회원 탈퇴) |
| `/chat/[lessonId]` | 코치↔수강생 채팅 |
| `/review/[lessonId]` | 수업 리뷰 작성 (별점 4항목 + 텍스트) |
| `/admin` | 관리자 대시보드 (통계) |
| `/admin/users` | 회원 관리 (검색, 관리자 지정, 삭제) |
| `/admin/coaches` | 코치 관리 (티어 인증, 정지/복구) |
| `/admin/reports` | 신고 관리 (티어 신고 처리) |

## API 라우트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/auth/nonce` | 지갑 서명용 nonce 발급 (5분 유효) |
| POST | `/api/auth/wallet` | MetaMask 서명 검증 → 로그인/회원가입 (ADMIN_WALLET 지갑은 자동 admin 지정) |
| GET | `/api/auth/me` | 현재 세션 유저 조회 (is_admin 포함) |
| POST | `/api/auth/logout` | 로그아웃 |
| PATCH | `/api/profile` | 프로필 저장 |
| GET | `/api/coaches` | 코치 목록 조회 (카테고리·검색·페이지) |
| GET/PATCH | `/api/coaches/[id]` | 코치 상세 조회 / 프로필 수정 |
| GET/POST/DELETE | `/api/coaches/[id]/slots` | 슬롯 조회 / 추가 / 삭제 |
| GET/POST | `/api/lectures` | 강의 목록 조회 / 코치 등록 (q·category·coach_id 파라미터) |
| GET/PATCH/DELETE | `/api/lectures/[id]` | 강의 상세 / 수정 / 삭제 |
| GET/POST/DELETE | `/api/wishlist/lectures` | 강의 찜 목록 / 추가 / 제거 |
| GET/POST | `/api/lessons` | 수업 목록 / 신청 |
| GET/PATCH | `/api/lessons/[id]` | 수업 상세 / 상태 변경 |
| GET/POST | `/api/messages/[lessonId]` | 채팅 메시지 조회 / 전송 |
| POST | `/api/reviews` | 리뷰 작성 |
| DELETE | `/api/user/delete` | 회원 탈퇴 (진행 중 수업 있으면 409) |
| GET | `/api/admin/stats` | 관리자 전체 통계 |
| GET | `/api/admin/users` | 전체 회원 목록 (관리자 전용) |
| PATCH/DELETE | `/api/admin/users/[id]` | 회원 관리자 지정·해제 / 삭제 |
| GET | `/api/admin/coaches` | 코치 목록 (관리자 전용, 인증 필터) |
| PATCH | `/api/admin/coaches/[id]` | 티어 인증 / 코치 정지·복구 |
| GET | `/api/admin/reports` | 신고 목록 (관리자 전용) |
| PATCH | `/api/admin/reports/[id]` | 신고 처리 (티어 인증 연동 가능) |

## 인증 흐름

```
회원가입: 역할 선택 → Discord OAuth → 콜백: DB 유저 생성 + 세션 → /profile/setup
로그인:   Discord OAuth → 콜백: 기존 유저 조회 + 세션 → 대시보드
```

- Discord OAuth2 (`identify` scope) 기반 인증
- `state` 파라미터에 `role:intent` 인코딩하여 전달
- 이미 가입된 Discord 계정으로 가입 시도 → 자동 로그인 처리
- MetaMask는 수업 신청 시 에스크로 결제에서만 사용 (인증과 분리)
- 비로그인 사용자도 코치 목록·프로필·강의 열람 가능

## 수업 신청 3단계 모달

1. **일정 선택** — 달력에서 날짜 + 시간 선택
2. **수업 안내** — 커리큘럼 / 진행 방식 / 예약금·환불 안내
3. **결제 확인** — 예약금(30%) MetaMask 결제

## 환경 변수 (추가)

| 변수 | 설명 |
|------|------|
| `ADMIN_WALLET` | 최초 관리자 지갑 주소 (소문자). 해당 주소로 첫 로그인 시 자동 admin 지정 |

## DB 스키마 요점

- `users.id` = `coaches.id` (coaches는 users의 1:1 확장, 별도 user_id 컬럼 없음)
- `users`: id, phone?, wallet (UNIQUE), discord_id?, role, nickname, created_at
- `coaches`: id(=users.id), nickname, game_category, tier, price_eth, session_min, intro, ...
- `slots`: is_booked (not `booked`), start_time / end_time (not `time`)

## 스마트컨트랙트 상태 흐름

```
IDLE → PENDING → ACCEPTED → ACTIVE → COMPLETED
              ↘ REJECTED    ↘ CANCELLED
                             ↘ DISPUTED → RESOLVED
```

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

## Cloudflare 배포

```bash
wrangler login

# D1 + KV 생성 후 wrangler.toml에 ID 기입
wrangler d1 create gamecoach-db
wrangler kv namespace create "KV"

# 마이그레이션 순서대로 적용
wrangler d1 execute gamecoach-db --remote --file=migrations/0001_init.sql
wrangler d1 execute gamecoach-db --remote --file=migrations/0002_add_nickname.sql
wrangler d1 execute gamecoach-db --remote --file=migrations/0003_wallet_auth.sql

# 빌드 & 배포
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=gamecoach
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | 배포된 에스크로 컨트랙트 주소 |
| `SEPOLIA_RPC_URL` | Sepolia RPC 엔드포인트 |
| `DEPLOYER_PRIVATE_KEY` | 컨트랙트 배포용 지갑 키 (커밋 금지) |
| `DISCORD_CLIENT_ID` | Discord OAuth 앱 ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth 시크릿 |
| `DISCORD_REDIRECT_URI` | Discord 콜백 URL |
