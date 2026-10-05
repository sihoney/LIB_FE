import { ENV_BASE_URL } from '@/src/consts/common/envKeys';
import ErrorComponent from '@/src/pages/-routeComponents/ErrorComponent';
import { routeTree } from '@/src/routeTree.gen';
import { createRouter, RouterProvider as TanStackRouterProvider } from '@tanstack/react-router';

const router = createRouter({
	routeTree,
	basepath: ENV_BASE_URL || '/',
	notFoundMode: 'root',
	defaultErrorComponent: ErrorComponent,
	defaultPreload: 'intent',
	defaultPreloadStaleTime: 0,
	defaultPendingMs: 0,
	defaultPendingMinMs: 500,
	scrollRestoration: true,
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const RouterProvider = () => <TanStackRouterProvider router={router} />;

export default RouterProvider;
