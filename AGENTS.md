# LIB_FE 작업 규칙

## 목적과 현재 단계

- 도서관 통합 관리 시스템을 구현하며 MES_FE와 MES_BE의 설계 이유를 학습한다.
- LIB_FE를 MSW·Faker 기반으로 먼저 구현하고, LIB_BE는 별도 저장소에서 후속 구현한다.
- 현재는 React·TypeScript·Vite·SWC, 코드 검사·포맷, 경로 별칭·환경변수와 MSW·Query·Router 및 테스트 공지글 조회 기반이 구현되어 있다.
- 상세 설계와 도입 상태는 [아키텍처 문서](docs/architecture.md)를 기준으로 한다. 도구·계층을 실제 도입할 때 상태를 갱신한다.

## 작업 방식

- 작업 전에 무엇을 왜 변경하는지와 대상 파일을 한국어로 설명한다.
- 사용자가 직접 작성한 변경사항과 학습용 주석을 확인하고 보존한다.
- MES의 책임 분리와 명명 방식을 참고하되, 빈 폴더·미사용 기반 클래스·의존성을 미리 대량 생성하지 않는다.
- 공통 기반 확인을 위해 테스트 공지글(`modules/dev`)을 먼저 사용한다. 이후 도서 기능에서 시작해 회원·대출 기능의 반복과 필요를 확인한 뒤 추상화한다. 순서는 상세 문서의 단계적 도입 기준을 따른다.
- 현재 단계와 무관한 MES 업무 기능·전용 인프라를 함께 가져오지 않는다.

## 파일 배치와 의존 방향

- 목표 흐름: Page/업무 Component → Service → Repository → HttpClient.
- `pages/`는 라우트와 화면 조립, `components/ui/`는 업무 지식 없는 UI, Service는 Query 훅·캐시, Repository는 HTTP 요청을 담당한다.
- 화면에서 Axios·Repository·Mock 저장소를 직접 호출하지 않는다. 순수 UI는 업무 Service·Store·라우터에 의존하지 않는다.
- 하위 계층은 상위 계층을 import하지 않는다. 공통 코드는 특정 업무 모듈에 의존하지 않는다.
- `common/`에는 여러 영역이 공유하는 코드, `modules/lib/`에는 도서·회원·대출 업무, `modules/sys/`에는 인증·접근 제어를 둔다.
- 회원 업무 정보와 로그인 계정·권한을 구분한다. 회원 업무 코드는 `lib`, 인증 코드는 `sys`가 담당한다.
- 페이지 전용 UI는 `pages/**/-components/`, 업무 테이블은 `components/tables/modules/{module}/`에 둔다.
- React 조합 로직은 `hooks/`, 순수 함수는 `utils/`, 상수는 `consts/`에 둔다. `consts`가 `utils`에 의존하지 않게 한다.
- 프로젝트 내부 import는 `@/src/...`를 사용한다. `@`는 프로젝트 루트다.

## 상태와 환경 설정

- 도입 후 서버 데이터는 TanStack Query, 공유 UI 상태는 Zustand, 폼은 react-hook-form·Zod, 공유 가능한 검색 조건은 TanStack Router로 관리한다.
- 서버 데이터 전체를 Zustand나 로컬 state에 복제하지 않는다. 편집 중 폼 초안은 별도로 관리할 수 있다.
- 한 컴포넌트에서만 쓰는 일시적 UI 상태는 로컬 state를 사용한다.
- 브라우저 환경값은 `src/consts/common/envKeys.ts`의 `ENV_*` 상수로 읽는다. Node용 Vite 설정은 `loadEnv`를 사용한다.
- `VITE_` 변수에는 비밀값을 넣지 않는다. 개인 환경설정은 Git에서 제외되는 `.env.*.local`에 둔다.

## MSW·API 계약

- MSW는 실제 HTTP 요청 경계에서 응답한다. 화면·Service·일반 Repository가 Mock 데이터에 직접 의존하지 않게 한다.
- Faker는 초기 데이터 생성에 사용하고, 요청마다 업무 데이터를 새로 만들지 않는다.
- 실제 API 전환 시 같은 화면·Service·Repository와 요청·응답 계약을 유지한다.
- Mock의 업무 규칙 검증은 실제 서버 권한·트랜잭션·동시성 보장을 대체하지 않는다.

## 검증과 커밋

- `pnpm lint`: 타입·Oxlint·포맷 검사. 자동 수정하지 않는다.
- `pnpm format`: 포맷 자동 수정. 사용자 변경이 섞여 있으면 대상 파일만 지정해 실행한다.
- 코드·설정 변경은 `pnpm lint`와 필요한 빌드·동작 검증을 수행한다. 문서만 변경하면 문서 포맷·링크·내용 검토를 수행한다.
- PowerShell 실행 정책으로 `pnpm.ps1`이 차단되면 `pnpm.cmd`를 사용한다.
- 작업 단위가 완료되고 검증되면 커밋 시점을 제안한다. 제목·본문에 변경 목적·내용·검증 결과를 기록한다.
- 실제 커밋은 사용자의 요청이 있을 때 수행한다. push는 별도 요청이 있을 때 수행한다.
- 실패하거나 실행하지 않은 검증을 통과로 기록하지 않는다. 기존 문제는 이번 변경과 구분해 설명한다.
