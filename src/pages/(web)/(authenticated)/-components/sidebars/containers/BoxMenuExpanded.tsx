import Container from '@/src/components/ui/containers/Container';
import type { SidebarMenuItem } from '@/src/hooks/common/useMenuTree';
import { Link } from '@tanstack/react-router';

interface IProps {
	data: SidebarMenuItem[];
	collapsed?: boolean;
}

const BoxMenuExpanded = ({ data, collapsed = false }: IProps) => (
	<Container
		component='nav'
		aria-label='기본 메뉴'
		className='border-divider min-h-0 flex-1 overflow-x-hidden overflow-y-auto border-r p-2'
	>
		<div className='flex flex-col gap-2'>
			{data.map(menu => (
				<Link
					key={menu.menuCode}
					{...menu.link}
					activeOptions={{ exact: true }}
					activeProps={{ className: 'bg-(--mui-palette-action-selected) font-semibold' }}
					aria-label={menu.menuName}
					title={collapsed ? menu.menuName : undefined}
					className='hover:bg-(--mui-palette-action-hover) rounded-md px-2 py-3'
				>
					{collapsed ? menu.shortName : menu.menuName}
				</Link>
			))}
		</div>
	</Container>
);

export default BoxMenuExpanded;
