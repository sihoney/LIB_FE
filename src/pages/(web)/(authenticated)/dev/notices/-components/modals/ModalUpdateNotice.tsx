import { useRef, useState, type FormEvent } from 'react';
import Button from '@/src/components/ui/buttons/Button';
import services from '@/src/services/services';
import type { INotice, INoticeUpdate } from '@/src/types/modules/dev/notice';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

interface IModalUpdateNoticeProps {
	open: boolean;
	data: INotice;
	onClose: () => void;
}

const ModalUpdateNotice = ({ open, data, onClose }: IModalUpdateNoticeProps) => {
	const query = services.noticeService.useGetNoticeDetail({
		skip: 0,
		take: 0,
		data: { noticeId: data.id },
	});
	const notice = query.data?.data;

	const mutation = services.noticeService.usePatchNotice();
	const [errors, setErrors] = useState({ title: '', content: '' });
	const submittingRef = useRef(false);
	// TODO: MES의 useForm·Zod로 옮길 때 초기값과 dirtyFields 관리를 비교합니다.

	const [draft, setDraft] = useState<{
		original: INotice;
		title: string;
		content: string;
	} | null>(null);

	// 입력 전에는 조회값을 표시하고, 첫 입력부터 원본과 편집값을 함께 보관합니다.
	// MES의 반응형 values와 달리 이후 재조회가 입력 중인 값을 덮지 않습니다.
	const form =
		draft ??
		(notice
			? {
					original: { ...notice },
					title: notice.title,
					content: notice.content,
				}
			: null);

	// isDirty, canEdit: 변경 여부와 편집 가능 여부 판단
	const isDirty =
		!!form && (form.title !== form.original.title || form.content !== form.original.content);
	const canEdit = !!form && !!notice && !query.isError && !mutation.isPending;

	const handleClose = () => {
		if (submittingRef.current) return;
		// TODO: 등록·수정의 확인 흐름을 MES의 공통 Modal·useConfirm으로 옮깁니다.
		if (isDirty && !window.confirm('변경사항이 저장되지 않습니다. 닫으시겠습니까?')) return;
		onClose();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (submittingRef.current || !canEdit || !form || !isDirty) return;

		const title = form.title.trim();
		const content = form.content.trim();

		const nextErrors = {
			title: !title
				? '제목을 입력해 주세요.'
				: title.length > 200
					? '제목은 200자 이하여야 합니다.'
					: '',
			content: !content ? '본문을 입력해 주세요.' : '',
		};
		setErrors(nextErrors);
		if (nextErrors.title || nextErrors.content) return;

		// "원본과 다른 필드만 요청에 포함"
		// MES의 PK + dirtiedValues와 같은 요청 형태입니다. 현재 Notice의 PK 이름은 id입니다.
		const changed: INoticeUpdate = {
			id: form.original.id,
			...(title !== form.original.title && { title }),
			...(content !== form.original.content && { content }),
		};

		if (changed.title === undefined && changed.content === undefined) return;
		if (!window.confirm('공지글을 저장하시겠습니까?')) return;

		submittingRef.current = true;
		try {
			await mutation.mutateAsync({ data: changed });
			onClose();
		} catch {
			// TODO: 공통 오류 알림 도입 후 MES 인터셉터로 연결합니다. 실패 시 입력값은 유지합니다.
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
			aria-labelledby='update-notice-title'
		>
			<form onSubmit={handleSubmit} noValidate>
				<DialogTitle id='update-notice-title'>공지글 수정</DialogTitle>
				<DialogContent className='flex flex-col gap-4'>
					{query.isLoading && <p role='status'>공지글을 불러오고 있습니다.</p>}
					{query.isError && (
						<div role='alert'>
							<p>공지글 조회에 실패했습니다.</p>
							<Button
								type='button'
								disabled={query.isFetching}
								onClick={() => void query.refetch()}
							>
								다시 조회
							</Button>
						</div>
					)}
					{!query.isLoading && !query.isError && !notice && (
						<p>수정할 공지글을 찾을 수 없습니다.</p>
					)}

					<TextField
						margin='dense'
						label='제목'
						required
						fullWidth
						value={form?.title ?? ''}
						onChange={event =>
							form &&
							setDraft({
								...form,
								title: event.target.value,
							})
						}
						disabled={!canEdit}
						error={!!errors.title}
						helperText={errors.title}
					/>
					<TextField
						label='본문'
						required
						fullWidth
						multiline
						minRows={5}
						value={form?.content ?? ''}
						onChange={event =>
							form &&
							setDraft({
								...form,
								content: event.target.value,
							})
						}
						disabled={!canEdit}
						error={!!errors.content}
						helperText={errors.content}
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
					<Button type='submit' disabled={!canEdit || !isDirty}>
						{mutation.isPending ? '저장 중...' : '저장'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default ModalUpdateNotice;
