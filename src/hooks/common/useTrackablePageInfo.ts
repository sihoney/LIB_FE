import { useLocation, useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';

interface ITrackablePageInfo {
	path: string;
	title: string;
	queryString: string;
	routeTemplate?: string;
	discardOnLeave?: boolean;
}

const getBasePath = (fullPath: string): string => {
	const [pathOnly] = fullPath.split('?');
	const trimmed = pathOnly.replace(/\/+$/, '');
	return trimmed || '/';
};

// TODO: 대시보드와 APP_CONFIGS 도입 후 MES의 WEB.MAIN_PATH를 연결합니다.
const WEB_MAIN_PATH = '/';

// - 현재 페이지에서 방문 탭에 기록할 정보를 추출하는 커스텀 훅
// - 훅이 직접 Store에 저장하지는 X
// - 기록할 페이지라면 정보 객체를, 제외할 페이지라면 null를 반환
export const useTrackablePageInfo = (): ITrackablePageInfo | null => {
	const matches = useRouterState({ select: s => s.matches });
	const { pathname, searchStr } = useLocation();
	// - useRouterState: 라우터의 전체 상태 중 필요한 정보 (어떤 라우터가 연결되었는지)
	// - useLocation: 현재 URL에 관한 정보 (현재 주소가 무엇인지)

	return useMemo(() => {
		// 제외 조건 확인 및 정보 객체 생성

		// [1] 기록하지 않을 페이지 제외
		if (matches.length === 0) return null; // [1-1] 연결된 라우트가 없는 경우

		// [1-2] 비인증 영역이 있다면 제외
		// '/(unauthenticated)' 경로 제외
		const isUnauthenticated = matches.some(m => m.id.includes('(unauthenticated)'));
		if (isUnauthenticated) return null;

		const leaf = matches[matches.length - 1];

		// [2] 안쪽 라우트의 경로(leaf.pathname)가 현재 URL 경로(pathname)와 일치하는지 확인,
		// 		홈(/)도 제외
		const leafPath = getBasePath(leaf.pathname);
		if (leafPath !== getBasePath(pathname) || leafPath === '/') return null;

		// [3] 메인 화면과 제목이 없는 페이지 제외
		// 현재 임시 홈 경로 제외
		if (leafPath === WEB_MAIN_PATH) return null;

		const title = leaf.staticData?.title;
		if (!title) return null;

		// [4] query string, routeTemplate
		const queryString = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr;
		const routeTemplate = getBasePath(leaf.fullPath);
		// routeTemplate: 실제 방문 주소 X, 라우트의 경로 패턴 (예: '/books/$bookId')
		// - 방문 이력 Store는 이 패턴을 이용, 같은 종료의 상세 페이지를 하나의 탭으로 묶음

		// [5] 페이지를 떠날 때 이력을 제거할지도 읽어 전달
		const discardOnLeave = leaf.staticData?.pageBehaviorOptions?.discardOnLeave;

		return {
			path: leafPath,
			title,
			queryString,
			routeTemplate,
			discardOnLeave,
		};
	}, [matches, pathname, searchStr]);
};

// 최종 반환값 예시
// {
// 		path: '/dev/notices',
// 		title: '테스트용 공지글',
// 		queryString: '',
// 		routeTemplate: '/dev/notices',
// 		discardOnLeave: undefined,
// }
