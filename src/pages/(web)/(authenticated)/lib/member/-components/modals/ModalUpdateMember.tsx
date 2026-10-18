import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useRef, useState, type FormEvent } from 'react';
import Button from '@/src/components/ui/buttons/Button';
import {
	MEMBER_EMAIL_MAX_LENGTH,
	MEMBER_NAME_MAX_LENGTH,
	MEMBER_PHONE_MAX_LENGTH,
} from '@/src/consts/modules/lib/member';
import services from '@/src/services/services';
import type { IMemberListItem } from '@/src/types/modules/lib/member';

interface IProps {
	open: boolean;
	data: IMemberListItem;
	onClose(): void;
}
const ModalUpdateMember = ({ open, data, onClose }: IProps) => {
	const [values, setValues] = useState({ name: data.name, phone: data.phone, email: data.email });
	const [error, setError] = useState('');
	const submittingRef = useRef(false);
	const mutation = services.memberService.usePatchMember();
	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submittingRef.current) return;
		const member = {
			name: values.name.trim(),
			phone: values.phone.trim(),
			email: values.email.trim(),
		};
		if (
			!member.name ||
			member.name.length > MEMBER_NAME_MAX_LENGTH ||
			!member.phone ||
			member.phone.length > MEMBER_PHONE_MAX_LENGTH ||
			!member.email ||
			member.email.length > MEMBER_EMAIL_MAX_LENGTH ||
			!/^\S+@\S+\.\S+$/.test(member.email)
		) {
			setError('이름, 연락처, 이메일을 확인해 주세요.');
			return;
		}
		setError('');
		submittingRef.current = true;
		try {
			await mutation.mutateAsync({ data: { id: data.id, ...member } });
			onClose();
		} finally {
			submittingRef.current = false;
		}
	};
	return (
		<Dialog
			open={open}
			onClose={() => !mutation.isPending && onClose()}
			fullWidth
			maxWidth='sm'
		>
			<form onSubmit={submit} noValidate>
				<DialogTitle>회원 수정</DialogTitle>
				<DialogContent className='flex flex-col gap-4'>
					<TextField
						label='이름'
						value={values.name}
						disabled={mutation.isPending}
						onChange={event =>
							setValues(previous => ({ ...previous, name: event.target.value }))
						}
					/>
					<TextField
						label='연락처'
						value={values.phone}
						disabled={mutation.isPending}
						onChange={event =>
							setValues(previous => ({ ...previous, phone: event.target.value }))
						}
					/>
					<TextField
						label='이메일'
						value={values.email}
						disabled={mutation.isPending}
						onChange={event =>
							setValues(previous => ({ ...previous, email: event.target.value }))
						}
					/>
					{(error || mutation.isError) && (
						<p role='alert'>{error || '수정에 실패했습니다.'}</p>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						type='button'
						variant='outlined'
						disabled={mutation.isPending}
						onClick={onClose}
					>
						취소
					</Button>
					<Button type='submit' disabled={mutation.isPending}>
						저장
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};
export default ModalUpdateMember;
