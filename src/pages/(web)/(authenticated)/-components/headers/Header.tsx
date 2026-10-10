import Container from '@/src/components/ui/containers/Container';
import { cn } from '@/src/utils/common/cn';

const Header = () => (
	<Container
		component='header'
		className={cn(
			'h-header-web sticky inset-x-0 top-0 z-10 flex w-full items-center justify-between',
			'bg-surface border-divider border-b backdrop-blur-sm',
		)}
	>
		{/* TODO: 방문 이력 기반 구현 후 MES의 TabsStrip·TabStrip을 연결합니다. */}
	</Container>
);

export default Header;
