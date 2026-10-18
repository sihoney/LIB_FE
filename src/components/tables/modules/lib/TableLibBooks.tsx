import Table, { type ITableProps, type MRT_ColumnDef } from '@/src/components/ui/tables/Table';
import Button from '@/src/components/ui/buttons/Button';
import { BOOK_CATEGORIES } from '@/src/consts/modules/lib/book';
import type { IBookListItem, IBookSearch, TBookCategory } from '@/src/types/modules/lib/book';
import { useMemo } from 'react';

interface IProps extends Omit<ITableProps<IBookListItem, IBookSearch>, 'columns'> {
	disabled?: boolean;
	onUpdate(book: IBookListItem): void;
	onDelete(book: IBookListItem): void;
}

export const useColumns = ({
	disabled,
	onUpdate,
	onDelete,
}: Pick<IProps, 'disabled' | 'onUpdate' | 'onDelete'>) =>
	useMemo<MRT_ColumnDef<IBookListItem>[]>(
		() => [
			{ accessorKey: 'title', header: '제목' },
			{ accessorKey: 'author', header: '저자' },
			{
				accessorKey: 'category',
				header: '분류',
				Cell: ({ cell }) => BOOK_CATEGORIES[cell.getValue<TBookCategory>()],
			},
			{ accessorKey: 'totalQuantity', header: '보유 수량' },
			{ accessorKey: 'availableQuantity', header: '가용 수량' },
			{
				id: 'loanAvailability',
				header: '대출 가능 여부',
				enableSorting: false,
				Cell: ({ row }) => (row.original.availableQuantity > 0 ? '대출 가능' : '대출 불가'),
			},
			{
				id: 'actions',
				header: '관리',
				enableSorting: false,
				Cell: ({ row }) => (
					<>
						<Button
							type='button'
							variant='outlined'
							disabled={disabled}
							onClick={() => onUpdate(row.original)}
						>
							수정
						</Button>
						<Button
							type='button'
							variant='outlined'
							disabled={disabled}
							onClick={() => onDelete(row.original)}
						>
							삭제
						</Button>
					</>
				),
			},
		],
		[disabled, onDelete, onUpdate],
	);

// 기존 Page의 헤더 정렬은 MRT가 처리한다. 헤더 클릭은 Table의 onSortingChange를 거쳐
// useTableState.setSorting을 갱신하고, 이 상태가 서버 sortings 계약으로 변환된다.
const TableLibBooks = ({ disabled, onUpdate, onDelete, ...props }: IProps) => {
	const columns = useColumns({ disabled, onUpdate, onDelete });

	return <Table<IBookListItem, IBookSearch> columns={columns} {...props} />;
};

export default TableLibBooks;
