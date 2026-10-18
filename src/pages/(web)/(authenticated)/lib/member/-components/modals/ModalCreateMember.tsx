import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useRef, useState, type FormEvent } from 'react';
import Button from '@/src/components/ui/buttons/Button';
import {
	MEMBER_EMAIL_MAX_LENGTH,
	MEMBER_NAME_MAX_LENGTH,
	MEMBER_PHONE_MAX_LENGTH,
} from '@/src/consts/modules/lib/member';
import services from '@/src/services/services';

interface IProps {
	open: boolean;
	onClose(): void;
}

const emptyValues = { name: '', phone: '', email: '' };

const ModalCreateMember = ({ open, onClose }: IProps) => {
	const [values, setValues] = useState(emptyValues);
	const [error, setError] = useState('');
	const submittingRef = useRef(false);
	const mutation = services.memberService.usePostMember();
	const handleClose = () => {
		if (!submittingRef.current) onClose();
	};
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submittingRef.current) return;
		const data = {
			name: values.name.trim(),
			phone: values.phone.trim(),
			email: values.email.trim(),
		};
		if (
			!data.name ||
			data.name.length > MEMBER_NAME_MAX_LENGTH ||
			!data.phone ||
			data.phone.length > MEMBER_PHONE_MAX_LENGTH ||
			!data.email ||
			data.email.length > MEMBER_EMAIL_MAX_LENGTH ||
			!/^\S+@\S+\.\S+$/.test(data.email)
		) {
			setError('이름, 연락처, 이메일을 확인해 주세요.');
			return;
		}
		setError('');
		submittingRef.current = true;
		try {
			await mutation.mutateAsync({ data });
			onClose();
		} finally {
			submittingRef.current = false;
		}
	};
	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
			<form onSubmit={handleSubmit} noValidate>
				<DialogTitle>회원 등록</DialogTitle>
				<DialogContent className='flex flex-col gap-4'>
					<TextField
						autoFocus
						required
						label='이름'
						value={values.name}
						disabled={mutation.isPending}
						onChange={event =>
							setValues(previous => ({ ...previous, name: event.target.value }))
						}
					/>
					<TextField
						required
						label='연락처'
						value={values.phone}
						disabled={mutation.isPending}
						onChange={event =>
							setValues(previous => ({ ...previous, phone: event.target.value }))
						}
					/>
					<TextField
						required
						label='이메일'
						type='email'
						value={values.email}
						disabled={mutation.isPending}
						onChange={event =>
							setValues(previous => ({ ...previous, email: event.target.value }))
						}
					/>
					{(error || mutation.isError) && (
						<p role='alert'>{error || '등록에 실패했습니다. 다시 시도해 주세요.'}</p>
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

export default ModalCreateMember;
