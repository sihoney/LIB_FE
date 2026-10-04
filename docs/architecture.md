# LIB_FE 폴더 구조와 의존 규칙

## 1. 목적과 적용 상태

LIB_FE는 MES_FE의 구조를 참고하는 독립적인 도서관 프론트엔드다. MSW·Faker로 화면과 업무 흐름을 먼저 검증하고, 이후 별도 LIB_BE의 API로 연결한다. MES의 구조가 해결하는 문제를 이해하면서 필요한 공통화를 단계적으로 진행한다.

2026-10-04 기준:

| 상태      | 구성                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| 구현됨    | React 19, TypeScript 5.9, Vite 7, SWC, Oxlint, Prettier, LF 설정                |
| 구현됨    | 프로젝트 루트 `@` 별칭, 개발 환경값, `envKeys.ts`, 환경변수 타입                |
| 구현됨    | 앱 시작 흐름, MSW 준비 대기, LIB 시작 화면                                      |
| 도입 예정 | TanStack Router·Query, Axios, Faker, Zustand, react-hook-form·Zod, MUI·Tailwind |
| 도입 예정 | 공통 레이아웃, 인증, 도서·회원·대출 기능, Repository·Service                    |

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

| 예시 파일                                         | 책임                           |
| ------------------------------------------------- | ------------------------------ |
| `types/common/repository.ts`                      | 공통 요청·응답·페이징 계약     |
| `types/modules/lib/libBook.ts`                    | 도서 DTO                       |
| `schemas/modules/lib/libBook.ts`                  | 도서 입력 검증                 |
| `repositories/modules/lib/libBookRepository.ts`   | 도서 API 요청                  |
| `services/modules/lib/libBookService.ts`          | 도서 조회·변경 훅              |
| `components/tables/modules/lib/TableLibBooks.tsx` | 도서 목록 표시                 |
| `repositories/modules/sys/authRepository.ts`      | 로그인·인증 요청               |
| `consts/common/envKeys.ts`                        | 구현되어 있는 환경값 접근 지점 |

회원 프로필·탈퇴·대출 이력은 `lib` 업무다. 로그인 계정·인증 상태·역할은 `sys` 책임이다. 인증 Service가 도서·대출 Service를 역으로 호출하지 않는다. 권한에 따른 화면 조립과 사용자 변경 시 캐시 초기화는 상위 계층·조립 지점에서 연결한다.

공통 코드는 특정 업무 모듈을 import하지 않는다. 도메인 이름만 지워서 `common`으로 이동하지 않고, 실제로 여러 영역에서 같은 책임으로 쓰일 때 공통화한다. 모듈 간 공유는 식별자·작은 계약을 우선 사용한다.

## 5. 상태 소유권

| 상태                          | 도입할 도구           | 원칙                               |
| ----------------------------- | --------------------- | ---------------------------------- |
| 도서 목록·회원 정보·대출 기록 | TanStack Query        | 서버 데이터의 단일 조회 기준       |
| 사이드바·테마 등 공유 UI 상태 | Zustand               | 서버 목록을 복제하지 않음          |
| 등록·수정 폼 초안·입력 오류   | react-hook-form + Zod | 서버 원본과 편집 중 초안을 구분    |
| 공유·복원할 검색 조건·페이지  | TanStack Router       | URL 값과 요청 조건을 일관되게 변환 |
| 단일 화면의 모달 열림 등      | React 로컬 state·Hook | 공유 필요가 없으면 전역화하지 않음 |

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
- `ENV_ENABLE_MSW`가 true이면 `MswProvider`가 Worker를 시작하고 완료 후 하위 화면을 렌더링한다. false이면 Worker 모듈을 가져오지 않는다. 현재 업무 핸들러는 비어 있으며, 미처리 요청은 실제 네트워크로 통과한다.

## 7. 도서 조회 기능의 파일 연결 예시

아래 파일은 앞으로 기능을 구현할 때 생성한다.

1. `types/modules/lib/libBook.ts`: 도서 응답 타입 정의.
2. `repositories/modules/lib/libBookRepository.ts`: 공통 계약으로 도서 목록 요청.
3. `services/modules/lib/libBookService.ts`: 요청을 Query 훅으로 제공.
4. `services/services.ts`: HttpClient·Repository·Service 인스턴스 연결.
5. `mocks/repositories/modules/lib/libBookMockRepository.ts`: 요청과 일치하는 도서 Mock 응답.
6. `components/tables/modules/lib/TableLibBooks.tsx`: 전달받은 행을 테이블로 표시.
7. `pages/(web)/(authenticated)/lib/libBook/index.tsx`: 검색 조건·Service·테이블을 조립.

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

`main.tsx`는 `StrictMode → MswProvider → App` 순서로 구성한다.

- `MswProvider`는 모듈 범위의 Promise를 `use()`로 읽는다. 대기 중에는 `Suspense`가 `AppLoading`을 표시한다.
- MSW 활성화 조건은 MES와 동일하게 `ENV_ENABLE_MSW`다. 개발 모드에서는 `.env.development` 기본값이 true이며, production 기본값은 false다. 공개 배포에서는 활성화하지 않는다.
- Worker URL은 `ENV_BASE_URL`을 사용하여 하위 경로 배포에서도 올바르게 해석한다.
- MES와 동일하게 MSW 시작 실패를 처리하는 별도 최상위 오류 화면은 두지 않는다. Router 도입 시 MES의 `ErrorComponent`와 라우트 오류 처리 방식을 적용한다.
- Router의 오류 처리는 바깥에 있는 MswProvider의 시작 실패까지 처리하지 않는다.
- HMR 시 이전 Worker는 시작 완료 후 정리한다.
- `public/mockServiceWorker.js`는 생성 파일이다. MSW 버전 변경 시 `pnpm exec msw init public --save`로 갱신한다.
- 업무 API와 Faker, Query·Router·테마 Provider는 후속 단계에서 추가한다. 예제 이미지 파일은 현재 사용하지 않는다.

참고: [React use](https://react.dev/reference/react/use), [MSW worker.start](https://mswjs.io/api/setup-worker/start).
