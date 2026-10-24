import { Dialog, DialogActions, DialogContent, DialogTitle, type DialogProps } from '@mui/material';
import type { ReactNode, SubmitEventHandler } from 'react';
import Button from '@/src/components/ui/buttons/Button';
import Form from '@/src/components/ui/forms/Form';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

export type TModalConfirmHandler<T extends FieldValues = FieldValues> = (
	values: T,
) => unknown | Promise<unknown>;

export interface IModalProps<T extends FieldValues = FieldValues> {
	open: boolean;
	title: string;
	children: ReactNode;
	formProps: {
		form: UseFormReturn<T>;
	};
	onConfirm: TModalConfirmHandler<T>;
	onClose(): void;
	maxWidth?: DialogProps['maxWidth'];
	confirmLabel?: string;
}

export interface IModalBaseProps<T = unknown> {
	open: boolean;
	data: T;
	onClose(): void;
}

// MES_FE의 Modal과 같은 책임을 최소 범위로 구현합니다.
// 업무 모달은 입력 필드·스키마·mutation만 제공하고, Modal은 제출·닫기·버튼을 맡습니다.
const Modal = <T extends FieldValues = FieldValues>({
	open,
	title,
	children,
	formProps,
	onConfirm,
	onClose,
	maxWidth = 'sm',
	confirmLabel = '저장',
}: IModalProps<T>) => {
	const { form } = formProps;
	const { isSubmitting } = form.formState;

	const handleClose = () => {
		if (!isSubmitting) onClose();
	};

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = event => {
		void form.handleSubmit(async values => {
			try {
				await onConfirm(values);
				form.reset();
				onClose();
			} catch {
				// mutation 오류 표시는 업무 모달의 mutation.isError가 담당합니다.
			}
		})(event);
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth={maxWidth}>
			<Form onSubmit={handleSubmit}>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent className='flex flex-col gap-4'>{children}</DialogContent>
				<DialogActions>
					<Button
						type='button'
						variant='outlined'
						disabled={isSubmitting}
						onClick={handleClose}
					>
						취소
					</Button>
					<Button type='submit' disabled={isSubmitting}>
						{isSubmitting ? '저장 중...' : confirmLabel}
					</Button>
				</DialogActions>
			</Form>
		</Dialog>
	);
};

export default Modal;
