import { linkOptions } from '@tanstack/react-router';

// TODO: 메뉴·시스템·권한 API 구현 후 MES의 useMenuTree 데이터 흐름으로 교체합니다.
// 현재는 공통 레이아웃 검증을 위한 임시 메뉴입니다.
const menus = [
	{
		menuCode: 'books',
		menuName: '도서 목록',
		shortName: '도서',
		link: linkOptions({ to: '/lib/book' }),
	},
	{
		menuCode: 'home',
		menuName: 'LIB 시작 화면',
		shortName: '홈',
		link: linkOptions({ to: '/' }),
	},
	{
		menuCode: 'notices',
		menuName: '공지글',
		shortName: '공지',
		link: linkOptions({
			to: '/dev/notices',
		}),
	},
];

export type SidebarMenuItem = (typeof menus)[number];

export const useMenuTree = () => ({ data: menus });
