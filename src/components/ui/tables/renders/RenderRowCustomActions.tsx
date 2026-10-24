import Button from '@/src/components/ui/buttons/Button';
import { useConfirm } from '@/src/contexts/ConfirmGuardProvider';
import type { MRT_Row, MRT_RowData } from 'material-react-table';

interface IProps<T extends MRT_RowData> {
	disabled?: boolean;
	onUpdateRow?: (row: T) => void;
	onDeleteRow?: (row: T) => void;
	isDeleteRowDisabled?: (row: T) => boolean;
}

// MES_FE의 RenderRowCustomActions와 같이 행 동작과 삭제 확인을 공통으로 맡깁니다.
// 실제 수정·삭제 요청과 업무 규칙은 Page가 전달하는 콜백에 남깁니다.
const RenderRowCustomActions = <T extends MRT_RowData>({
	row,
	disabled,
	onUpdateRow,
	onDeleteRow,
	isDeleteRowDisabled,
}: IProps<T> & { row: MRT_Row<T> }) => {
	const confirm = useConfirm();

	const handleDelete = async () => {
		if (
			!(await confirm({
				title: '삭제 확인',
				message: '선택한 항목을 삭제하시겠습니까?',
				confirmLabel: '삭제',
			}))
		)
			return;

		onDeleteRow?.(row.original);
	};

	return (
		<>
			{onUpdateRow && (
				<Button
					type='button'
					variant='outlined'
					disabled={disabled}
					onClick={() => onUpdateRow(row.original)}
				>
					수정
				</Button>
			)}
			{onDeleteRow && (
				<Button
					type='button'
					variant='outlined'
					disabled={disabled || isDeleteRowDisabled?.(row.original)}
					onClick={() => void handleDelete()}
				>
					삭제
				</Button>
			)}
		</>
	);
};

export default RenderRowCustomActions;
