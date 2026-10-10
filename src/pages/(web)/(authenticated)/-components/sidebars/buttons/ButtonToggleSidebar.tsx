import ButtonIcon from '@/src/components/ui/buttons/ButtonIcon';
import Icon from '@/src/components/ui/icons/Icon';
import useSidebarStore from '@/src/stores/common/sidebarStore';
import { cn } from '@/src/utils/common/cn';
import { useShallow } from 'zustand/react/shallow';

const ButtonToggleSidebar = () => {
	// TODO: 다국어 기반 도입 후 MES의 useTranslation으로 버튼 문구를 연결합니다.
	const { open, hovered, toggle } = useSidebarStore(
		useShallow(state => ({
			open: state.open,
			hovered: state.hovered,
			toggle: state.toggle,
		})),
	);
	// useShallow: Store에서 여러 값을 객체로 가져올 때,
	// 		값이 그대로라면 같은 선택 결과를 재사용하도록 돕는 Zustand 함수
	// 		여러 값을 한 번에 선택하면서 객체 참조를 안정적으로 유지하기 위해 `useShallow`를 사용

	return (
		<ButtonIcon
			onClick={toggle}
			size='small'
			aria-expanded={open}
			title={open ? '사이드바 접기' : '사이드바 펼치기'}
			aria-label={open ? '사이드바 접기' : '사이드바 펼치기'}
			className={cn(
				// 색상, 크기, 테두리
				'bg-surface border-divider text-on-surface-secondary h-30 w-8 border border-l-0 p-0',

				// 모서리 모양
				'rounded-l-none! rounded-r!',

				// 버튼 위치
				'absolute top-1/2 right-0.5 translate-x-full -translate-y-1/2',

				// 기본 숨김 상태, 전환 애니메이션
				'pointer-events-none opacity-0 transition duration-300',

				// 마우스를 올렸을 때의 색상
				'hover:bg-primary hover:text-on-primary hover:border-primary',

				// 키보드로 포커스했을 때 표시
				'focus-visible:opacity-100 focus-visible:pointer-events-auto',

				// 사이드바에 마우스가 있으면 표시
				{ 'pointer-events-auto opacity-100': hovered },
			)}
		>
			{/* size-6: 아이콘의 너비와 높이를 각각 spacing 6칸으로 지정합니다. */}
			<Icon icon={open ? 'chevronLeft' : 'chevronRight'} className={cn('size-6')} />
		</ButtonIcon>
	);
};

export default ButtonToggleSidebar;
