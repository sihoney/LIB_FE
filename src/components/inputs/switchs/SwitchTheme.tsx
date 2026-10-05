import { useThemeStoreContext } from '@/src/contexts/ThemeProvider';
import { FormControlLabel, Switch } from '@mui/material';
import { useStore } from 'zustand';

const SwitchTheme = () => {
	const store = useThemeStoreContext();
	const mode = useStore(store, state => state.mode);
	const toggleMode = useStore(store, state => state.toggleMode);
	return (
		<FormControlLabel
			label='어두운 테마'
			control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
		/>
	);
};
export default SwitchTheme;
