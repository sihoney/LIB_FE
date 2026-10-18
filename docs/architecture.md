# LIB_FE 폴더 구조와 의존 규칙

## 1. 목적과 적용 상태

LIB_FE는 MES_FE의 구조를 참고하는 독립적인 도서관 프론트엔드다. MSW·Faker로 화면과 업무 흐름을 먼저 검증하고, 이후 별도 LIB_BE의 API로 연결한다. MES의 구조가 해결하는 문제를 이해하면서 필요한 공통화를 단계적으로 진행한다.

도서·회원·대출의 데이터 관계와 업무 규칙은 [도메인 설계 초안](domain-design.md)에 기록한다. 요구사항의 필수 규칙과 미확정 제안 정책을 구분하며, 설계 기록을 구현 완료로 간주하지 않는다.

2026-10-14 추가: Book 상수·저장/목록/검색 타입·목록 API 계약, 고정 도서·최소 대출 Mock 데이터와 가용 수량 계산 함수를 준비했다. 상세 계약은 [도메인 설계 문서](domain-design.md#목록-api-계약)를 따른다. 당시 도서 MSW 핸들러·Repository·Service·목록 화면은 미연결이었으며, 2026-10-17 연결했다(§23). 기존 공지글은 유지하며 도서 화면 전환 시 제거 범위를 별도 확인한다.

2026-10-17 현재 상태 (과거 도입 기록은 아래 절 참고):

| 상태      | 구성                                                             |
| --------- | ---------------------------------------------------------------- |
| 구현됨    | React 19, TypeScript 5.9, Vite 7, SWC, Oxlint, Prettier, LF 설정 |
| 구현됨    | 프로젝트 루트 `@` 별칭, 개발 환경값, `envKeys.ts`, 환경변수 타입 |
| 구현됨    | 앱 시작 흐름, MSW·Query·Router, Axios 조회, 테스트 공지글        |
| 도입 예정 | react-hook-form·Zod                                              |
| 구현됨    | MUI·Tailwind, 웹 테마·ThemeProvider, Zustand 테마 저장           |
| 구현됨    | Faker 공지 초기화, 공통 레이아웃, 도서 목록 조회                 |

인증·회원·대출 업무는 미구현이다. 도서 사용자 지정 정렬은 후속 범위다.

이 문서의 예시 경로는 목표 배치이며, 파일이 이미 존재한다는 뜻은 아니다. 사용하지 않는 빈 폴더와 기반 클래스는 생성하지 않는다. 규칙은 현재 문서·리뷰 기준이며 전체 의존 방향을 검사하는 자동 린트 규칙은 아직 없다.

## 2. 계층과 의존 방향

```text
Page / 업무 Component / 조합 Hook
                ↓
Service (TanStack Query 훅·query options·캐시 갱신)
                ↓
Repository (도메인별 HTTP 요청)
                ↓
HttpClient (Axios·공통 요청/응답 처리)
                ↓ HTTP
MSW 또는 실제 LIB_BE
```

각 화살표는 주된 호출·의존 방향이다. Page는 필요에 따라 Service를 직접 사용할 수 있으며, 모든 호출에 별도 Component를 만들 필요는 없다. 순수 `components/ui/`는 이 업무 호출 흐름을 담당하지 않는다.

| 계층                | 책임                                         | 피할 내용                           |
| ------------------- | -------------------------------------------- | ----------------------------------- |
| Page                | 라우트, 화면 조립, 검색 조건, UI 이벤트 연결 | Axios 직접 호출, 데이터 저장소 구현 |
| 업무 Component·Hook | 여러 UI·Service의 조합                       | 다른 계층에 같은 서버 데이터 복제   |
| Service             | 조회·변경 훅, Query key, 변경 후 캐시 갱신   | JSX, 범용 계산 함수, HTTP 세부 설정 |
| Repository          | 엔드포인트·타입에 맞는 요청                  | React Hook, 화면 알림·모달 제어     |
| HttpClient          | 기본 주소, 직렬화, 공통 응답·오류·인증 처리  | 특정 도서·회원 업무 규칙            |

하위 계층이 상위 계층의 화면·Service를 참조하는 순환을 만들지 않는다. HttpClient의 인증·알림 연동은 필요한 시점에 좁은 콜백·계약을 주입하며, 업무 Service를 직접 import하지 않는 방향으로 구성한다.

`services/services.ts`는 인스턴스를 생성·연결하는 조립 지점으로 계획한다. 처음에는 이 파일에서 명시적으로 의존성을 주입하고, 반복을 확인한 뒤 MES의 `wire()`와 같은 도우미를 도입한다. React 컴포넌트마다 Repository·Service 인스턴스를 생성하지 않는다.

## 3. 폴더별 책임

| 경로                                  | 내용                                                |
| ------------------------------------- | --------------------------------------------------- |
| `pages/`                              | 파일 기반 라우트, 레이아웃, 화면 조립               |
| `pages/**/-components/`               | 해당 화면 계층에서만 쓰는 UI 부품                   |
| `components/ui/`                      | Button·Table·Modal 등 props 기반의 순수 UI          |
| `components/`                         | 여러 화면이 공유하는 로직 포함 UI, 종류별 폴더 사용 |
| `components/tables/modules/{module}/` | 도메인 행 타입별 표시용 테이블                      |
| `contexts/`                           | MSW·Query·Theme 등 Provider                         |
| `networks/`                           | HttpClient, 인터셉터 등 통신 기반                   |
| `repositories/`                       | API 요청                                            |
| `services/`                           | Query 훅·options·mutation, 인스턴스 조립            |
| `types/`                              | API DTO, 공통 계약, UI 타입                         |
| `schemas/`                            | Zod 폼·검색 입력 검증                               |
| `consts/`                             | 환경값, 상태 코드, 라벨 등 상수                     |
| `stores/`                             | 클라이언트 상태 저장                                |
| `hooks/`                              | React 조합 로직 (`use*`)                            |
| `utils/`                              | 변환·계산·포맷 등 순수 함수                         |
| `mocks/`                              | MSW 설정, 핸들러, Mock 저장소, 초기 데이터          |

`components/ui/`는 도서·회원 Service, 업무 Store, 라우터를 직접 사용하지 않는다. 이벤트는 props로 전달받는다. 프로젝트 공통 로직을 사용하는 컴포넌트는 `components/`의 UI 외 영역에 둔다. 테이블은 API 호출 없이 행 데이터·로딩·페이지 상태·이벤트를 받아 표시한다.

페이지 전용 로직도 Hook은 `hooks/modules/...`, 순수 함수는 `utils/modules/...`에 둔다. 페이지 아래에 별도 `-hooks/`, `-utils/`를 만들지 않는다. 큰 코드를 줄 수만으로 분리하지 않고 책임과 재사용 범위를 기준으로 나눈다.

## 4. 공통 코드와 모듈

`types`, `schemas`, `consts`, `stores`, `hooks`, `utils`, `repositories`, `services`는 다음 배치를 따른다.

```text
src/{layer}/common/           여러 영역이 공유하는 기반
src/{layer}/modules/lib/      도서·회원·대출·도서관 현황
src/{layer}/modules/sys/      로그인·계정·역할·접근 제어
```

이 규칙을 `pages`, `contexts`, `networks`에 기계적으로 적용하지 않는다. 페이지는 라우트 트리, 나머지는 각 기반 책임에 맞춰 배치한다.

| 예시 파일                                      | 책임                           |
| ---------------------------------------------- | ------------------------------ |
| `types/common/repository.ts`                   | 공통 요청·응답·페이징 계약     |
| `types/modules/lib/book.ts`                    | 도서 DTO                       |
| `schemas/modules/lib/book.ts`                  | 도서 입력 검증                 |
| `repositories/modules/lib/bookRepository.ts`   | 도서 API 요청                  |
| `services/modules/lib/bookService.ts`          | 도서 조회·변경 훅              |
| `components/tables/modules/lib/TableBooks.tsx` | 도서 목록 표시                 |
| `repositories/modules/sys/authRepository.ts`   | 로그인·인증 요청               |
| `consts/common/envKeys.ts`                     | 구현되어 있는 환경값 접근 지점 |

회원 프로필·탈퇴·대출 이력은 `lib` 업무다. 로그인 계정·인증 상태·역할은 `sys` 책임이다. 인증 Service가 도서·대출 Service를 역으로 호출하지 않는다. 권한에 따른 화면 조립과 사용자 변경 시 캐시 초기화는 상위 계층·조립 지점에서 연결한다.

공통 코드는 특정 업무 모듈을 import하지 않는다. 도메인 이름만 지워서 `common`으로 이동하지 않고, 실제로 여러 영역에서 같은 책임으로 쓰일 때 공통화한다. 모듈 간 공유는 식별자·작은 계약을 우선 사용한다.

## 5. 상태 소유권

| 상태                          | 도입할 도구           | 원칙                                           |
| ----------------------------- | --------------------- | ---------------------------------------------- |
| 도서 목록·회원 정보·대출 기록 | TanStack Query        | 서버 데이터의 단일 조회 기준                   |
| 사이드바·테마 등 공유 UI 상태 | Zustand               | 서버 목록을 복제하지 않음                      |
| 등록·수정 폼 초안·입력 오류   | react-hook-form + Zod | 서버 원본과 편집 중 초안을 구분                |
| 일반 목록 검색 조건·페이지    | React 로컬 state·Hook | 입력값과 적용 조건을 구분, 반복 확인 후 공통화 |
| URL 공유·직접 진입 조건       | TanStack Router       | 해당 조건에 한해 URL과 요청을 연결             |

도서 등록 후 도서 목록을 무효화하고, 대출·반납 후에는 도서 재고·대출 현황·회원 이력·대시보드 등 영향을 받는 쿼리를 갱신한다. 실제 Query key·정책은 기능 구현 시 정의한다. MES의 짧은 캐시 시간·영속 캐시 설정을 검토 없이 복사하지 않는다.

## 6. API와 Mock 경계

MES의 다음 업무 API 규약을 목표로 한다. 인증 등 별도 규약이 필요한 엔드포인트는 계약을 따로 정의한다.

```text
조회: POST /v2/{module}/{signature}/{functionCode}/GetData
변경: POST /v2/{module}/{signature}/{functionCode}/Update
```

HttpClient의 메서드 이름과 실제 HTTP 메서드를 구분한다. 공통 요청의 `data`, `skip`, `take`, `sortings`, `filtering`과 응답의 `success`, `data`, `totalRecords`, 오류 메시지는 API 계약 단계에서 타입으로 확정한다.

Mock 내부 목표 흐름:

```text
MSW HTTP 핸들러 → Mock 업무 로직·Repository → Mock 저장소
                                               ↑
                                  Faker·고정 사례로 초기화
```

- 화면은 같은 Repository·HttpClient로 요청한다. 일반 Repository를 Mock 전용 인스턴스로 교체하는 구조로 만들지 않는다.
- 처음에는 도서 핸들러와 작은 저장소부터 만들고, 회원 기능에서 CRUD·필터·정렬·페이징 반복을 확인한 뒤 `BaseMockRepository` 등을 추출한다.
- Faker는 초기화에 사용한다. 동일 seed와 제어 가능한 기준 날짜, 재고 0·연체 등 고정 사례를 둔다.
- Mock 데이터 유지·초기화는 Mock 저장소의 책임이며, 화면용 Zustand 서버 목록으로 구현하지 않는다.
- Mock 업무 규칙은 개발용 시뮬레이션이다. 실제 인증·권한·트랜잭션·동시성은 LIB_BE 구현 후 별도 검증한다.
- `ENV_ENABLE_MSW`가 true이면 `MswProvider`가 Worker를 시작하고 완료 후 하위 화면을 렌더링한다. false이면 Worker 모듈을 가져오지 않는다. 테스트 공지글 핸들러를 연결했으며, 미처리 요청은 실제 네트워크로 통과한다.

## 7. 도서 조회 기능의 파일 연결 예시

아래 파일은 앞으로 기능을 구현할 때 생성한다.

1. `types/modules/lib/book.ts`: 도서 응답 타입 정의.
2. `repositories/modules/lib/bookRepository.ts`: 공통 계약으로 도서 목록 요청.
3. `services/modules/lib/bookService.ts`: 요청을 Query 훅으로 제공.
4. `services/services.ts`: HttpClient·Repository·Service 인스턴스 연결.
5. `mocks/repositories/modules/lib/bookMockRepository.ts`: 요청과 일치하는 도서 Mock 응답.
6. `components/tables/modules/lib/TableBooks.tsx`: 전달받은 행을 테이블로 표시.
7. `pages/(web)/(authenticated)/lib/book/index.tsx`: 검색 조건·Service·테이블을 조립.

실제 라우트 경로·인증 레이아웃은 Router 도입 단계에서 확정한다. 새 화면에 서버 호출을 추가할 때 먼저 요청·응답 계약과 Mock 시나리오를 맞춘다.

## 8. 단계적 도입과 학습 기록

| 시점                       | 적용할 내용                                  | 공통화 이유                          |
| -------------------------- | -------------------------------------------- | ------------------------------------ |
| 최초 도서 목록             | 작은 Repository·Service, MSW 응답, 조회 화면 | HTTP·서버 상태·UI 책임을 직접 확인   |
| 도서 CRUD                  | 폼·검증·알림·캐시 갱신                       | 조회와 변경의 차이를 확인            |
| 회원 CRUD                  | 반복된 테이블·검색·폼·Mock CRUD 추출         | 두 업무의 실제 공통점을 확인         |
| 대출·반납                  | 여러 쿼리 갱신, 업무 오류 처리               | 단순 CRUD와 업무 흐름의 차이를 확인  |
| 반복된 인스턴스·메타데이터 | BaseRepository·BaseService·wire 도입 검토    | 반복 생성·Query key 작성 비용을 확인 |

책임 경계는 초기부터 지키되 구현은 작은 함수·클래스로 시작할 수 있다. 추상화할 때는 해당 커밋 본문이나 이 문서에 기존 문제, 변경한 책임, 대응되는 MES 코드, 검증 결과를 기록한다.

Query 영속 캐시·버전 폴링, KeepAlive, 그리드 개인화, MQTT, PDF·리포트, 챗봇, 가상 키보드는 현재 초기 범위에 포함하지 않는다. 보안·데이터 검증은 해당 기능을 도입하는 시점부터 적용한다.

## 9. MES 참고 자료

아래 상대 링크는 LIB_FE와 MES_FE가 같은 부모 폴더에 있다는 현재 배치를 기준으로 한다. LIB_FE 단독 checkout에는 참고 저장소가 없을 수 있다. 이 문서의 규칙은 독립적으로 읽을 수 있어야 하며, 참고 저장소의 작업 지침을 LIB에 자동 적용하지 않는다.

- [MES 계층·상태 관리](../../MES_FE/.claude/rules/architecture.md)
- [MES 폴더 구조](../../MES_FE/.claude/rules/directory-structure.md)
- [MES Repository·Service 패턴](../../MES_FE/.claude/rules/repository-service.md)
- [MES Mock 기반](../../MES_FE/src/mocks/repositories/common/baseMockRepository.ts)
- [MES 도서 관리 참고용 품목 Mock 예제](../../MES_FE/src/mocks/repositories/modules/mdm/mdmItemMockRepository.ts)

현재 구현된 LIB 설정은 [환경값 모듈](../src/consts/common/envKeys.ts)과 [README](../README.md)를 참고한다. 작업 진행·검증·커밋 원칙은 [AGENTS.md](../AGENTS.md)를 따른다.

## 10. 앱 초기화

`main.tsx`는 `StrictMode → MswProvider → QueryProvider → RouterProvider → 라우트의 App` 순서로 구성한다.

- `MswProvider`는 모듈 범위의 Promise를 `use()`로 읽는다. 대기 중에는 `Suspense`가 `AppLoading`을 표시한다.
- MSW 활성화 조건은 MES와 동일하게 `ENV_ENABLE_MSW`다. 개발 모드에서는 `.env.development` 기본값이 true이며, production 기본값은 false다. 공개 배포에서는 활성화하지 않는다.
- Worker URL은 `ENV_BASE_URL`을 사용하여 하위 경로 배포에서도 올바르게 해석한다.
- MES와 동일하게 MSW 시작 실패를 처리하는 별도 최상위 오류 화면은 두지 않는다. Router에서 MES의 `ErrorComponent`와 라우트 오류 처리 방식을 적용한다.
- Router의 오류 처리는 바깥에 있는 MswProvider의 시작 실패까지 처리하지 않는다.
- HMR 시 이전 Worker는 시작 완료 후 정리한다.
- `public/mockServiceWorker.js`는 생성 파일이다. MSW 버전 변경 시 `pnpm exec msw init public --save`로 갱신한다.
- 도서 업무 API와 Faker는 후속 단계에서 추가한다. 테마 Provider는 (web) 라우트에 연결했다. Query·Router와 테스트 공지글 조회는 구현했다. 예제 이미지 파일은 현재 사용하지 않는다.

참고: [React use](https://react.dev/reference/react/use), [MSW worker.start](https://mswjs.io/api/setup-worker/start).

## 11. 테스트용 공지글과 Query·Router

2026-10-05: 도서 업무를 시작하기 전에 QueryProvider와 RouterProvider를 확인하기 위해 `modules/dev`에 공지글 조회만 추가했다. 이는 도서 기능보다 먼저 공통 기반을 확인하려는 학습용 예외이며, 최종 도서관 업무로 편입하지 않는다.

### 실행과 확인

- `pnpm dev` 실행 후 `/`에서 시작 화면, `/dev/notices`에서 공지글 목록을 확인한다.
- 개발 기본 환경은 MSW가 활성화된다. 공지글은 제목 검색과 서버 페이징으로 조회하며 응답 시나리오 제어는 제거했다.
- 재조회 버튼은 현재 Query를 다시 요청한다. 첫 조회 실패는 라우트 오류 화면으로 전달하며, 재조회 실패는 기존 목록을 유지하고 안내한다.
- 오류 화면의 다시 시도는 MES처럼 Query 상태와 라우트 오류 상태를 초기화한다. 실제 통신 실패 처리 UI는 유지한다.
- MSW 비활성화 시에는 실제 API 주소로 요청한다. LIB_BE가 아직 없다면 조회 실패가 정상이다.
- 기본 production 빌드는 MSW가 비활성화되어 가짜 성공 응답을 제공하지 않는다. 현재 학습용 공지글 경로 자체는 production에서도 존재한다. 실서비스 배포 전 테스트 모듈을 제거한다.

### 요청과 상태

`공지글 페이지 → NoticeService → NoticeRepository → HttpClient → MSW 핸들러`로 연결한다. `services/services.ts`에서 인스턴스를 한 번 조립한다.

- API: `POST /v2/Dev/Notice/GetNoticeList/GetData`.
- 요청: `{ data: { title?: string }, skip: 0, take: 10 }`.
- 응답: `{ success, returnMess, returnMessCode, data, totalRecords }`. 성공 시 data는 공지 배열이며 각 항목은 id·title·content를 가진다.
- Query key에 모듈·signature·functionCode·요청 본문을 포함하여 서로 다른 조건의 캐시를 분리한다. 취소 신호는 Repository를 거쳐 Axios로 전달한다.
- QueryClient는 메모리에 하나만 생성한다. staleTime 30초, gcTime 5분이며, MES처럼 자동 재시도·포커스/재접속/마운트 시 자동 재조회를 끈다. 따라서 시간이 지나 stale이 되어도 단순 재방문만으로 갱신되지 않으며, 재조회 버튼으로 갱신한다. 캐시는 페이지 새로고침 시 사라진다.
- Mock은 정적 3건과 350ms 지연을 사용한다. 업무 실패는 HTTP 200의 success=false를 반환하며, HttpClient가 이를 오류로 전환한다. 실제 HTTP 오류 역시 Axios에서 reject된다.

### MES를 따르는 부분과 단순화한 부분

| 항목             | 적용                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider 순서    | MSW → Query → Router, App은 라우트 화면을 감싸는 틀                                                                                                                        |
| 폴더와 요청 계층 | MES의 types·consts·repositories·services 분리, 클래스 Service의 Query 훅, POST 조회 규약                                                                                   |
| Service 린트     | MES와 같은 `src/services/**/*Service.ts`에만 rules-of-hooks 예외 적용. use* 메서드는 컴포넌트/훅 최상위에서 순서가 바뀌지 않게 호출하며 조건문·이벤트에서 호출하지 않는다. |
| 파일 기반 라우팅 | pages·routeTree.gen.ts·Vite 플러그인, Router 오류/없는 경로 화면                                                                                                           |
| Query            | 영속 캐시 생략, 학습을 위해 캐시 시간 조정. Devtools는 MES와 같은 enableDevtools 옵션으로 연결                                                                             |
| HTTP             | 인증·알림·업로드 인터셉터 생략, 조회·응답 해제·업무 오류만 구현                                                                                                            |
| 공통화           | BaseRepository·BaseService·wire 생략, 반복 확인 후 추출                                                                                                                    |
| 화면             | MUI·Tailwind와 웹 테마 적용, 인증·Locale·KeepAlive 미도입. MES와 같은 (web) 라우트에서 ThemeProvider와 App을 사용                                                          |

### 라우트 생성과 검증 명령

`tsr.config.json`에 생성 경로를 모은다. Vite 플러그인은 개발 중 자동 생성·코드 분할을 수행한다. `pnpm routes:generate`는 같은 설정으로 독립 실행하며, lint:type과 build가 타입 검사 전에 이를 호출한다. MES의 설정에 새 checkout을 위한 생성 명령을 보완한 것이다.

`src/routeTree.gen.ts`와 `.tanstack/`는 생성 결과이므로 Git에서 제외한다. 생성 파일은 직접 편집하지 않는다. `pnpm lint`, `pnpm build`로 검증한다.

도서 기능으로 전환할 때 `modules/dev`의 타입·상수·Repository·Service·Mock 핸들러, 공지글 라우트·링크를 제거한다. HttpClient·QueryProvider·RouterProvider와 라우트 생성 설정은 재사용한다.

참고: [TanStack Router Vite 설정](https://tanstack.com/router/latest/docs/installation/with-vite), [MES 공지글 Service](../../MES_FE/src/services/modules/sys/sysNoticeService.ts), [MES QueryProvider](../../MES_FE/src/contexts/QueryProvider.tsx), [MES RouterProvider](../../MES_FE/src/contexts/RouterProvider.tsx).

## 12. 디자인 기반

MES의 공통 테마 옵션 → 웹 테마 → ThemeProvider 구성을 따른다. (web)/route.tsx에서 ThemeProvider로 App을 감싼다. MES의 웹 라우트 계층을 따르며 태블릿 라우트는 만들지 않았다.

- `contexts/themes/common/baseTheme.tsx`: 공통 글꼴, 밝은/어두운 팔레트, 공통 컴포넌트 기본값. MES처럼 밝은 모드 primary는 파랑, 어두운 모드는 초록이다.
- `contexts/themes/webTheme.tsx`: 웹 글자 기준 14px, MUI spacing 4, 카드·버튼 스타일. `deepMerge`로 원본을 변형하지 않고 공통 설정을 병합한다.
- `stores/common/themeStore.ts`: 현재 모드와 변경 함수, localStorage 영속 저장. 웹 Store만 만들고 저장 키는 `lib:web:theme-store`로 구분한다.
- `contexts/ThemeProvider.tsx`: Store를 Context로 제공하고, 모드를 MUI에 동기화한다. MUI 자체 저장은 끄고 Zustand만 저장을 담당한다. CssBaseline은 문서 기본 스타일을 적용한다.
- `index.css`: Tailwind 등록, Noto Sans KR, 공통 CSS 변수. Tailwind의 `text-primary` 등은 MUI의 `--mui-palette-…` 변수를 참조한다. MES와 같은 important 설정으로 명시적인 유틸리티가 MUI 스타일보다 우선한다.
- `SwitchTheme`은 Store에 의존하므로 순수 UI 밖에 둔다. Button 래퍼는 MES처럼 공통 기본값만 제공한다.

공지글에서 MUI 버튼·카드와 Tailwind 간격·문자색을 함께 사용한다. 테마 전환은 두 도구의 색상에 동시에 반영되며 새로고침 후 유지된다. 기존 전역 button 스타일은 범위를 좁혀 MUI·Devtools 버튼에 영향을 주지 않게 했다. 문서 스크롤은 MES처럼 window가 담당한다.

태블릿 테마, 날짜 선택기·그리드·에디터 전용 스타일, 테마 전환 애니메이션은 사용 시점까지 생략한다. 공통 헤더·사이드바는 다음 단계다. Noto Sans KR 파일은 MES의 로컬 자산을 사용한다. Tailwind 포맷 플러그인은 아직 도입하지 않았다.

확인: `/dev/notices`에서 어두운 테마 전환, 새로고침, 정상·빈 목록·오류 응답을 확인한다. 테마 Provider 바깥의 MSW 초기 로딩은 기본 CSS로 표시된다.

참고: [MES ThemeProvider](../../MES_FE/src/contexts/ThemeProvider.tsx), [MES 웹 테마](../../MES_FE/src/contexts/themes/webTheme.tsx), [MUI CSS 테마 변수](https://mui.com/material-ui/customization/css-theme-variables/configuration/), [Tailwind Vite 설정](https://tailwindcss.com/docs/installation/using-vite).

## 13. 웹 라우트 구조 정리

2026-10-09: MES와 같은 경로와 책임 분리를 적용했다.

- `pages/__root.tsx`: Outlet과 루트의 없는 경로 처리.
- `pages/(web)/route.tsx`: 웹 ThemeProvider와 App 적용.
- `pages/(web)/(authenticated)/route.tsx`: MES의 Grid로 사이드바·헤더·본문을 조립한다.
- 시작 화면과 공지글을 (authenticated) 아래로 이동했다. 라우트 ID는 변경되지만 URL은 `/`, `/dev/notices`로 유지한다.
- 루트에서 처리하는 없는 경로 화면은 MES처럼 웹 ThemeProvider·App 바깥에 표시된다. 시작 화면 링크로 웹 영역에 복귀한다.

### 후속 작업

- TODO: 인증 기반 구현 후 MES의 guardAuth('WEB')를 beforeLoad에 연결한다. 현재 접근 제한은 없으며, 폴더 이름이 인증을 수행하지 않는다.
- Header·SidebarMenu 배치는 구현했다. 접기·펼치기와 너비 애니메이션은 구현했다. 방문 탭·hover도 구현했으며 서버 메뉴 연결은 후속 TODO다.
- 메뉴 캐시·모듈 루트 이동·KeepAlive 등 다른 의존 기능은 각 기반을 구현하는 단계에서 연결한다. 빈 인증 함수나 가짜 캐시 loader는 추가하지 않았다.

검증 기준: 기존 URL의 직접 접속·새로고침·이동, 정상/빈 목록/오류 응답, 루트의 없는 경로와 복귀, 테마 저장·복원.

## 14. 공통 레이아웃 배치

2026-10-10: MES의 (authenticated)/route.tsx에서 사용하는 좌측 사이드바·우측 헤더/본문 Grid를 적용했다.

- App은 MES처럼 공통 Container로 children을 감싼다. 기존 800px 최대 폭·중앙 여백을 제거했다.
- MES의 Container 래퍼와 cn(clsx + tailwind-merge)을 사용한다. MuiContainer의 disableGutters=true, maxWidth=false도 함께 적용했다.
- 사이드바는 220px/80px 너비를 0.2초 동안 전환하며 sticky top-0, h-dvh를 사용한다. 오른쪽 헤더도 sticky top-0다.
- index.css의 h-header-web, p-layout-web은 MES와 같은 spacing 기반 값이다.
- 페이지 본문은 window에서 스크롤하고, 사이드바 메뉴 영역만 독립적으로 스크롤한다.
- Header에는 MES의 TabsStrip·TabStrip을 연결했다.
- SidebarMenu에는 기존 두 링크만 옮겼다. 새 메뉴 기능이 아니며 서버 메뉴 연결 전 임시 데이터다.
- 테마 스위치 파일의 사용자 변경은 보존했다. 기존 스위치의 표시 위치만 임시 시작 화면으로 옮겼으며 헤더에는 추가하지 않았다.

BoxLogo를 연결했다. 펼침 상태에서는 LIBRARY, 접힘 상태에서는 LIB를 표시하며 로고를 누르면 시작 화면으로 이동한다. SelectSystem은 LIB만 표시하는 비활성 선택 상자이며 실제 시스템 전환 기능은 없다.

후속 TODO: 서버 메뉴·권한과 useMenuTree 연결, 계정 데이터 연결, KeepAliveOutlet, 테마 전환의 MES 공통 설정 UI 연결. 인증과 / → /dashboard 전환 TODO는 유지한다. 자동 모바일 접기와 임의의 Store 영속 저장은 추가하지 않았다.

### 사이드바 메뉴 구현

2026-10-10: `useMenuTree`에서 기존 시작 화면·공지글 경로를 타입이 보장되는 정적 메뉴 데이터로 제공한다. 서버 메뉴·권한 API는 아직 도입하지 않았다.

`BoxMenuExpanded`와 `BoxMenuCollapsed`는 같은 메뉴 데이터를 표시하며 현재 경로의 활성 상태를 표시하고 공지글 경로로 이동한다. route.tsx·SidebarMenu·ButtonToggleSidebar는 sidebarStore의 open을 각각 구독한다. 바깥 Container의 폭은 220px/80px로 전환하고, 안쪽은 목표 폭을 유지하며 overflow-hidden으로 가린다. hover 동작은 구현했으며 서버 메뉴 트리·즐겨찾기는 후속 작업이다.

### 사이드바 Store와 버튼 분리

MES와 같은 stores/common/sidebarStore.ts, sidebars/buttons/ButtonToggleSidebar.tsx로 책임을 분리했다. open·setOpen·toggle을 Store에서 제공하고 props 전달을 제거했다. Store는 메모리 상태이므로 라우트 이동 중에는 유지되고 새로고침하면 기본 펼침 상태가 된다.

이 절은 최초 Store·버튼 분리 시점의 기록이다. 아래 후속 작업에서 hover와 버튼 스타일을 완료했다. 당시 범위는 상태 공유와 버튼 분리였다. 기존 버튼의 위치·문구·항상 표시되는 동작 및 220px/80px 너비 애니메이션은 유지한다. MES의 hovered·setHovered·해제 지연, ButtonIcon·Icon과 외부 버튼 배치는 후속 TODO로 남긴다. persist·메뉴 API·Faker·방문 탭은 추가하지 않았다.

### 사이드바 hover와 경계 버튼

MES의 hovered·setHovered와 es-toolkit debounce(500ms)를 적용했다. 사이드바 진입 시 즉시 표시하며 이탈 후 500ms가 지나면 숨긴다. 재진입은 예약된 숨김을 취소한다. 버튼은 overflow-hidden 컨테이너의 형제에 배치하고 MES의 방향 아이콘·위치·스타일을 적용한다.

ButtonIcon·Icon은 MES 래퍼를 사용하며 icon 매핑에는 사이드바 방향 아이콘과 방문 탭 메뉴에서 사용하는 아이콘을 포함한다. 다국어 기반은 없어 한국어 문구를 직접 사용하고 TODO를 남겼다. 키보드 포커스 시에도 버튼이 보이도록 focus-visible 표시를 보완했다. 220px/80px 전환과 기존 로고 변경은 유지한다. 앞 절의 hover·버튼 스타일 TODO는 이 작업으로 완료했다.

## 15. 방문 탭

- MES의 Header → TabsStrip → TabStrip 및 MUI 래퍼 구조를 사용한다.
- useTrackablePageInfo는 라우트 staticData.title, 경로, 검색 문자열을 추출한다. 현재 공지글만 추적하며 홈은 제외한다.
- pageHistoryStore는 MES처럼 최대 10개 이력, 경로 템플릿별 중복 방지, 최근 방문 시각, 닫기 및 순서 변경을 관리한다. sessionStorage에 저장하며 앱 유형 분기와 기존 MES 저장 데이터 마이그레이션은 가져오지 않는다.
- TabsStrip은 탭 이동, 우클릭 닫기(현재/다른/오른쪽/모든 탭), dnd-kit 포인터 드래그 정렬을 담당한다.
- 임시 연결: 인증 영역 route의 effect에서 이력을 기록한다. KeepAliveOutlet 도입 후 이 effect를 이동한다. 본문은 일반 Outlet이므로 입력값 등 컴포넌트 상태를 보존하지 않는다. 검색 문자열과 Query 캐시는 별도다.
- TODO: 대시보드 도입 시 마지막 탭 닫기 목적지 /를 MES의 /dashboard로 교체한다. 다국어 기반 도입 시 제목과 메뉴 번역을 연결한다.

## 16. 학습용 공지글 검색·페이징

- 공통화 전에 Notice에 제목 검색과 10개 단위 서버 페이징을 구현한다.
- 입력 중인 제목과 적용한 제목을 분리한다. 제출 시 첫 페이지로 이동하고, 같은 조건·첫 페이지이면 refetch한다.
- 검색·페이지는 공지 페이지의 로컬 상태로 관리한다. URL 시나리오와 시나리오별 컴포넌트 초기화는 제거했다.
- Service는 MES 공지 목록처럼 keepPreviousData를 사용한다. 이전 결과 표시 중이라는 안내와 페이지 이동 잠금을 연결한다.
- Mock 데이터는 독립 Faker 인스턴스의 고정 seed로 모듈 초기화 시 생성한다. 기존 공지 3개와 생성 데이터 50개를 사용하며 서버 영속 저장은 아니다.
- MSW는 제목 부분 일치 검색 후 totalRecords를 계산하고 skip/take를 적용한다. take: 0은 skip 이후 전체 조회다.
- Repository·HttpClient는 기존 전달 구조를 유지한다. useTableState·TableSearchToolbar·MockRepository 공통화는 후속 TODO다.

## 17. 공통 검색 구현의 학습용 보존

- 공통 검색 폼·테이블 상태 구현과 학습 주석은 learning/notice-common-search-snapshot 브랜치(4297df0)에 보존했다.
- 현재는 공지 페이지 안에서 입력값·적용 조건·페이지·검색 및 초기화 처리를 직접 관리한다.
- 공통화에서 추가한 Form·TextField 계층·검색 툴바·테이블 상태 훅·검색 스키마 및 전용 의존성은 제거했다.
- 다른 목록을 직접 구현한 뒤 반복되는 부분을 확인하며 MES 구조로 공통화한다.

## 18. 공지글 테스트 시나리오 제거

- 요청 타입·MSW 응답 분기·선택 링크·validateSearch에서 시나리오를 제거했다.
- Component에서 검색 상태·Service·검색 폼·목록을 직접 연결한다.
- 검색 결과가 없는 경우의 빈 목록과 실제 통신 실패 처리는 유지한다.

## 19. 공지글 상세 조회

- 목록 제목 링크에서 /dev/notices/$noticeId 경로로 이동한다. 상세 페이지에서 ID로 다시 조회하므로 직접 접속도 가능하다.
- MES처럼 params.parse에서 숫자 ID를 검증하고 페이지 → Service(useQuery) → Repository → HttpClient로 조회한다.
- Zod가 없는 현재 단계에서는 Number와 양의 안전 정수 검사로 대체하며 Zod 도입 후 교체할 TODO를 남긴다.
- 상세 쿼리 키에는 상세 API 정보와 noticeId가 포함된 body를 넣는다. enabled는 ID 유무로 결정하고 목록의 keepPreviousData는 사용하지 않는다.
- MSW는 기존 목록 데이터에서 ID가 일치하는 한 건을 반환한다. 임시 계약은 INotice | null이며 미존재 시 성공 응답의 null을 반환한다. 실제 서버 연결 시 계약을 확정한다.
- 상세 UI는 페이지에서 직접 구현한다. 로딩·미존재·제목·본문을 표시하며 최초 통신 오류는 기존 LIB Router 오류 화면으로 전달한다.
- MES의 대시보드 닫기 대신 목록 링크를 임시 연결한다. 목록 검색·페이징은 로컬 상태이므로 복귀 시 초기화된다.
- 인증·권한 검사, 공통 상세 UI, 첨부파일·읽음 기록은 이번 범위에 포함하지 않는다.

## 20. 공지글 등록

- 목록의 등록 버튼으로 공지 전용 ModalCreateNotice를 조건부 렌더링한다. 입력과 검증은 useState로 직접 구현하고 MUI Dialog·TextField를 사용한다.
- 제목·본문은 공백을 제거한 후 필수 검증하며 제목은 MES처럼 최대 200자다. MSW도 같은 규칙으로 검증한다.
- 저장 및 미저장 변경 폐기는 브라우저 확인창으로 임시 연결했다. 공통 Modal·useConfirm·useForm·Zod 도입 시 교체할 TODO를 남긴다.
- usePostNotice(useMutation) → postNotice → HttpClient.post → POST /v2/Dev/Notice/Create/Update 순서로 JSON 요청한다. 첨부·FormData는 후속 범위다.
- MSW는 메모리 배열의 최댓값 다음 ID를 생성하여 앞에 추가한다. 목록·상세가 같은 데이터를 사용하며 새로고침하면 초기화된다.
- 성공 시 목록 API 키로 invalidateQueries를 호출한다. 현재 검색·페이지는 유지하며 조건에 맞지 않는 새 공지는 현재 목록에 보이지 않을 수 있다.
- 목록 무효화 처리가 끝난 후 모달을 닫고 제거한다. 저장 중에는 중복 제출·입력·취소·ESC/배경 닫기를 막으며 실패 시 입력값을 유지하고 모달 안에 오류를 표시한다.
- 재조회 실패는 목록의 기존 오류 처리로 표시한다. 서버 저장 성공과 목록 재조회 실패는 구분한다.

## 21. 공지글 수정

- 목록 행의 수정 버튼에서 선택한 INotice를 ModalUpdateNotice에 전달한다. 상세 조회가 준비될 때까지 입력·저장을 막고 조회 실패·미존재를 구분한다.
- 편집 초기값은 상세 조회에서 가져온다. MES의 useForm values와 달리 첫 편집 시 조회값을 비교 기준으로 보관하여 재조회가 사용자 입력을 덮지 않게 한다. 모달 제거 또는 대상 ID 변경 시 초기화된다.
- 변경이 없으면 제출하지 않는다. 제목·본문 필수 및 제목 200자 검증 후 id와 변경한 필드만 INoticeUpdate로 전송한다. 저장·폐기 확인 및 실패 시 입력 유지는 등록과 같다.
- usePatchNotice → patchNotice → HttpClient.patch → POST /v2/Dev/Notice/Update/Update로 요청한다. 이름은 patch지만 실제 HTTP 메서드는 MES처럼 POST다.
- MSW는 ID·변경 필드를 검증하고 기존 공지에 허용된 필드만 반영한다. 생략 필드는 유지하며 잘못된 입력·미존재 ID는 실패 응답이다. 새로고침하면 초기화된다.
- 성공 시 목록·상세 API 키로 invalidateQueries를 호출한다. MES의 수정은 재조회 완료를 기다리지 않지만 LIB는 Promise.all을 반환해 모달 제거 시 signal에 의한 상세 재조회 취소를 방지한다.
- 현재 목록 검색·페이지는 유지한다. 재조회 실패를 저장 실패로 다시 처리하지 않으며 기존 Query 오류 UI에서 표시한다.
- 공통 폼·모달·확인창·오류 알림·첨부 처리는 후속 TODO이며 이번에는 등록과 수정의 반복을 직접 비교한다.

## 22. 공지글 삭제와 페이지 보정

- 목록 행에서 삭제 확인 후 ID를 전송한다. MES처럼 useDeleteNotice → deleteNotice → HttpClient.delete → POST /v2/Dev/Notice/Delete/Update로 요청한다.
- INotice에 isDeleted를 추가하고 초기·등록 데이터는 false로 둔다. MSW는 배열에서 제거하지 않고 true로 변경한다. 목록·상세·수정에서 삭제 항목을 제외하며 ID를 재사용하지 않는다.
- 삭제 성공 시 MES처럼 목록 쿼리만 무효화한다. 기존 상세 캐시는 별도 처리하지 않으므로 삭제 전 캐시가 남을 수 있다. 상세 캐시 정책은 후속 TODO다.
- MES 공통 삭제 버튼에 없는 중복 요청 차단을 LIB 페이지에서 보완한다. 요청 중 검색·페이지 이동·등록·수정·삭제를 잠그며 실패 시 목록을 유지하고 오류를 표시한다.
- 마지막 페이지 보정은 목록 페이지에서 직접 처리한다. 조회 성공·조회 완료·isPlaceholderData=false일 때 전체 건수로 범위를 계산하고 범위를 벗어난 페이지를 마지막 페이지로 변경한다. 0건이면 pageIndex=0이다.
- 페이지 변경은 현재 컴포넌트의 조건부 상태 조정으로 처리하여 범위를 벗어난 화면을 그리기 전에 다시 렌더링한다. 검색 조건은 유지하며 잘못된 응답·이전 결과를 기준으로 보정하지 않는다.
- TODO: MES 공통 Table 도입 시 직접 작성한 페이지 보정을 제거하고 material-react-table의 범위 보정에 맡긴다. 확인창·오류 알림도 기존 TODO에 따라 공통화한다.

## 23. 도서 목록 조회

- 2026-10-17: `POST /v2/Lib/Book/GetBookList/GetData`를 MSW → HttpClient → BookRepository → BookService → `/lib/book` 화면에 연결했다. 공지글과 기존 사용자 작성 데이터·재고 계산 함수를 유지한다.
- 제목·저자 부분 일치와 분류 일치 조건을 AND로 적용한다. 삭제 도서 제외 → 검색 → ID 오름차순 → 전체 건수 → 페이징 순서이며, 가용 수량은 대출 기록으로 계산한다.
- 잘못된 JSON·검색값·분류·페이징 값은 `INVALID_BOOK_LIST_REQUEST` 실패 응답이다. Repository는 필수 `totalRecords`를 런타임에서 확인한다. 재고 불일치는 서버 오류로 드러낸다.
- MES_FE의 `useTableState` 흐름을 참고해 입력 중 조건, 적용 조건, 페이지를 로컬 상태로 분리했다. 검색·초기화 시 첫 페이지로 이동하며 같은 조건·첫 페이지의 검색은 재조회한다. 기본 페이지 크기는 10이다.
- 일반 목록 상태를 URL과 자동 동기화하지 않는다. URL 공유·특정 대상으로 직접 진입해야 하는 조건에 Router를 사용한다. 공통 훅·테이블은 도서 CRUD 등의 반복을 확인한 뒤 추출한다.
- 메뉴·방문 탭에 도서 목록을 연결했다. 일반 Outlet을 사용하므로 화면을 떠났다 돌아오면 로컬 검색·페이지가 초기화된다. KeepAlive, 도서 CRUD, 사용자 지정 정렬은 후속 작업이다.
- 조회 중 이전 결과 안내, 오류·재시도, 빈 결과, 보유·가용 수량과 대출 가능 여부를 표시한다.

### 도서 목록 검증 기록 (2026-10-17)

- 기존 MES_FE에 설치된 playwright-core와 로컬 Edge를 사용한 일회성 브라우저 검증을 수행했다. LIB_FE에 테스트 의존성을 추가하지 않았다. 검증 스크립트는 Git 제외 경로 `node_modules/.tmp/verify-books.mjs`에 있다.
- 실제 브라우저 fetch → MSW 경계에서 단일·복합 검색, 공백 처리, 빈 결과, 가용 수량 3·1·0·0·2, 삭제 필드 제외, totalRecords, 페이지 범위 밖·take: 0, 잘못된 검색·분류·페이징 입력의 실패 응답을 확인했다.
- 화면 검색·초기화·빈 결과, 브라우저 메모리에만 도서를 추가한 12건의 10개 단위 페이지 이동, 검색 시 첫 페이지 복귀, 재조회 실패와 재시도 복구를 확인했다. 기존 공지글 목록·검색·상세 이동도 통과했다.
- Mock 검증은 실제 서버의 인증·권한·동시성 검증을 대체하지 않는다. 공지글 변경 CRUD의 전체 회귀는 이번 검증 범위에 포함하지 않았다.
- 추가 브라우저 검증(`node_modules/.tmp/verify-books-edge.mjs`): 저자·분류 UI 검색, 로딩 표시·검색 버튼 잠금, 잘못된 JSON, 대소문자 검색, 재고 불일치 HTTP 500, 초기 조회 실패 후 재시도 복구, 메뉴 이동을 통과했다. 검증 스크립트의 상태 선택자 중복을 수정한 뒤 재실행했다.
- `pnpm.cmd lint`, `pnpm.cmd build`, `git diff --check` 통과. 최초 린트에서 발견한 포맷을 대상 파일에만 적용했다. 개발 서버·빌드는 샌드박스 상위 폴더 접근 제한 때문에 제한 밖에서 실행했다.

### 작업계획서 상태 변경 제안

- BOOK-04 검색, BOOK-06 재고 표시, UX-01 도서 목록 로딩·오류·빈 상태: 도서 목록 범위 구현·브라우저 검증 완료로 기록 가능. UX-01의 다른 업무 화면 적용은 남아 있다.
- BOOK-07 페이징: 검색 연동·totalRecords·페이지 이동 완료, 사용자 지정 정렬 연동은 BOOK-05 구현 이후 검증하므로 진행 중으로 유지한다.
- 당시 BOOK-01~03 CRUD와 BOOK-05 사용자 지정 정렬은 미착수였으며, 이후 BOOK-01과 COMM-10 등록 캐시 갱신은 §24에서 구현했다. BOOK-02·03·05는 미착수다.
- 스프레드시트는 직접 수정하지 않았다.

## 24. 도서 등록과 목록 캐시 갱신

- 2026-10-17: `POST /v2/Lib/Book/Create/Update`를 MSW → HttpClient → BookRepository → `BookService.usePostBook` → 도서 등록 모달에 연결했다.
- 등록 요청은 제목·저자·분류·보유 수량만 전달한다. 화면은 입력 초안을 로컬 상태로 보관하고, 제목·저자 길이·필수값·분류·0 이상의 정수 수량을 검증한다. MSW도 같은 정책을 HTTP 경계에서 다시 검사한다.
- `usePostBook`은 성공 뒤 `['Lib', 'Book', 'GetBookList']` 접두어의 Query를 무효화한다. 이는 검색 조건·페이지별 캐시를 포함하며, 화면에서 목록 배열을 직접 수정하지 않는다. 등록 모달은 무효화가 끝난 뒤 닫힌다.
- 등록·수정의 반복이 아직 한 쌍뿐이므로 MES_FE의 공통 FormModal·useModalState·react-hook-form·Zod를 도입하지 않았다. 수정 구현 시 반복되는 상태·검증·확인 흐름을 비교해 공통화 여부를 결정한다.
- 등록 모달은 저장 중 중복 제출·닫기를 막고 실패 시 입력값과 모달을 유지한다. Mock 데이터 변경은 새로고침 시 초기화된다.
- 브라우저에서 화면 입력 검증, 공백 제거된 등록 값, 성공 후 5건에서 6건으로 갱신되는 목록, MSW의 빈 제목·잘못된 분류·음수 수량 거부를 확인했다. 실제 서버의 권한·동시성·영속성 검증은 대체하지 않는다.

### 작업계획서 상태 변경 제안

- BOOK-01 도서 등록: 구현·검증 완료로 기록 가능하다.
- COMM-10의 도서 등록 후 목록 자동 갱신 완료 조건: 구현·검증 완료로 기록 가능하다. 다른 업무의 변경 캐시 정책은 별도 범위다.
- 당시 BOOK-02·03·05는 미착수였으며, BOOK-02는 §25에서 구현했다. BOOK-03·05는 미착수다. 스프레드시트는 직접 수정하지 않았다.

## 25. 도서 수정과 업무 규칙 검증

- 2026-10-18: `POST /v2/Lib/Book/Update/Update`를 MSW → HttpClient → `BookRepository.patchBook` → `BookService.usePatchBook` → 목록 행의 수정 모달에 연결했다. `patch`는 부분 수정 역할 이름이며 실제 HTTP 메서드는 MES 규약대로 POST다.
- 등록과 수정은 제목·저자·분류·보유 수량 입력, 화면 검증, 저장 중 잠금, 실패 시 입력 유지, 목록 Query 무효화가 반복된다. 두 모달의 구현을 나란히 둬 공통 FormModal·폼 상태·검증 추출이 실제로 필요한지 다음 단계에서 비교한다.
- MSW는 목록의 가용 수량과 수정 제한에 같은 `getBookOutstandingQuantity` 순수 함수를 사용한다. 미반납·미취소 대출 수량보다 총 보유 수량을 낮추는 요청은 거부한다. 이 규칙을 화면의 최소 수량 안내만으로 보장하지 않고 HTTP 경계에서 다시 검증하는 이유를 확인한다.
- 수정 성공 후 목록 Query 접두어를 무효화해 검색 조건·페이지별 활성 목록을 다시 조회한다. 화면은 행 데이터를 직접 바꾸지 않는다.
- 브라우저에서 수정 성공과 목록 갱신, 도서 2의 미반납 2권보다 작은 수량 거부, 실패 시 모달·입력 유지, 없는 ID·형식 오류의 API 실패 응답을 확인했다. 실제 BE의 동시 수정·권한·영속성 보장은 후속 범위다.

### 작업계획서 상태 변경 제안

- BOOK-02 도서 수정: 구현·검증 완료로 기록 가능하다.
- BOOK-03 삭제와 BOOK-05 사용자 지정 정렬은 미착수다. 스프레드시트는 직접 수정하지 않았다.

## 26. 도서 논리 삭제와 대출 이력 보존

- 2026-10-18: `POST /v2/Lib/Book/Delete/Update`를 MSW → HttpClient → `BookRepository.deleteBook` → `BookService.useDeleteBook` → 목록 행의 삭제 확인 모달에 연결했다. HttpClient의 `delete`는 역할 이름이며 실제 HTTP 메서드는 MES 규약대로 POST다.
- 삭제는 `isDeleted: true`로 변경하는 논리 삭제다. 목록은 기존처럼 삭제 도서를 제외하지만, Mock 배열과 대출 이력은 보존한다.
- 확인 모달은 현재 대출 중인 수량을 안내하고 삭제 버튼을 비활성화한다. 이 UI는 안내일 뿐이며, MSW도 같은 미반납·미취소 대출 수량을 검사해 `BOOK_HAS_OUTSTANDING_LOANS` 오류로 거부한다.
- 성공 후 목록 Query 접두어를 무효화한다. 삭제로 현재 페이지가 비어도 기존 목록 페이지의 범위 보정 흐름이 새 `totalRecords`를 기준으로 마지막 페이지로 이동한다.

### 작업계획서 상태 변경 제안

- BOOK-03 도서 삭제: 구현·검증 완료로 기록 가능하다.
- BOOK-05 사용자 지정 정렬은 미착수다. 스프레드시트는 직접 수정하지 않았다.

## 27. 도서 목록 사용자 지정 정렬

- 2026-10-18: MES_FE의 `useTableState`처럼 정렬 상태는 도서 목록 페이지의 로컬 state로 관리한다. 공통 Table과 `useTableState`는 회원 목록 등에서 같은 책임이 반복된 뒤 도입 여부를 결정한다.
- MUI `TableSortLabel`의 클릭은 제목·저자·분류·보유 수량·가용 수량을 `없음 → ASC → DESC → 없음` 순서로 바꾼다. 변경 시 첫 페이지로 이동하며, 새 검색·초기화는 MES의 `submit`처럼 정렬을 해제한다.
- 요청은 MES 공통 `sortings` 계약의 `{ columName, typeSorting }` 배열을 사용한다. Query key에는 요청 본문 전체가 들어가므로 정렬 조건별 목록 캐시는 분리된다.
- MSW는 계산된 가용 수량까지 포함한 목록 DTO를 정렬한 뒤 페이징한다. 동률은 ID 오름차순으로 고정해 페이지 사이의 순서가 흔들리지 않게 한다. 허용하지 않은 정렬 필드·방향·중복 열은 `INVALID_BOOK_LIST_REQUEST`로 거부한다.

### 작업계획서 상태 변경 제안

- BOOK-05 사용자 지정 정렬: 구현·검증 완료로 기록 가능하다.
- BOOK-07 페이징: 정렬 연동까지 확인되면 완료로 기록 가능하다. 스프레드시트는 직접 수정하지 않았다.
