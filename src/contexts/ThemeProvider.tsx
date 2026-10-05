import type { TDefaultTheme, TThemeStore } from '@/src/stores/common/themeStore';
import { CssBaseline } from '@mui/material';
import {
	ThemeProvider as MuiThemeProvider,
	useColorScheme,
	type Theme,
} from '@mui/material/styles';
import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';
import { useStore } from 'zustand';

export type { TDefaultTheme } from '@/src/stores/common/themeStore';

interface IProps {
	theme: Theme;
	store: TThemeStore;
	children: ReactNode;
}

const ThemeStoreContext = createContext<TThemeStore | null>(null);

export const useThemeStoreContext = (): TThemeStore => {
	const ctx = useContext(ThemeStoreContext);
	if (!ctx) throw new Error('useThemeStoreContext must be used inside ThemeProvider');

	return ctx;
};

// [ Zustand와 MUI를 연결하는 코드 ]
const ThemeModeSync = ({ mode }: { mode: TDefaultTheme }) => {
	const { setMode } = useColorScheme();
	// setMode: MUI가 제공하는 함수
	// useColorScheme: MUI의 모드 변경 기능 반환

	// Store의 모드를 MUI에 전달하면 html의 .light/.dark 클래스와 CSS 변수가 함께 바뀝니다.
	useLayoutEffect(() => {
		setMode(mode); // Mui에 적용되는 모드 변경
	}, [mode, setMode]);
	// useLayoutEffect: 모드가 변경되면 브라우저가 화면을 그리기 전에 동기화 코드 실행

	return null;
};

const ThemeProvider = ({ theme, store, children }: IProps) => {
	const mode = useStore(store, state => state.mode);
	// (1)현재 모드를 읽고 (2)변경을 구독 (mode 변경 시, 리렌더링)

	return (
		<ThemeStoreContext.Provider value={store}>
			{/* 하위 컴포넌트에 Zustand Store 제공 */}

			<MuiThemeProvider theme={theme} defaultMode={mode} storageManager={null}>
				{/* MUI 디자인 설정 적용 */}

				<ThemeModeSync mode={mode} />
				{/* Zustand 모드 → MUI 모드 동기화 */}

				<CssBaseline enableColorScheme />
				{/* 문서 기본 스타일 적용 */}

				{children}
			</MuiThemeProvider>
		</ThemeStoreContext.Provider>
	);
};

export default ThemeProvider;
