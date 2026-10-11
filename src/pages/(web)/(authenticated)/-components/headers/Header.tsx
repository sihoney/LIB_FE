import Container from '@/src/components/ui/containers/Container';
import TabsStrip from '@/src/pages/(web)/(authenticated)/-components/headers/TabsStrip';
import { cn } from '@/src/utils/common/cn';

const Header = () => (
	<Container
		component='header'
		className={cn(
			'h-header-web sticky inset-x-0 top-0 z-10 flex w-full items-center justify-between',
			'bg-surface border-divider border-b backdrop-blur-sm',
		)}
	>
		<TabsStrip />
	</Container>
);

export default Header;
