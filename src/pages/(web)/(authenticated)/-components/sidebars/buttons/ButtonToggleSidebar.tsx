import useSidebarStore from '@/src/stores/common/sidebarStore';

const ButtonToggleSidebar = () => {
	const open = useSidebarStore(state => state.open);
	const toggle = useSidebarStore(state => state.toggle);

	// TODO: hover 작업 시 MES의 ButtonIcon·Icon 및 사이드바 바깥 배치·표시 조건을 적용합니다.
	// 현재는 기존 버튼 모양과 항상 표시되는 동작을 유지합니다.
	return (
		<button
			type='button'
			aria-label={open ? '메뉴 접기' : '메뉴 펼치기'}
			aria-expanded={open}
			onClick={toggle}
			className='border-divider border-r p-2'
		>
			{open ? '메뉴 접기' : '펼치기'}
		</button>
	);
};

export default ButtonToggleSidebar;
