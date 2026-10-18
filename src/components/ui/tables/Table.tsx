import type { ITableState } from '@/src/hooks/common/table/useTableState';
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
	type MRT_RowData,
	type MRT_TableOptions,
	type MRT_TableState,
} from 'material-react-table';

export type { MRT_ColumnDef, MRT_RowData, MRT_SortingState } from 'material-react-table';

type TTableState<T extends object> = Pick<
	ITableState<T>,
	'pagination' | 'sorting' | 'setPagination' | 'setSorting'
>;

// - `columns`: 무엇을 보여 줄지
// - `data`: 현재 페이지의 실제 행
// - `rowCount`: 전체 건수
// - `tableState`: 페이지·정렬 상태와 이를 바꾸는 방법
export interface ITableProps<T extends MRT_RowData, U extends object = object> {
	columns: MRT_ColumnDef<T>[];
	data: T[];
	rowCount?: number;
	tableState: TTableState<U>;
	state?: Pick<Partial<MRT_TableState<T>>, 'isLoading' | 'showProgressBars'>;
	getRowId?: MRT_TableOptions<T>['getRowId'];
}

// MES 공통 Table의 서버 목록 연결만 유지한다. 업무별 컬럼은 TableLibXxx가 정의한다.
const Table = <T extends MRT_RowData, U extends object = object>({
	columns,
	data,
	rowCount,
	tableState,
	state,
	getRowId,
}: ITableProps<T, U>) => {
	const { isLoading = false, showProgressBars = false } = state ?? {};

	const table = useMaterialReactTable<T>({
		columns,
		data,
		getRowId,
		// TODO: MUI의 palette.mode와 MRT의 baseBackgroundColor를 동기화한다.
		// 다크 모드에서 MUI 글자색은 밝지만 MRT 기본 배경은 흰색이어서 대비가 맞지 않는다.
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
		rowCount: rowCount ?? 0,
		state: {
			pagination: tableState.pagination,
			sorting: tableState.sorting,
			isLoading,
			showProgressBars,
		},
		// onPaginationChange, onSortingsChange:
		// - 페이지 버튼이나 정렬 헤더가 조작되면, useTableState에게 내용 전달
		onPaginationChange: tableState.setPagination,
		onSortingChange: tableState.setSorting,
		paginationDisplayMode: 'pages',
		muiPaginationProps: {
			rowsPerPageOptions: [10, 20, 50],
			showFirstButton: true,
			showLastButton: true,
		},
		positionToolbarAlertBanner: 'none',
		enableTopToolbar: false,
		enableColumnActions: false,
		enableColumnFilters: false,
		enableGlobalFilter: false,
		enableDensityToggle: false,
		enableFullScreenToggle: false,
		enableHiding: false,
		enableColumnOrdering: false,
		enableColumnPinning: false,
		enableGrouping: false,
		enableRowSelection: false,
	});

	return <MaterialReactTable table={table} />;
};

export default Table;
