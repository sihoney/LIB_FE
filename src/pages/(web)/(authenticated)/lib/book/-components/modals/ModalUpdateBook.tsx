import { MenuItem, TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal, {
	type IModalBaseProps,
	type TModalConfirmHandler,
} from '@/src/components/ui/modals/Modal';
import { BOOK_CATEGORIES } from '@/src/consts/modules/lib/book';
import { schemaUpdateBook, type ISchemaUpdateBook } from '@/src/schemas/modules/lib/book';
import services from '@/src/services/services';
import type { IBookListItem } from '@/src/types/modules/lib/book';
import { useForm } from 'react-hook-form';

const ModalUpdateBook = ({ open, data, onClose }: IModalBaseProps<IBookListItem>) => {
	const { bookService: service } = services;
	const mutation = service.usePatchBook();
	const form = useForm<ISchemaUpdateBook>({
		resolver: zodResolver(schemaUpdateBook),
		mode: 'all',
		values: {
			id: data.id,
			title: data.title,
			author: data.author,
			category: data.category,
			totalQuantity: data.totalQuantity,
		},
	});
	const { errors, isSubmitting } = form.formState;
	const hasFieldError = Boolean(
		errors.title || errors.author || errors.category || errors.totalQuantity,
	);

	const handleClose = () => {
		if (
			form.formState.isDirty &&
			!window.confirm('변경사항이 저장되지 않습니다. 닫으시겠습니까?')
		)
			return;
		onClose();
	};

	const handleSubmit: TModalConfirmHandler<ISchemaUpdateBook> = async values => {
		// 대출 중 수량보다 보유 수량을 낮출 수 없는 규칙은 MSW HTTP 경계에서 검증합니다.
		await mutation.mutateAsync({ data: values });
	};

	return (
		<Modal
			open={open}
			title='도서 수정'
			formProps={{ form }}
			onConfirm={handleSubmit}
			onClose={handleClose}
		>
			<TextField
				autoFocus
				required
				label='제목'
				disabled={isSubmitting}
				error={Boolean(errors.title)}
				helperText={errors.title?.message}
				{...form.register('title')}
			/>
			<TextField
				required
				label='저자'
				disabled={isSubmitting}
				error={Boolean(errors.author)}
				helperText={errors.author?.message}
				{...form.register('author')}
			/>
			<TextField
				select
				required
				label='분류'
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
				required
				label='보유 수량'
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
						? '수정에 실패했습니다. 대출 중인 수량과 입력값을 확인해 주세요.'
						: '제목, 저자, 분류, 보유 수량을 확인해 주세요.'}
				</p>
			)}
		</Modal>
	);
};

export default ModalUpdateBook;
