import NativeSelect from '@mui/material/NativeSelect';

const SelectSystem = () => (
	<NativeSelect
		value='LIB'
		disabled
		disableUnderline
		inputProps={{ 'aria-label': '시스템 선택' }}
		className='text-xs font-semibold'
	>
		<option value='LIB'>LIB</option>
	</NativeSelect>
);

export default SelectSystem;
