import App from '@/src/App';
import ThemeProvider from '@/src/contexts/ThemeProvider';
import webTheme from '@/src/contexts/themes/webTheme';
import { getThemeStore } from '@/src/stores/common/themeStore';
import NotFoundComponent from '@/src/pages/-routeComponents/NotFoundComponent';
import { createRootRoute, Outlet } from '@tanstack/react-router';

const Component = () => (
	<ThemeProvider theme={webTheme} store={getThemeStore()}>
		<App>
			<Outlet />
		</App>
	</ThemeProvider>
);

export const Route = createRootRoute({
	component: Component,
	notFoundComponent: NotFoundComponent,
});
