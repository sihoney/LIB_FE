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
import type { TBookCategory } from '@/src/types/modules/lib/book';

interface IModalCreateBookProps {
	open: boolean;
	onClose: () => void;
}

const initialValues = {
	title: '',
	author: '',
	category: '' as TBookCategory | '',
	totalQuantity: '',
};
const initialErrors = {
	title: '',
	author: '',
	category: '',
	totalQuantity: '',
};

const ModalCreateBook = ({ open, onClose }: IModalCreateBookProps) => {
	// 등록·수정 화면의 반복을 확인하기 전에는 MES 공통 FormModal을 이식하지 않습니다.
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState(initialErrors);

	const mutation = services.bookService.usePostBook();

	const submittingRef = useRef(false);

	const handleClose = () => {
		if (submittingRef.current) return;
		if (
			(values.title || values.author || values.category || values.totalQuantity) &&
			!window.confirm('변경사항이 저장되지 않습니다. 닫으시겠습니까?')
		)
			return;
		onClose();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (submittingRef.current) return;

		// 값 trim
		const title = values.title.trim();
		const author = values.author.trim();
		const totalQuantity = Number(values.totalQuantity);

		// 값 검증
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

		// mutateAsync
		submittingRef.current = true;
		try {
			await mutation.mutateAsync({
				data: {
					title,
					author,
					category: values.category as TBookCategory,
					totalQuantity,
				},
			});
			onClose();
		} catch {
			// mutation.error를 표시하고 입력값·모달은 유지합니다.
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
			aria-labelledby='create-book-title'
		>
			<form onSubmit={handleSubmit} noValidate>
				{/* [1] DialogTitle */}
				<DialogTitle id='create-book-title'>도서 등록</DialogTitle>

				{/* [2] DiaglogContent */}
				<DialogContent className='flex flex-col gap-4'>
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
								category: event.target.value as TBookCategory | '',
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
						slotProps={{ htmlInput: { min: 0, step: 1 } }}
						value={values.totalQuantity}
						disabled={mutation.isPending}
						error={!!errors.totalQuantity}
						helperText={errors.totalQuantity}
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

				{/* [3] DialogActions */}
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

export default ModalCreateBook;
