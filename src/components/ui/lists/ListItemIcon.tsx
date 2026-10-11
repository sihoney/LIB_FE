import { ListItemIcon as MuiListItemIcon, type ListItemIconProps } from '@mui/material';

interface IListItemIconProps extends ListItemIconProps {}

const ListItemIcon = ({ ...props }: IListItemIconProps) => <MuiListItemIcon {...props} />;

export default ListItemIcon;
