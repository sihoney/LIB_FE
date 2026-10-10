import ButtonToggleSidebar from '@/src/pages/(web)/(authenticated)/-components/sidebars/buttons/ButtonToggleSidebar';
import useSidebarStore from '@/src/stores/common/sidebarStore';
import Container from '@/src/components/ui/containers/Container';
import BoxAccount from '@/src/pages/(web)/(authenticated)/-components/sidebars/containers/BoxAccount';
import { cn } from '@/src/utils/common/cn';
import { useMenuTree } from '@/src/hooks/common/useMenuTree';
import BoxMenuExpanded from '@/src/pages/(web)/(authenticated)/-components/sidebars/containers/BoxMenuExpanded';
import BoxMenuCollapsed from '@/src/pages/(web)/(authenticated)/-components/sidebars/containers/BoxMenuCollapsed';

const SidebarMenu = () => {
	const open = useSidebarStore(state => state.open);
	const { data } = useMenuTree();

	return (
		<>
			{/* <1> 바깥쪽 Container: 넘치는 내용을 가리는 역할 */}
			<Container className={cn('size-full overflow-hidden')}>
				{/* <2> 안쪽 Container: 실제 메뉴의 크기와 배치를 정하는 역할 */}
				<Container
					component='section'
					className={cn('flex h-full flex-col')}
					style={{ width: open ? 220 : 80 }}
				>
					{/* [1] 로고 */}
					{/* TODO: MES의 BoxLogo와 시스템 선택 영역을 연결합니다. */}
					<Container className={cn('h-header-web border-divider shrink-0 border-r')} />

					{/* [2] 메뉴 목록 */}
					{open ? <BoxMenuExpanded data={data} /> : <BoxMenuCollapsed data={data} />}

					{/* [3] 계정 */}
					<BoxAccount />
				</Container>
			</Container>

			{/* [4] 사이드바 토글 버튼 */}
			{/* 토글 버튼은 클리핑 영역 밖에 두어 사이드바 경계 바깥에 표시합니다. */}
			<ButtonToggleSidebar />
		</>
	);
};

export default SidebarMenu;
