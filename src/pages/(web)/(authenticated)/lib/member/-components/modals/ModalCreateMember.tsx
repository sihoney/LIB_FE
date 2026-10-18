import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/src/components/ui/buttons/Button';
import Form from '@/src/components/ui/forms/Form';
import { schemaCreateMember, type ISchemaCreateMember } from '@/src/schemas/modules/lib/member';
import services from '@/src/services/services';
import { useForm } from 'react-hook-form';

interface IProps {
	open: boolean;
	onClose(): void;
}

const emptyValues = { name: '', phone: '', email: '' };

const ModalCreateMember = ({ open, onClose }: IProps) => {
	const mutation = services.memberService.usePostMember();
	const form = useForm<ISchemaCreateMember>({
		resolver: zodResolver(schemaCreateMember),
		defaultValues: emptyValues,
	});
	const { errors, isSubmitting } = form.formState;
	const hasFieldError = Boolean(errors.name || errors.phone || errors.email);

	const handleClose = () => {
		if (!isSubmitting && !mutation.isPending) onClose();
	};

	const handleSubmit = async (data: ISchemaCreateMember) => {
		await mutation.mutateAsync({ data });
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
			<Form onSubmit={form.handleSubmit(handleSubmit)}>
				<DialogTitle>회원 등록</DialogTitle>
				<DialogContent className='flex flex-col gap-4'>
					<TextField
						autoFocus
						required
						label='이름'
						disabled={isSubmitting || mutation.isPending}
						error={Boolean(errors.name)}
						helperText={errors.name?.message}
						{...form.register('name')}
					/>
					<TextField
						required
						label='연락처'
						disabled={isSubmitting || mutation.isPending}
						error={Boolean(errors.phone)}
						helperText={errors.phone?.message}
						{...form.register('phone')}
					/>
					<TextField
						required
						label='이메일'
						type='email'
						disabled={isSubmitting || mutation.isPending}
						error={Boolean(errors.email)}
						helperText={errors.email?.message}
						{...form.register('email')}
					/>
					{(hasFieldError || mutation.isError) && (
						<p role='alert'>
							{mutation.isError
								? '등록에 실패했습니다. 다시 시도해 주세요.'
								: '이름, 연락처, 이메일을 확인해 주세요.'}
						</p>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						type='button'
						variant='outlined'
						disabled={isSubmitting || mutation.isPending}
						onClick={handleClose}
					>
						취소
					</Button>
					<Button type='submit' disabled={isSubmitting || mutation.isPending}>
						{isSubmitting || mutation.isPending ? '저장 중...' : '저장'}
					</Button>
				</DialogActions>
			</Form>
		</Dialog>
	);
};

export default ModalCreateMember;
