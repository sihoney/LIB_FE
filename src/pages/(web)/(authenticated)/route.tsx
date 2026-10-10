import Container from '@/src/components/ui/containers/Container';
import Header from '@/src/pages/(web)/(authenticated)/-components/headers/Header';
import SidebarMenu from '@/src/pages/(web)/(authenticated)/-components/sidebars/SidebarMenu';
import { cn } from '@/src/utils/common/cn';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useState } from 'react';

// grid-cols-[auto_minmax(0,1fr)]
// - [...] : Tailwind에서 CSS 값을 직접 지정하는 문법
// - _ : 공백
// - auto : 자식 요소의 크기를 반영하여 너비 결정
// - minmax(0,1fr) : 최소 너비는 0, 나머지 공간 사용
// 			최솟값을 0으로 명시하면 내용의 너비에 끌려가지 않고, 오른쪽 열이 주어진 공간을 맞춰 줄여들 수 있다.
// - fr : 남은 공간을 비율로 나누는 단위, 1fr은 남은 공간의 1/1을 의미,
// 			여기서는 1fr인 열이 하나이므로 남은 공간을 모두 받습니다.

// MES처럼 이 라우트에서 사이드바·헤더·본문을 조립합니다.
const Component = () => {
	// TODO: MES의 sidebarStore로 전환합니다. 현재는 부모·자식이 같은 open 값을 사용하도록 로컬 상태를 올립니다.
	const [open, setOpen] = useState(true);

	return (
		<Container
			component='section'
			className={cn('grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[1fr]')}
		>
			{/* [1] 좌측 영역 */}
			<Container
				component='article'
				className={cn(
					// 문자열 분리
					'bg-surface sticky top-0 left-0 z-10 h-dvh', // (1) 배경, 위치, 쌓임 순서, 높이
					'transition-[width] duration-200 ease-out', // (2) 너비 변경 애니메이션
				)}
				// 바깥 폭만 애니메이션하고, SidebarMenu 내부는 목표 폭으로 유지합니다.
				style={{ width: open ? 220 : 80 }}
			>
				<SidebarMenu open={open} onToggle={() => setOpen(previous => !previous)} />
			</Container>

			{/* [2] 우측 영역 */}
			<Container component='section' className={cn('grid grid-cols-1 grid-rows-[auto_1fr]')}>
				<Header />
				<Container component='article' className={cn('p-layout-web relative')}>
					{/* TODO: 화면 유지 기반 구현 후 MES의 KeepAliveOutlet으로 연결합니다. */}
					<Outlet />
				</Container>
			</Container>
		</Container>
	);
};

export const Route = createFileRoute('/(web)/(authenticated)')({
	// TODO: 인증 기반 구현 후 MES의 guardAuth('WEB')를 beforeLoad에 연결합니다.
	// 현재는 라우트 구조만 준비한 상태이며, 이 영역의 접근을 제한하지 않습니다.
	component: Component,
});
