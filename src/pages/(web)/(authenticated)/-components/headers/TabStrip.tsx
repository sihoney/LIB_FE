import Box from '@/src/components/ui/containers/Box';
import IconTabCorner from '@/src/components/ui/icons/IconTabCorner';
import IconTabDivider from '@/src/components/ui/icons/IconTabDivider';
import type { ITabProps } from '@/src/components/ui/tabs/Tab';
import Tab from '@/src/components/ui/tabs/Tab';
import Typography from '@/src/components/ui/typographys/Typography';
import { cn } from '@/src/utils/common/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type CSSProperties, type MouseEvent } from 'react';

interface ITabSortableProps extends Omit<ITabProps, 'label' | 'onContextMenu'> {
	id: string;
	label: string;
	onContextMenu: (id: string, x: number, y: number) => void;
}

// "내 선택 여부"는 MUI Tabs 가 주입하는 selected prop 으로 판정하고(Tab 에 다시 forward 필수),
// 이웃 탭 의존 스타일(다음 탭 선택/hover, 마지막 탭)만 CSS 선택자로 처리한다.
// 구분선은 "내가 선택/hover" 이거나 ":has(+ 다음탭이 선택/hover)" 이거나 마지막일 때 숨긴다.
const TabStrip = ({
	id,
	label,
	onContextMenu,
	className,
	selected,
	...rest
}: ITabSortableProps) => {
	const {
		attributes, // 접근성 등에 필요한 HTML 속성
		listeners, // 드래그 시작을 감지하는 이벤트 핸들러
		setNodeRef, // 실제 탭 DOM 요소를 라이브러리에 연결
		transform, // 화면에서 이동시킬 위치 정보
		transition, // 위치 변경 애니메이션에 사용할 CSS 값
		isDragging, // 이 탭을 현재 드래그 중인지 여부
	} = useSortable({ id });

	const style: CSSProperties = {
		transform: CSS.Translate.toString(transform),
		// CSS.Translate.toString(transform): 위치 정보를 CSS transform에 사용할 문자열로 바꾸는 유틸
		transition,
		opacity: isDragging ? 0.8 : 1,
		zIndex: isDragging ? 10 : undefined,
		cursor: isDragging ? 'grabbing' : '',
	};

	const handleContextMenu = (e: MouseEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();

		onContextMenu(id, e.clientX, e.clientY);
	};

	// 선택 탭 외곽선 — 코너 곡선 stroke 를 헤더 border 색으로 켠다
	const cornerStyle = selected
		? ({ '--tab-corner-stroke': 'var(--mui-palette-divider)' } as CSSProperties)
		: undefined;

	return (
		<Tab
			{...rest}
			{...attributes}
			{...listeners}
			ref={setNodeRef}
			style={style}
			selected={selected}
			draggable={false}
			disableRipple={true}
			onContextMenu={handleContextMenu}
			className={cn(
				'group',
				'text-on-surface-secondary relative -mx-3 min-h-0 min-w-50! flex-row gap-0 overflow-visible p-0 transition-colors duration-300',
				{ 'z-10': selected },
				className,
			)}
			label={
				<>
					<IconTabCorner
						style={cornerStyle}
						className={cn(
							'size-4 self-end overflow-visible text-transparent',
							'transition-colors duration-300 group-has-[+_.Mui-selected]:z-11',
							{ 'text-body z-1': selected },
						)}
					/>
					<Box
						className={cn(
							'flex h-full flex-1 items-center rounded-t-xl border border-b-0 border-transparent transition-colors duration-300',
							{ 'bg-body border-divider': selected },
						)}
					>
						<Box
							className={cn(
								'flex h-[calc(100%-0.4rem)] flex-1 items-center justify-center self-start rounded-xl px-4',
								{
									'transition-colors duration-300 group-hover:bg-(--mui-palette-action-hover)':
										!selected,
								},
							)}
						>
							<Typography
								className={cn('text-sm font-medium', { 'font-bold': selected })}
								children={label}
							/>
						</Box>
					</Box>
					<IconTabCorner
						style={cornerStyle}
						className={cn(
							'size-4 -scale-x-100 self-end overflow-visible text-transparent',
							'transition-colors duration-300',
							{ 'text-body z-1': selected },
						)}
					/>
					<IconTabDivider
						className={cn(
							'text-on-surface-disabled/60 absolute top-[calc(50%-0.2rem)] right-0.5 size-5 -translate-y-1/2 stroke-3 transition-opacity duration-500 ease-out',
							'group-last:opacity-0 group-hover:opacity-0',
							'group-has-[+_*:hover]:opacity-0 group-has-[+_.Mui-selected]:opacity-0',
							{ 'opacity-0': selected },
						)}
					/>
				</>
			}
		/>
	);
};

export default TabStrip;
