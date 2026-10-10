import { createFileRoute, Outlet } from '@tanstack/react-router';

// TODO: 공통 레이아웃 단계에서 MES처럼 Header·SidebarMenu와 본문을 조립합니다.
const Component = () => <Outlet />;

export const Route = createFileRoute('/(web)/(authenticated)')({
	// TODO: 인증 기반 구현 후 MES의 guardAuth('WEB')를 beforeLoad에 연결합니다.
	// 현재는 라우트 구조만 준비한 상태이며, 이 영역의 접근을 제한하지 않습니다.
	component: Component,
});
