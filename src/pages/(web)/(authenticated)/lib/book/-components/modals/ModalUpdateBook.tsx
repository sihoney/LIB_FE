import { useRef, useState, type FormEvent } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	TextField,
} from '@mui/material';
import Button from '@/src/components/ui/buttons/Button';
import {
	BOOK_AUTHOR_MAX_LENGTH,
	BOOK_CATEGORIES,
	BOOK_TITLE_MAX_LENGTH,
} from '@/src/consts/modules/lib/book';
import services from '@/src/services/services';
import type { IBookListItem, TBookCategory } from '@/src/types/modules/lib/book';

interface IModalUpdateBookProps {
	open: boolean;
	data: IBookListItem;
	onClose: () => void;
}

const ModalUpdateBook = ({ open, data, onClose }: IModalUpdateBookProps) => {
	// 등록 모달과 반복되는 입력 처리를 확인하는 단계입니다. 다음 공통화는 수정 완료 후 비교해 결정합니다.
	const [values, setValues] = useState({
		title: data.title,
		author: data.author,
		category: data.category,
		totalQuantity: String(data.totalQuantity),
	});
	const [errors, setErrors] = useState({
		title: '',
		author: '',
		category: '',
		totalQuantity: '',
	});
	const mutation = services.bookService.usePatchBook();
	const submittingRef = useRef(false);

	const handleClose = () => {
		if (submittingRef.current) return;
		if (
			(values.title !== data.title ||
				values.author !== data.author ||
				values.category !== data.category ||
				values.totalQuantity !== String(data.totalQuantity)) &&
			!window.confirm('변경사항이 저장되지 않습니다. 닫으시겠습니까?')
		)
			return;
		onClose();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submittingRef.current) return;
		const title = values.title.trim();
		const author = values.author.trim();
		const totalQuantity = Number(values.totalQuantity);
		const nextErrors = {
			title: !title
				? '제목을 입력해 주세요.'
				: title.length > BOOK_TITLE_MAX_LENGTH
					? `제목은 ${BOOK_TITLE_MAX_LENGTH}자 이하여야 합니다.`
					: '',
			author: !author
				? '저자를 입력해 주세요.'
				: author.length > BOOK_AUTHOR_MAX_LENGTH
					? `저자는 ${BOOK_AUTHOR_MAX_LENGTH}자 이하여야 합니다.`
					: '',
			category: !values.category ? '분류를 선택해 주세요.' : '',
			totalQuantity:
				!Number.isSafeInteger(totalQuantity) || totalQuantity < 0
					? '보유 수량은 0 이상의 정수여야 합니다.'
					: '',
		};
		setErrors(nextErrors);
		if (Object.values(nextErrors).some(Boolean)) return;
		submittingRef.current = true;
		try {
			await mutation.mutateAsync({
				data: {
					id: data.id,
					title,
					author,
					category: values.category as TBookCategory,
					totalQuantity,
				},
			});
			onClose();
		} catch {
			// MSW 업무 규칙 실패를 mutation.error로 표시하며 입력값과 모달은 유지합니다.
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
			aria-labelledby='update-book-title'
		>
			<form onSubmit={handleSubmit} noValidate>
				<DialogTitle id='update-book-title'>도서 수정</DialogTitle>
				<DialogContent className='flex flex-col gap-4'>
					<p>현재 대출 가능 수량: {data.availableQuantity}권</p>
					<TextField
						autoFocus
						margin='dense'
						label='제목'
						required
						fullWidth
						value={values.title}
						disabled={mutation.isPending}
						error={!!errors.title}
						helperText={errors.title}
						onChange={event =>
							setValues(previous => ({ ...previous, title: event.target.value }))
						}
					/>
					<TextField
						label='저자'
						required
						fullWidth
						value={values.author}
						disabled={mutation.isPending}
						error={!!errors.author}
						helperText={errors.author}
						onChange={event =>
							setValues(previous => ({ ...previous, author: event.target.value }))
						}
					/>
					<TextField
						select
						label='분류'
						required
						fullWidth
						value={values.category}
						disabled={mutation.isPending}
						error={!!errors.category}
						helperText={errors.category}
						onChange={event =>
							setValues(previous => ({
								...previous,
								category: event.target.value as TBookCategory,
							}))
						}
					>
						{Object.entries(BOOK_CATEGORIES).map(([code, label]) => (
							<MenuItem key={code} value={code}>
								{label}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label='보유 수량'
						required
						fullWidth
						type='number'
						slotProps={{
							htmlInput: {
								min: data.totalQuantity - data.availableQuantity,
								step: 1,
							},
						}}
						value={values.totalQuantity}
						disabled={mutation.isPending}
						error={!!errors.totalQuantity}
						helperText={
							errors.totalQuantity ||
							`현재 대출 중인 ${data.totalQuantity - data.availableQuantity}권 이상이어야 합니다.`
						}
						onChange={event =>
							setValues(previous => ({
								...previous,
								totalQuantity: event.target.value,
							}))
						}
					/>
					{mutation.isError && (
						<p role='alert'>
							저장에 실패했습니다. 입력값을 확인하고 다시 시도해 주세요.
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
					<Button type='submit' disabled={mutation.isPending}>
						{mutation.isPending ? '저장 중...' : '저장'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default ModalUpdateBook;
