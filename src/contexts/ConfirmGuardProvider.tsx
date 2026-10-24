import ModalConfirm from '@/src/components/ui/modals/ModalConfirm';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface IConfirmOptions {
	title?: string;
	message: string;
	confirmLabel?: string;
	closeLabel?: string;
}

export type TConfirm = (options: IConfirmOptions) => Promise<boolean>;

interface IPendingConfirm {
	options: IConfirmOptions;
	resolve: (result: boolean) => void;
}

interface IConfirmGuardContextValue {
	confirm: TConfirm;
}

const ConfirmGuardContext = createContext<IConfirmGuardContextValue | null>(null);

export const ConfirmGuardProvider = ({ children }: { children: ReactNode }) => {
	const [pending, setPending] = useState<IPendingConfirm | null>(null);

	const confirm = useCallback<TConfirm>(
		options =>
			new Promise<boolean>(resolve => {
				setPending(previous => {
					previous?.resolve(false);
					return { options, resolve };
				});
			}),
		[],
	);

	const close = useCallback((result: boolean) => {
		setPending(previous => {
			previous?.resolve(result);
			return null;
		});
	}, []);

	const value = useMemo(() => ({ confirm }), [confirm]);

	return (
		<ConfirmGuardContext.Provider value={value}>
			{children}
			<ModalConfirm
				open={Boolean(pending)}
				title={pending?.options.title ?? '확인'}
				message={pending?.options.message ?? ''}
				confirmLabel={pending?.options.confirmLabel ?? '확인'}
				closeLabel={pending?.options.closeLabel ?? '취소'}
				onConfirm={() => close(true)}
				onClose={() => close(false)}
			/>
		</ConfirmGuardContext.Provider>
	);
};

export const useConfirm = (): TConfirm => {
	const context = useContext(ConfirmGuardContext);
	if (!context) throw new Error('useConfirm must be used within a ConfirmGuardProvider');

	return context.confirm;
};
