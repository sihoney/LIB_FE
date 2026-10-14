import Container from '@/src/components/ui/containers/Container';
import SelectSystem from '@/src/pages/(web)/(authenticated)/-components/headers/SelectSystem';
import useSidebarStore from '@/src/stores/common/sidebarStore';
import { cn } from '@/src/utils/common/cn';
import { Link } from '@tanstack/react-router';

const BoxLogo = () => {
	const open = useSidebarStore(state => state.open);

	return (
		<Container
			className={cn('border-divider flex shrink-0 items-center border-r', {
				'h-header-web justify-between gap-2 px-4': open,
				'flex-col gap-2 px-2 pb-2': !open,
			})}
		>
			<Link
				to='/'
				aria-label='도서관 통합 관리 시스템 시작 화면'
				className='h-header-web text-primary flex shrink-0 items-center justify-center text-xl font-bold'
			>
				{open ? 'LIBRARY' : 'LIB'}
			</Link>
			<SelectSystem />
		</Container>
	);
};

export default BoxLogo;
