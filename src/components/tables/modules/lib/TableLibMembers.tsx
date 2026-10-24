import Table, { type ITableProps, type MRT_ColumnDef } from '@/src/components/ui/tables/Table';
import type { IMemberListItem, IMemberSearch, TMemberStatus } from '@/src/types/modules/lib/member';
import { useMemo } from 'react';

type IProps = Omit<ITableProps<IMemberListItem, IMemberSearch>, 'columns'>;

export const useColumns = () =>
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
		],
		[],
	);

// TableLibMembers 담당
// - 회원 목록 컬럼 정의
// - 상태 코드의 `정상`·`탈퇴` 표시
// - 가입일·탈퇴일 표시 형식
// - 공통 `Table`에 컬럼과 props 전달

const TableLibMembers = (props: IProps) => {
	const columns = useColumns();

	return <Table<IMemberListItem, IMemberSearch> columns={columns} {...props} />;
};

export default TableLibMembers;
