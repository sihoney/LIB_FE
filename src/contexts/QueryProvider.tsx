import {
	QueryClient,
	QueryClientProvider,
	type QueryClientProviderProps,
} from '@tanstack/react-query';

// MES처럼 인스턴스를 모듈에서 한 번 생성합니다. 영속 캐시는 아직 도입하지 않습니다.
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000, // 30초
			gcTime: 5 * 60_000, // 5분
			refetchOnWindowFocus: false, // 창 포커스 시 재조회
			refetchOnMount: false, // 마운트 시 재조회
			refetchOnReconnect: false, // 재연결 시 재조회
			retry: false, // 재시도
		},
		mutations: { retry: false },
	},
});

const QueryProvider = ({ children }: Omit<QueryClientProviderProps, 'client'>) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default QueryProvider;
