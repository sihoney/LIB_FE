import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/src/index.css';
import { ConfirmGuardProvider } from '@/src/contexts/ConfirmGuardProvider';
import MswProvider from '@/src/contexts/MswProvider';
import QueryProvider from '@/src/contexts/QueryProvider';
import RouterProvider from '@/src/contexts/RouterProvider';

// MswProvider가 환경 설정을 읽고, Mock 준비 후 하위 화면을 렌더링합니다.
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<MswProvider>
			<QueryProvider>
				<ConfirmGuardProvider>
					<RouterProvider />
				</ConfirmGuardProvider>
			</QueryProvider>
		</MswProvider>
	</StrictMode>,
);
