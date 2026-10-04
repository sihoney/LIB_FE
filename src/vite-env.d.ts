// import/export를 추가하지 않아야 Vite 전역 타입을 확장합니다.
// 환경변수 이름과 타입 선언. 값을 설정하는 파일은 아님
interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly VITE_DEV_PORT?: string;
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_ENABLE_MSW?: string;
}
