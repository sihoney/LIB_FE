import { SvgIcon, type SvgIconProps } from '@mui/material';

export interface ISvgProps extends SvgIconProps {}

const BaseIcon = ({ ...props }: ISvgProps) => <SvgIcon {...props} />;

export default BaseIcon;
