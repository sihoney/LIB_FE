import { MenuItem, TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal, { type TModalConfirmHandler } from '@/src/components/ui/modals/Modal';
import { BOOK_CATEGORIES } from '@/src/consts/modules/lib/book';
import { useConfirm } from '@/src/contexts/ConfirmGuardProvider';
import { schemaCreateBook, type ISchemaCreateBook } from '@/src/schemas/modules/lib/book';
import services from '@/src/services/services';
import { useForm } from 'react-hook-form';

interface IModalCreateBookProps {
	open: boolean;
	onClose(): void;
}

const initialValues = {
	title: '',
	author: '',
};

const ModalCreateBook = ({ open, onClose }: IModalCreateBookProps) => {
	// MES_FE의 FormModal은 fields 정의로 여러 종류의 입력을 그리는 계층입니다.
	// 현재는 TextField 네 개만 있어 공통 Modal과 useForm만 적용합니다.
	const mutation = services.bookService.usePostBook();
	const confirm = useConfirm();
	const form = useForm<ISchemaCreateBook>({
		resolver: zodResolver(schemaCreateBook),
		defaultValues: initialValues,
	});
	const { errors, isDirty, isSubmitting } = form.formState;
	const hasFieldError = Boolean(
		errors.title || errors.author || errors.category || errors.totalQuantity,
	);

	const handleClose = async () => {
		if (
			isDirty &&
			!(await confirm({ message: '변경사항이 저장되지 않습니다. 닫으시겠습니까?' }))
		)
			return;
		onClose();
	};

	const handleSubmit: TModalConfirmHandler<ISchemaCreateBook> = async data => {
		// 값 trim·검증은 schemaCreateBook이, mutateAsync는 공통 Modal의 제출 흐름이 호출합니다.
		await mutation.mutateAsync({ data });
	};

	return (
		<Modal
			open={open}
			title='도서 등록'
			formProps={{ form }}
			onConfirm={handleSubmit}
			onClose={handleClose}
		>
			{/* DialogTitle·DialogContent·DialogActions는 공통 Modal이 제공합니다. */}
			<TextField
				autoFocus
				margin='dense'
				label='제목'
				required
				fullWidth
				disabled={isSubmitting}
				error={Boolean(errors.title)}
				helperText={errors.title?.message}
				{...form.register('title')}
			/>
			<TextField
				label='저자'
				required
				fullWidth
				disabled={isSubmitting}
				error={Boolean(errors.author)}
				helperText={errors.author?.message}
				{...form.register('author')}
			/>
			<TextField
				select
				label='분류'
				required
				fullWidth
				disabled={isSubmitting}
				error={Boolean(errors.category)}
				helperText={errors.category?.message}
				{...form.register('category')}
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
				disabled={isSubmitting}
				error={Boolean(errors.totalQuantity)}
				helperText={errors.totalQuantity?.message}
				{...form.register('totalQuantity')}
			/>
			{(hasFieldError || mutation.isError) && (
				<p role='alert'>
					{mutation.isError
						? '저장에 실패했습니다. 입력값을 확인하고 다시 시도해 주세요.'
						: '제목, 저자, 분류, 보유 수량을 확인해 주세요.'}
				</p>
			)}
		</Modal>
	);
};

export default ModalCreateBook;
