import { documentStyles } from '@/src/contexts/themes/common/styles/documentStyles';
import type { ThemeOptions } from '@mui/material/styles';

// MES처럼 공통 옵션을 정의하고, webTheme에서 웹 전용 설정을 병합합니다.
const baseTheme: ThemeOptions = {
	typography: { fontFamily: 'var(--font-noto)' },
	cssVariables: { nativeColor: false, colorSchemeSelector: 'class' },
	colorSchemes: {
		light: {
			palette: {
				divider: 'rgba(0, 0, 0, 0.08)',
				primary: { main: '#2563eb' },
				secondary: { main: '#a78bfa' },
				error: { main: '#b91c1c' },
				warning: { main: '#c2410c' },
				info: { main: '#0369a1' },
				success: { main: '#15803d' },
			},
		},
		dark: {
			palette: {
				divider: 'rgba(255, 255, 255, 0.2)',
				primary: { main: '#15803d' },
				secondary: { main: '#5b21b6' },
				error: { main: '#f87171' },
				warning: { main: '#fb923c' },
				info: { main: '#38bdf8' },
				success: { main: '#4ade80' },
			},
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: documentStyles,
		},
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 'var(--radius-lg)',
					lineHeight: 1.1,
					minHeight: '2rem',
				},
			},
		},
		MuiCard: { defaultProps: { elevation: 0 } },
	},
};
export default baseTheme;
