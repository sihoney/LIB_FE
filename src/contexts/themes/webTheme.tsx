import baseTheme from '@/src/contexts/themes/common/baseTheme';
import { deepMerge } from '@/src/utils/common/deepMerge';
import { createTheme, type ThemeOptions } from '@mui/material/styles';

// 웹 화면용 설정
const overrides: ThemeOptions = {
	spacing: 4,
	components: {
		MuiCssBaseline: {
			styleOverrides: { html: { fontSize: '14px' } },
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 'var(--radius-lg)',
					padding: 'calc(var(--spacing) * 4)',
					boxShadow: 'none',
					border: '1px solid var(--card-border)',
				},
			},
		},
		MuiButton: { styleOverrides: { root: { whiteSpace: 'nowrap' } } },
	},
};
const webTheme = createTheme(deepMerge(baseTheme, overrides));
export default webTheme;
