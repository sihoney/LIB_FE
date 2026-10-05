import App from '@/src/App';
import NotFoundComponent from '@/src/pages/-routeComponents/NotFoundComponent';
import { createRootRoute, Outlet } from '@tanstack/react-router';

const Component = () => (
	<App>
		<Outlet />
	</App>
);

export const Route = createRootRoute({
	component: Component,
	notFoundComponent: NotFoundComponent,
});
