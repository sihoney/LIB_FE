import { useRef } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@/src/components/ui/buttons/Button';
import services from '@/src/services/services';
import type { IBookListItem } from '@/src/types/modules/lib/book';

interface IModalDeleteBookProps {
	open: boolean;
	data: IBookListItem;
	onClose: () => void;
}

const ModalDeleteBook = ({ open, data, onClose }: IModalDeleteBookProps) => {
	const mutation = services.bookService.useDeleteBook();
	const submittingRef = useRef(false);
	const outstandingQuantity = data.totalQuantity - data.availableQuantity;

	const handleClose = () => {
		if (!submittingRef.current) onClose();
	};

	const handleDelete = async () => {
		if (submittingRef.current) return;

		submittingRef.current = true;
		try {
			await mutation.mutateAsync({
				data: { id: data.id },
			});
			onClose();
		} catch {
			// 업무 규칙 실패는 모달을 유지하고 mutation.error로 안내합니다.
		} finally {
			submittingRef.current = false;
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth
			maxWidth='xs'
			aria-labelledby='delete-book-title'
		>
			<DialogTitle id='delete-book-title'>도서 삭제</DialogTitle>
			<DialogContent>
				<p>
					<strong>{data.title}</strong> 도서를 삭제하시겠습니까?
				</p>
				<p>삭제한 도서는 목록에서 제외되며 대출 이력은 보존됩니다.</p>

				{/* 해당 도서의 대출 정보가 있는 경우 */}
				{outstandingQuantity > 0 && (
					<p role='alert'>
						현재 대출 중인 {outstandingQuantity}권이 있어 삭제할 수 없습니다.
					</p>
				)}

				{mutation.isError && (
					<p role='alert'>
						삭제에 실패했습니다. 대출 상태를 확인한 뒤 다시 시도해 주세요.
					</p>
				)}
			</DialogContent>
			<DialogActions>
				<Button
					type='button'
					variant='outlined'
					disabled={mutation.isPending}
					onClick={handleClose}
				>
					취소
				</Button>
				<Button
					type='button'
					disabled={mutation.isPending || outstandingQuantity > 0}
					onClick={() => void handleDelete()}
				>
					{mutation.isPending ? '삭제 중...' : '삭제'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ModalDeleteBook;
