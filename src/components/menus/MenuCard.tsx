import Box from '@/src/components/ui/containers/Box';
import Menu, { type IMenuProps } from '@/src/components/ui/menus/Menu';
import { cn } from '@/src/utils/common/cn';
import type { MenuOwnerState } from '@mui/material/Menu';
import type { ReactNode } from 'react';

export interface IMenuCardProps extends IMenuProps {
	header?: ReactNode;
}

const MenuCard = ({ header, children, ...props }: IMenuCardProps) => (
	<Menu
		{...props}
		slotProps={{
			...props.slotProps,
			paper: (ownerState: MenuOwnerState) => {
				const paperProp = props.slotProps?.paper;
				const resolved =
					typeof paperProp === 'function' ? paperProp(ownerState) : paperProp;
				return {
					...resolved,
					className: cn(
						'border border-divider rounded-xl shadow-xs',
						resolved?.className,
					),
				};
			},
		}}
	>
		{header && (
			<Box className={'border-divider border-b px-4 py-2 text-sm font-semibold'}>
				{header}
			</Box>
		)}
		<Box
			className={cn(
				'space-y-2 p-2',
				'[&>.MuiMenuItem-root]:border-divider [&>.MuiMenuItem-root]:rounded-lg [&>.MuiMenuItem-root]:border [&>.MuiMenuItem-root]:px-3 [&>.MuiMenuItem-root]:py-2 [&>.MuiMenuItem-root]:text-sm [&>.MuiMenuItem-root]:font-medium',
				'[&_.MuiListItemIcon-root]:text-on-surface-secondary [&_.MuiListItemIcon-root]:min-w-0 [&_.MuiListItemIcon-root]:pr-2',
				'[&_.MuiSvgIcon-root]:text-base',
			)}
		>
			{children}
		</Box>
	</Menu>
);

export default MenuCard;
