import { useRef, useState, type FormEvent } from 'react';
import Button from '@/src/components/ui/buttons/Button';
import services from '@/src/services/services';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

interface IModalCreateNoticeProps {
	open: boolean;
	onClose: () => void;
}

const ModalCreateNotice = ({ open, onClose }: IModalCreateNoticeProps) => {
	// TODO: 반복되는 폼 처리를 확인한 뒤 MES의 useForm·Zod·FormModal로 옮깁니다.
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [errors, setErrors] = useState({ title: '', content: '' });

	const mutation = services.noticeService.usePostNotice();

	// 렌더링 전에 연속 submit이 발생해도 요청은 한 번만 보냅니다.
	const submittingRef = useRef(false);

	const handleClose = () => {
		if (submittingRef.current) return;
		// TODO: MES의 공통 Modal·useConfirm 도입 후 저장/닫기 확인을 공통 계층으로 옮깁니다.
		if ((title || content) && !window.confirm('변경사항이 저장되지 않습니다. 닫으시겠습니까?'))
			return;
		onClose();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (submittingRef.current) return;

		const data = {
			title: title.trim(),
			content: content.trim(),
		};
		const nextErrors = {
			title: !data.title
				? '제목을 입력해 주세요.'
				: data.title.length > 200
					? '제목은 200자 이하여야 합니다.'
					: '',
			content: !data.content ? '본문을 입력해 주세요.' : '',
		};
		setErrors(nextErrors);
		if (nextErrors.title || nextErrors.content) return;
		if (!window.confirm('공지글을 저장하시겠습니까?')) return;
		submittingRef.current = true;
		try {
			await mutation.mutateAsync({ data });
			// 부모가 모달을 제거하므로 다음 열기에서는 입력값과 오류 상태가 초기화됩니다.
			onClose();
		} catch {
			// TODO: 공통 알림·Axios 인터셉터 도입 후 오류 표시를 MES 방식으로 연결합니다.
			// mutation.error로 표시하며 입력값과 열린 모달은 유지합니다.
		} finally {
			submittingRef.current = false;
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth
			maxWidth='sm'
			aria-labelledby='create-notice-title'
		>
			<form onSubmit={handleSubmit} noValidate>
				{/* [1] Title */}
				<DialogTitle id='create-notice-title'>공지글 등록</DialogTitle>

				{/* [2] Content */}
				<DialogContent className='flex flex-col gap-4'>
					<TextField
						autoFocus
						margin='dense'
						label='제목'
						required
						fullWidth
						value={title}
						onChange={event => setTitle(event.target.value)}
						disabled={mutation.isPending}
						error={!!errors.title}
						helperText={errors.title}
					/>
					<TextField
						label='본문'
						required
						fullWidth
						multiline
						minRows={5}
						value={content}
						onChange={event => setContent(event.target.value)}
						disabled={mutation.isPending}
						error={!!errors.content}
						helperText={errors.content}
					/>
					{mutation.isError && (
						<p role='alert'>
							저장에 실패했습니다. 입력값을 확인하고 다시 시도해 주세요.
						</p>
					)}
				</DialogContent>

				{/* [3] Actions */}
				<DialogActions>
					<Button
						type='button'
						variant='outlined'
						disabled={mutation.isPending}
						onClick={handleClose}
					>
						취소
					</Button>
					<Button type='submit' disabled={mutation.isPending}>
						{mutation.isPending ? '저장 중...' : '저장'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default ModalCreateNotice;
