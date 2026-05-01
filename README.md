# borwn

Next.js(App Router)와 **한국투자 Open API(KIS)** 연동 샘플입니다.  
클라이언트는 우리 서버의 **`/api/*` Route Handler**만 호출하고, **앱 키·시크릿·KIS 접근 토큰**은 모두 **서버(`entities/kis`)**에서만 다룹니다.

## 스택

- **Next.js** 16 (`src/app`)
- **React** 19, **TypeScript**
- **axios** (KIS REST)
- 폴더 구성은 **Feature-Sliced Design**에 가깝게 (`entities`, `widgets`, `shared` + Next용 `app`)

## 시작하기

```bash
pnpm install
cp .env.example .env.local
# .env.local 에 KIS 키 입력
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) — 토큰·시세 테스트 UI (`widgets/kis-connect-test`).

```bash
pnpm build
pnpm start
```

## 환경 변수

`.env.example` 참고. 최소 필요 항목:

| 변수 | 설명 |
|------|------|
| `KIS_BASE_URL` | REST 베이스 URL (모의: `https://openapivts.koreainvestment.com:29443`, 실전은 공식 문서 도메인) |
| `KIS_APP_KEY` | 앱 키 |
| `KIS_APP_SECRET` | 앱 시크릿 |
| `KIS_STOCK_TICKER` | (선택) 시세 샘플 종목코드, 기본 `005930` |

**접근 토큰**은 발급 제한이 있어 서버 메모리에 캐시합니다. 새로 `tokenP`를 치는 횟수는 `expires_in` 직전까지 줄입니다. (서버리스/프로세스 재시작 시 캐시는 비워집니다.)

## 라우팅 및 API

클라이언트에서 사용하는 HTTP 엔드포인트:

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/token` | KIS 접근 토큰 발급(캐시 우선), JSON에 `cached` 포함 가능 |
| `GET` | `/api/stock` | 샘플: 국내 현재가(inquire-price), `KIS_STOCK_TICKER` 사용 |

실제 한국투자 호출·캐시 로직은 **`src/entities/kis`** 에 있습니다.  
`route.ts`는 요청을 받아 엔티티 함수를 호출하고 `NextResponse.json`만 감싸는 **얇은 BFF 역할**입니다.

## 디렉터리 구조 (요약)

```
src/app/                    # Next 레이아웃·페이지·Route Handlers
  api/token/route.ts
  api/stock/route.ts

src/entities/kis/
  api/
    access-token.ts         # tokenP + 인메모리 캐시
    kis-http.ts             # 인증 TR용 axios (매 요청 Bearer·appkey·appsecret 자동)
    kis-public-http.ts      # tokenP 등 OAuth 전용 axios (Bearer 미부착)
    inquire-domestic-price.ts
  config/rest-env.ts
  model/types.ts

src/widgets/kis-connect-test/   # 샘플 UI
src/shared/lib/                  # 공용 유틸 (format-axios-error 등)
```

참고: `kis-http-oauth.ts`가 있다면 `kis-public-http.ts`와 역할이 겹칠 수 있어, 실제 import 기준으로 하나로 정리하는 것을 권장합니다.

## 새 KIS TR 추가하는 방법

1. **공식 API 문서**에서 `URI`, `tr_id`, 파라미터 확인  
2. **`entities/kis/api`** 에 도메인 함수 추가 (예: `kisHttp.get` / `kisHttp.post` + `headers: { tr_id: "…" }`)  
3. 브라우저에서 부를 거면 **`app/api/<이름>/route.ts`** 를 추가해 위 함수를 호출

인증이 필요한 TR은 **`kis-http`** (`kisHttp`, `getKisAxios`)만 사용하면 됩니다.  
**`tokenP`** 만 **`kis-public-http`** 의 `kisPublicPost` 경로로 두어, `access-token` ↔ `kis-http` **순환 import**를 피합니다.

## 보안

- `KIS_APP_SECRET` 등은 **절대 클라이언트 번들에 넣지 마세요.**
- `kis-http` / `access-token` / `kis-public-http` 는 **서버 전용**으로만 import 하세요.

## 참고 링크

- [한국투자 Open API](https://apiportal.koreainvestment.com/) — 엔드포인트·엑셀 규격서·샘플
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
