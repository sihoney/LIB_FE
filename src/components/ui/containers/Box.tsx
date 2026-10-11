import type { BoxProps } from '@mui/material';
import { Box as MuiBox } from '@mui/material';

export interface IBoxProps extends BoxProps {}

/**
 * Breakpoint
 * sm: 640px (40rem)
 * md: 768px (48rem)
 * lg: 1024px (64rem)
 * xl: 1280px (80rem)
 * 2xl: 1536px (96rem)
 */
const Box = ({ ...props }: IBoxProps) => <MuiBox {...props} />;

export default Box;
