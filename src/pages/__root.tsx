import NotFoundComponent from '@/src/pages/-routeComponents/NotFoundComponent';
import { createRootRoute, Outlet } from '@tanstack/react-router';

// 루트는 화면 연결과 없는 경로 처리를 담당하고, 웹 테마는 (web)에서 적용합니다.
const Component = () => <Outlet />;

export const Route = createRootRoute({
	component: Component,
	notFoundComponent: NotFoundComponent,
});
