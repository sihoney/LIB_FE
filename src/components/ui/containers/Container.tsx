import type { ContainerProps } from '@mui/material';
import { Container as MuiContainer } from '@mui/material';

interface IProps extends ContainerProps {}

/**
 * Breakpoint
 * sm: 640px (40rem)
 * md: 768px (48rem)
 * lg: 1024px (64rem)
 * xl: 1280px (80rem)
 * 2xl: 1536px (96rem)
 */
const Container = ({ ...props }: IProps) => <MuiContainer {...props} />;

export default Container;
