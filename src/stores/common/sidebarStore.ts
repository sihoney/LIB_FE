import { debounce } from 'es-toolkit';
import { create } from 'zustand';

interface ISidebarStore {
	open: boolean;
	hovered: boolean;
	setOpen: (open: boolean) => void;
	setHovered: (hovered: boolean) => void;
	toggle: () => void;
}

const useSidebarStore = create<ISidebarStore>()(set => {
	// hover 해제는 잠깐 유예 — 사이드바에서 토글 버튼으로 대각선 이동 시
	// 경계를 스치는 순간 버튼이 사라져 클릭이 불가능해지는 것을 방지
	// debounce(): 함수 실행을 일정 시간 미루고, 그 동안 다시 호출되면 기다리는 시간을 새로 시작하는 함수
	const hoverOff = debounce(() => set({ hovered: false }), 500);

	return {
		open: true,
		hovered: false,
		setOpen: open => set({ open }),
		setHovered: hovered => {
			// 다시 호출되면 hoverOff.cancel()로 이전 숨김 예약 취소
			hoverOff.cancel();

			if (hovered) {
				set({ hovered: true }); // true를 받으면 바로 표시 상태로 변경
			} else {
				hoverOff(); // false를 받으면 debounce로 500ms 뒤 숨김
			}
		},
		toggle: () => set(state => ({ open: !state.open })),
	};
});

export default useSidebarStore;
