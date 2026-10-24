import { TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal, { type TModalConfirmHandler } from '@/src/components/ui/modals/Modal';
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

	const handleSubmit: TModalConfirmHandler<ISchemaCreateMember> = async data => {
		await mutation.mutateAsync({ data });
	};

	return (
		<Modal
			open={open}
			title='회원 등록'
			formProps={{ form }}
			onConfirm={handleSubmit}
			onClose={onClose}
		>
			<TextField
				autoFocus
				required
				label='이름'
				disabled={isSubmitting}
				error={Boolean(errors.name)}
				helperText={errors.name?.message}
				{...form.register('name')}
			/>
			<TextField
				required
				label='연락처'
				disabled={isSubmitting}
				error={Boolean(errors.phone)}
				helperText={errors.phone?.message}
				{...form.register('phone')}
			/>
			<TextField
				required
				label='이메일'
				type='email'
				disabled={isSubmitting}
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
		</Modal>
	);
};

export default ModalCreateMember;
