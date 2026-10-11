import MuiMenuItem, { type MenuItemProps } from '@mui/material/MenuItem';

export interface IMenuItemProps extends MenuItemProps {}

const MenuItem = ({ ...props }: IMenuItemProps) => <MuiMenuItem {...props} />;

export default MenuItem;
