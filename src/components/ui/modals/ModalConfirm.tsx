import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@/src/components/ui/buttons/Button';

interface IProps {
	open: boolean;
	title: string;
	message: string;
	confirmLabel: string;
	closeLabel: string;
	onConfirm(): void;
	onClose(): void;
}

// 확인 여부만 반환하는 공통 Dialog입니다. 업무별 저장·삭제 동작은 호출한 화면이 담당합니다.
const ModalConfirm = ({
	open,
	title,
	message,
	confirmLabel,
	closeLabel,
	onConfirm,
	onClose,
}: IProps) => (
	<Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
		<DialogTitle>{title}</DialogTitle>
		<DialogContent>
			<p>{message}</p>
		</DialogContent>
		<DialogActions>
			<Button type='button' variant='outlined' onClick={onClose}>
				{closeLabel}
			</Button>
			<Button type='button' onClick={onConfirm}>
				{confirmLabel}
			</Button>
		</DialogActions>
	</Dialog>
);

export default ModalConfirm;
