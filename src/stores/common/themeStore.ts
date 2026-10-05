import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TDefaultTheme = 'dark' | 'light';
export interface IThemeStore {
	mode: TDefaultTheme;
	setMode: (mode: TDefaultTheme) => void;
	toggleMode: () => void;
}

// 현재 LIB는 웹 화면만 있으므로 MES의 태블릿별 Store는 만들지 않습니다.
// create: Zustand Store 생성
export const useWebThemeStore = create<IThemeStore>()(
	// persist: Store를 localStorage에 저장하도록 설정 (새로고침 후에도 유지, 보조기능, 미들웨어)
	persist(
		// set => ({...}): 저장소의 내용을 정의/변경하는 함수
		set => ({
			mode: 'light',
			setMode: mode => set({ mode }),
			toggleMode: () =>
				set(state => ({
					mode: state.mode === 'dark' ? 'light' : 'dark',
				})),
		}),
		// 옵션
		{
			name: 'lib:web:theme-store',
			storage: createJSONStorage(() => localStorage),
		},
	),
);
export type TThemeStore = typeof useWebThemeStore;

export const getThemeStore = (): TThemeStore => useWebThemeStore;
