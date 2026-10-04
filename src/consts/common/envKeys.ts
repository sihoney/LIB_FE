// 브라우저용 환경변수는 이 파일에서만 읽습니다. 모든 VITE_ 값은 문자열입니다.
// 문자열 환경값을 읽고 검증한 뒤 ENV_* 상수로 제공
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').trim();
const enableMsw = import.meta.env.VITE_ENABLE_MSW ?? 'false';

if (!apiBaseUrl) {
	throw new Error('VITE_API_BASE_URL은 빈 값일 수 없습니다.');
}
if (enableMsw !== 'true' && enableMsw !== 'false') {
	throw new Error('VITE_ENABLE_MSW는 true 또는 false여야 합니다.');
}

export const ENV_DEV_MODE = import.meta.env.DEV;
export const ENV_API_BASE_URL = apiBaseUrl;
export const ENV_ENABLE_MSW = enableMsw === 'true';
export const ENV_BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');
