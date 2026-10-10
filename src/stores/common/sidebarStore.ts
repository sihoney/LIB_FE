import { create } from 'zustand';

interface ISidebarStore {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
}

// MES처럼 메모리에서 공유하며 persist는 사용하지 않습니다.
// TODO: hover 작업 시 MES의 hovered·setHovered와 해제 지연 처리를 추가합니다.
const useSidebarStore = create<ISidebarStore>()(set => ({
	open: true,
	setOpen: open => set({ open }),
	toggle: () => set(state => ({ open: !state.open })),
}));

export default useSidebarStore;
