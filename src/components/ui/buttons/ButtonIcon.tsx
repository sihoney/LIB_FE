import { IconButton as MuiIconButton, type IconButtonProps } from '@mui/material';

export interface IButtonIconProps extends IconButtonProps {}
export const SIZES_BUTTON_ICON: IButtonIconProps['size'][] = ['small', 'medium', 'large'];
export const COLORS_BUTTON_ICON: IButtonIconProps['color'][] = [
	'default',
	'inherit',
	'primary',
	'secondary',
	'error',
	'info',
	'success',
	'warning',
];

const ButtonIcon = ({ ...props }: IButtonIconProps) => <MuiIconButton {...props} />;

export default ButtonIcon;
