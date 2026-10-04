# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"plugins": ["react", "typescript", "oxc"],
	"options": {
		"typeAware": true
	},
	"rules": {
		"react/rules-of-hooks": "error",
		"react/only-export-components": ["warn", { "allowConstantExport": true }]
	}
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## LIB 개발 환경 설정

- 경로 별칭: `@`는 프로젝트 루트를 가리킵니다. 예: `@/src/App`.
- Vite의 `resolve.alias`와 TypeScript의 `paths`를 함께 설정합니다.
- `pnpm dev`는 기본적으로 `http://localhost:3301`에서 실행됩니다. 포트가 사용 중이면 다른 포트로 이동하지 않고 오류를 표시합니다.
- 개인 설정은 `.env.example`을 `.env.development.local`로 복사해 수정합니다. 개인 파일은 Git에서 제외합니다.
- 환경변수를 수정하면 개발 서버를 다시 시작해야 합니다.

| 변수              | 개발 기본값            | 미지정 시 기본값 | 용도                               |
| ----------------- | ---------------------- | ---------------- | ---------------------------------- |
| VITE_DEV_PORT     | 3301                   | 3301             | 개발 서버 포트 (1~65535 정수)      |
| VITE_API_BASE_URL | http://localhost:44301 | /api             | API 기준 주소                      |
| VITE_ENABLE_MSW   | true                   | false            | Mock 사용 설정 (true/false 문자열) |

브라우저 코드는 `src/consts/common/envKeys.ts`의 `ENV_*` 상수를 사용합니다. Node에서 실행되는 `vite.config.ts`는 `loadEnv`를 사용합니다. `src/vite-env.d.ts`는 변수명의 타입을 정의하며 실제 값 검증은 환경 설정 코드에서 수행합니다.

`pnpm build`는 기본 production 모드이므로 `.env.development`를 읽지 않습니다. 배포 환경에서는 API 주소를 주입하고, 기본 `/api`를 사용하려면 배포 서버에서 해당 경로를 연결해야 합니다. `VITE_` 값은 빌드에 포함되는 공개 설정으로 비밀값을 넣으면 안 됩니다.

현재는 MSW 활성화 값을 정의하는 단계이며, Worker·핸들러가 아직 없어 실제 Mock 응답은 제공하지 않습니다.
