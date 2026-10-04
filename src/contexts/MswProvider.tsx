import { ENV_BASE_URL, ENV_ENABLE_MSW } from '@/src/consts/common/envKeys';
import AppLoading from '@/src/components/loadings/AppLoading';
import { Suspense, use, type ReactNode } from 'react';

// 렌더링마다 Promise를 만들면 대기를 반복하므로 모듈에서 한 번만 시작합니다.
const mockingEnabledPromise = ENV_ENABLE_MSW
	? import('@/src/mocks/browser').then(async ({ worker }) => {
			await worker.start({
				onUnhandledRequest: 'bypass',
				serviceWorker: { url: `${ENV_BASE_URL}/mockServiceWorker.js` },
			});
			// worker.start(): 브라우저 Service Worker 등록·활성화 및 Mock 처리 시작
			return worker;
		})
	: Promise.resolve(undefined);

// React가 Promise를 읽기 전 실패해도 미처리 rejection이 되지 않게 합니다.
// 원래 Promise는 여전히 rejected이므로 use()에서 오류가 발생하며 하위 화면은 렌더링되지 않습니다.
void mockingEnabledPromise.catch(() => undefined);

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		// 시작 중 교체되더라도 시작이 끝난 Worker를 정리합니다.
		void mockingEnabledPromise.then(worker => worker?.stop()).catch(() => undefined);
	});
}

interface IProps {
	children: ReactNode;
}

const MswProviderInner = ({ children }: IProps) => {
	use(mockingEnabledPromise);
	return children;
};

const MswProvider = ({ children }: IProps) => (
	<Suspense fallback={<AppLoading />}>
		<MswProviderInner>{children}</MswProviderInner>
	</Suspense>
);

export default MswProvider;
