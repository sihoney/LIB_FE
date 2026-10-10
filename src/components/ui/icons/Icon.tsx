import { ICONS, type TIconName } from '@/src/consts/common/icon';
import type { SvgIconProps } from '@mui/material';

export interface IIconProps extends SvgIconProps {
	icon: TIconName;
}

const Icon = ({ icon, ...props }: IIconProps) => {
	const IconComponent = ICONS[icon];

	return <IconComponent {...props} />;
};

export default Icon;
