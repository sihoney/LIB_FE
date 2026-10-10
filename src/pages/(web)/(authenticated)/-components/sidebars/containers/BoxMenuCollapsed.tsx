import type { SidebarMenuItem } from '@/src/hooks/common/useMenuTree';
import BoxMenuExpanded from '@/src/pages/(web)/(authenticated)/-components/sidebars/containers/BoxMenuExpanded';

interface IProps {
	data: SidebarMenuItem[];
}

const BoxMenuCollapsed = ({ data }: IProps) => <BoxMenuExpanded data={data} collapsed />;

export default BoxMenuCollapsed;
