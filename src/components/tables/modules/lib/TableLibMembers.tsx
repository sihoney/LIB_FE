import Table, { type ITableProps, type MRT_ColumnDef } from '@/src/components/ui/tables/Table';
import Button from '@/src/components/ui/buttons/Button';
import type { IMemberListItem, IMemberSearch, TMemberStatus } from '@/src/types/modules/lib/member';
import { useMemo } from 'react';

interface IProps extends Omit<ITableProps<IMemberListItem, IMemberSearch>, 'columns'> {
	disabled?: boolean;
	onUpdate(member: IMemberListItem): void;
}

export const useColumns = ({ disabled, onUpdate }: Pick<IProps, 'disabled' | 'onUpdate'>) =>
	useMemo<MRT_ColumnDef<IMemberListItem>[]>(
		() => [
			{
				accessorKey: 'name',
				header: '이름',
			},
			{
				accessorKey: 'phone',
				header: '연락처',
			},
			{
				accessorKey: 'email',
				header: '이메일',
			},
			{
				accessorKey: 'status',
				header: '상태',
				Cell: ({ cell }) => (cell.getValue<TMemberStatus>() === 'ACTIVE' ? '정상' : '탈퇴'),
			},
			{
				accessorKey: 'joinedAt',
				header: '가입일',
				Cell: ({ cell }) => cell.getValue<string>().slice(0, 10),
			},
			{
				accessorKey: 'withdrawnAt',
				header: '탈퇴일',
				Cell: ({ cell }) => cell.getValue<string | null>()?.slice(0, 10) ?? '-',
			},
			{
				id: 'actions',
				header: '관리',
				enableSorting: false,
				Cell: ({ row }) => (
					<Button
						type='button'
						variant='outlined'
						disabled={disabled}
						onClick={() => onUpdate(row.original)}
					>
						수정
					</Button>
				),
			},
		],
		[disabled, onUpdate],
	);

// TableLibMembers 담당
// - 회원 목록 컬럼 정의
// - 상태 코드의 `정상`·`탈퇴` 표시
// - 가입일·탈퇴일 표시 형식
// - 공통 `Table`에 컬럼과 props 전달

const TableLibMembers = ({ disabled, onUpdate, ...props }: IProps) => {
	const columns = useColumns({ disabled, onUpdate });

	return <Table<IMemberListItem, IMemberSearch> columns={columns} {...props} />;
};

export default TableLibMembers;
