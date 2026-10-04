import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/src/index.css';
import App from '@/src/App';
import MswProvider from '@/src/contexts/MswProvider';

// MswProvider가 환경 설정을 읽고, Mock 준비 후 하위 화면을 렌더링합니다.
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<MswProvider>
			<App />
		</MswProvider>
	</StrictMode>,
);
