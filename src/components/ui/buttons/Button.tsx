import { Button as MuiButton, type ButtonProps } from '@mui/material';

// MES처럼 화면에서 반복하는 기본값만 공통 UI에 둡니다.
const Button = ({ variant = 'contained', ...props }: ButtonProps) => (
	<MuiButton variant={variant} {...props} />
);
export default Button;
