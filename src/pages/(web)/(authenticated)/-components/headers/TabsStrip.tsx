import MenuCard from '@/src/components/menus/MenuCard';
import Divider from '@/src/components/ui/dividers/Divider';
import Icon from '@/src/components/ui/icons/Icon';
import ListItemIcon from '@/src/components/ui/lists/ListItemIcon';
import MenuItem from '@/src/components/ui/menus/MenuItem';
import Tabs from '@/src/components/ui/tabs/Tabs';
import TabStrip from '@/src/pages/(web)/(authenticated)/-components/headers/TabStrip';
import usePageHistoryStore from '@/src/stores/common/pageHistoryStore';
import { cn } from '@/src/utils/common/cn';
import {
	DndContext,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useLocation, useNavigate, useRouter } from '@tanstack/react-router';
import { useMemo, useState, type SyntheticEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';

const toFullPath = (item: { path: string; queryString: string }): string => {
	return item.queryString ? `${item.path}?${item.queryString}` : item.path;
};

interface IContextMenuState {
	path: string;
	x: number;
	y: number;
}

const TabsStrip = () => {
	// TODO: 다국어 기반 도입 후 MES처럼 useTranslation으로 제목과 메뉴를 번역합니다.

	const { pathname: locationPath } = useLocation();
	// 이력에 저장한 경로와 비교할 때 끝의 / 차이를 제거합니다.
	const pathname = locationPath.replace(/\/+$/, '') || '/';

	const navigate = useNavigate();
	const router = useRouter();

	const { items, removeItem, removeOthers, removeRight, reorderItems, clearItems } =
		usePageHistoryStore(
			useShallow(s => ({
				items: s.items,
				removeItem: s.removeItem,
				removeOthers: s.removeOthers,
				removeRight: s.removeRight,
				reorderItems: s.reorderItems,
				clearItems: s.clearItems,
			})),
		);

	const activeItem = useMemo(
		() => items.find(i => i.path === pathname) ?? null,
		[items, pathname],
	);

	const [menu, setMenu] = useState<IContextMenuState | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;

		const from = items.findIndex(i => i.path === active.id);
		const to = items.findIndex(i => i.path === over.id);
		if (from === -1 || to === -1) return;

		reorderItems(from, to); // 실제 Store의 배열 순서를 변경
	};

	const handleTabChange = (_: SyntheticEvent, value: string) => {
		const item = items.find(i => i.path === value);
		navigate({ to: (item ? toFullPath(item) : value) as string });
	};

	// TODO: 대시보드 도입 후 탭 닫기의 기본 이동 경로 /를 /dashboard로 변경합니다.
	const handleClose = (path: string) => {
		const { nextItem, wasActive } = removeItem({ path, currentPath: pathname });
		if (!wasActive) return;

		navigate({
			to: (nextItem ? toFullPath(nextItem) : '/') as string,
		});
	};

	const handleClearAll = () => {
		clearItems();
		navigate({ to: '/' });
	};

	const handleTabContextMenu = (path: string, x: number, y: number) => {
		if (menu) {
			setMenu(null);
			return;
		}
		setMenu({ path, x, y });
	};

	const handleMenuClose = () => setMenu(null);
	const handleMenuContextMenu = (event: SyntheticEvent) => {
		event.preventDefault();
		setMenu(null);
	};

	const handleCloseCurrent = () => {
		if (!menu) return;
		handleClose(menu.path);
		setMenu(null);
	};

	const handleCloseOthers = () => {
		if (!menu) return;
		const { nextItem, wasActive } = removeOthers(menu.path, pathname);
		if (wasActive) navigate({ to: (nextItem ? toFullPath(nextItem) : '/') as string });
		setMenu(null);
	};

	const handleCloseRight = () => {
		if (!menu) return;
		const { nextItem, wasActive } = removeRight(menu.path, pathname);
		if (wasActive) navigate({ to: (nextItem ? toFullPath(nextItem) : '/') as string });
		setMenu(null);
	};

	const handleCloseAllMenu = () => {
		handleClearAll();
		setMenu(null);
	};

	const menuIdx = menu ? items.findIndex(i => i.path === menu.path) : -1;
	const isLastTab = menuIdx !== -1 && menuIdx === items.length - 1;
	const menuItem = menuIdx !== -1 ? items[menuIdx] : null;

	if (items.length === 0) return null;

	return (
		<>
			{/* DndContext: 드래그 기능을 사용하는 영역 */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={items.map(item => item.path)}
					strategy={horizontalListSortingStrategy}
				>
					<Tabs
						value={activeItem?.path ?? false}
						onChange={handleTabChange}
						variant='scrollable'
						scrollButtons
						classes={{
							root: cn(
								'size-full min-h-0 translate-y-px pt-1',
								'[&_.Mui-disabled]:opacity-10',
							),
							list: cn('h-full px-3'),
							scrollButtons: cn('-translate-y-px'),
							indicator: cn('hidden'),
						}}
					>
						{items.map(item => (
							<TabStrip
								key={item.path}
								id={item.path}
								value={item.path}
								label={item.title}
								onMouseEnter={() =>
									router.preloadRoute({ to: item.path as string })
								}
								onContextMenu={handleTabContextMenu}
							/>
						))}
					</Tabs>
				</SortableContext>
			</DndContext>

			<MenuCard
				header={menuItem ? menuItem.title : undefined}
				open={menu !== null}
				onClose={handleMenuClose}
				onContextMenu={handleMenuContextMenu}
				anchorReference='anchorPosition'
				anchorPosition={menu ? { top: menu.y, left: menu.x } : undefined}
			>
				<MenuItem onClick={handleCloseCurrent}>
					<ListItemIcon children={<Icon icon='close' fontSize='small' />} />
					현재 탭 닫기
				</MenuItem>
				<MenuItem onClick={handleCloseOthers} disabled={items.length <= 1}>
					<ListItemIcon children={<Icon icon='close' fontSize='small' />} />
					다른 탭 닫기
				</MenuItem>
				<MenuItem onClick={handleCloseRight} disabled={isLastTab}>
					<ListItemIcon children={<Icon icon='navigateNext' fontSize='small' />} />
					오른쪽 탭 닫기
				</MenuItem>
				<Divider />
				<MenuItem onClick={handleCloseAllMenu}>
					<ListItemIcon children={<Icon icon='deleteAll' fontSize='small' />} />
					모든 탭 닫기
				</MenuItem>
			</MenuCard>
		</>
	);
};

export default TabsStrip;
