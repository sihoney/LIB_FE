import { Tabs as MuiTabs, type TabsProps } from '@mui/material';

export const VARIANTS_TABS: ITabsProps['variant'][] = ['standard', 'scrollable', 'fullWidth'];
export const TEXT_COLORS_TABS: ITabsProps['textColor'][] = ['inherit', 'primary', 'secondary'];
export const INDICATOR_COLORS_TABS: ITabsProps['indicatorColor'][] = ['primary', 'secondary'];
export const ORIENTATIONS_TABS: ITabsProps['orientation'][] = ['horizontal', 'vertical'];
export interface ITabsProps extends TabsProps {}

const Tabs = ({ ...props }: ITabsProps) => <MuiTabs {...props} />;

export default Tabs;
