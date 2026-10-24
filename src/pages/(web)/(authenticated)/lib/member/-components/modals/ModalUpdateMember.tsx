import { TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal, {
	type IModalBaseProps,
	type TModalConfirmHandler,
} from '@/src/components/ui/modals/Modal';
import { schemaUpdateMember, type ISchemaUpdateMember } from '@/src/schemas/modules/lib/member';
import services from '@/src/services/services';
import type { IMemberListItem } from '@/src/types/modules/lib/member';
import { useForm } from 'react-hook-form';

const ModalUpdateMember = ({ open, data, onClose }: IModalBaseProps<IMemberListItem>) => {
	// draft는 useForm의 values가 보관합니다.
	// error, isSubmitting은 formState가 제공합니다.
	const mutation = services.memberService.usePatchMember();
	const form = useForm<ISchemaUpdateMember>({
		resolver: zodResolver(schemaUpdateMember),
		values: {
			id: data.id,
			name: data.name,
			phone: data.phone,
			email: data.email,
		},
	});
	const { errors, isSubmitting } = form.formState;
	const hasFieldError = Boolean(errors.name || errors.phone || errors.email);

	const handleSubmit: TModalConfirmHandler<ISchemaUpdateMember> = async values => {
		await mutation.mutateAsync({ data: values });
	};

	return (
		<Modal
			open={open}
			title='회원 수정'
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
						? '수정에 실패했습니다.'
						: '이름, 연락처, 이메일을 확인해 주세요.'}
				</p>
			)}
		</Modal>
	);
};

export default ModalUpdateMember;
