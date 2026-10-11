import { cn } from '@/src/utils/common/cn';
import { Tab as MuiTab, type TabProps } from '@mui/material';

export interface ITabProps extends TabProps {
	count?: number;
	// MUI Tabs 가 자식 Tab 에 런타임 주입하는 선택 여부 — 공개 타입에 없어 직접 선언
	selected?: boolean;
}

const Tab = ({ count, label, className, ...props }: ITabProps) => (
	<MuiTab
		{...props}
		className={cn({ group: count !== undefined }, className)}
		label={
			<>
				{label}
				{count !== undefined && (
					<span
						className={cn(
							'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold',
							'bg-on-surface/10 text-on-surface-secondary',
							'group-[.Mui-selected]:bg-primary/15 group-[.Mui-selected]:text-primary',
						)}
					>
						{count}
					</span>
				)}
			</>
		}
	/>
);

export default Tab;
