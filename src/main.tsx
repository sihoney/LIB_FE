import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/src/index.css';
// 앱 시작 시 환경 설정을 검증, MSW 연결은 다음 단계에서 추가합니다.
import '@/src/consts/common/envKeys';
import App from '@/src/App';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
