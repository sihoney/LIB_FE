import { Menu as MuiMenu, type MenuProps } from '@mui/material';

export interface IMenuProps extends MenuProps {}

const Menu = ({ ...props }: IMenuProps) => <MuiMenu {...props} />;

export default Menu;
