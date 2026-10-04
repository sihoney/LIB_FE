import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Vite 설정은 Node에서 실행되므로 loadEnv로 환경 파일을 읽습니다.
	const env = loadEnv(mode, process.cwd(), 'VITE_');

	// ------- port 검증 -------
	const port = Number(env.VITE_DEV_PORT ?? '3301');
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error('VITE_DEV_PORT는 1~65535 사이의 정수여야 합니다.');
	}
	return {
		plugins: [react()],
		resolve: {
			alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
		},
		server: { port, strictPort: true },
	};
});
