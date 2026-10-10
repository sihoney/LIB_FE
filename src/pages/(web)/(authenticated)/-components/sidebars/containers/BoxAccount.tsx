import Container from '@/src/components/ui/containers/Container';
import { cn } from '@/src/utils/common/cn';
import Avatar from '@mui/material/Avatar';

interface IProps {
	user?: {
		userName: string;
		userCode?: string;
		imgPath?: string;
	} | null;
	onLogout?: () => void;
}

// TODO: 인증 기반 구현 후 MES의 authStore·계정 메뉴와 연결합니다. 현재는 props 기반 임시 표시입니다.
const BoxAccount = ({ user, onLogout }: IProps) => (
	<Container
		component='footer'
		className={cn(
			'border-divider flex h-14 shrink-0 items-center gap-2.5 border-t border-r px-4',
		)}
	>
		<Avatar src={user?.imgPath} className={cn('size-9 shrink-0 text-xs font-bold')}>
			{user?.userName.charAt(0).toUpperCase()}
		</Avatar>
		<div className='min-w-0 flex-1'>
			<p className='text-on-surface truncate text-[13px] font-semibold'>
				{user?.userName || '로그인되지 않음'}
			</p>
			{user?.userCode && (
				<p className='text-on-surface-secondary truncate text-[11px]'>{user.userCode}</p>
			)}
		</div>
		{user && onLogout && (
			<button
				type='button'
				onClick={onLogout}
				className='text-on-surface-secondary shrink-0 cursor-pointer rounded-md px-2 py-2 text-xs hover:bg-(--mui-palette-action-hover)'
			>
				로그아웃
			</button>
		)}
	</Container>
);

export default BoxAccount;
