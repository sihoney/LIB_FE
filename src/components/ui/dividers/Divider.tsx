import { Divider as MuiDivider, type DividerProps } from '@mui/material';

export interface IDividerProps extends DividerProps {}

export const ORIENTATIONS_DIVIDER: IDividerProps['orientation'][] = ['horizontal', 'vertical'];

export const VARIANTS_DIVIDER: IDividerProps['variant'][] = ['fullWidth', 'inset', 'middle'];

const Divider = ({ ...props }: IDividerProps) => <MuiDivider {...props} />;

export default Divider;
