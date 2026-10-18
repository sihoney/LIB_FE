import type { IRequestBody, ISorting } from '@/src/types/common/repository';
import { isEqual } from 'es-toolkit';
import type { MRT_PaginationState, MRT_SortingState } from 'material-react-table';
import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

export const ALL_PAGE_SIZE = 0;

export type ITableRequestBody<T extends object, S extends ISorting> = Omit<
	IRequestBody<T>,
	'sortings'
> & {
	sortings?: S[];
};

export interface ITableState<T extends object, S extends ISorting = ISorting> {
	requestBody: ITableRequestBody<T, S>;
	defaultValues?: T;
	defaultPageSize: number;
	pagination: MRT_PaginationState;
	sorting: MRT_SortingState;
	setPagination: Dispatch<SetStateAction<MRT_PaginationState>>;
	setSorting: Dispatch<SetStateAction<MRT_SortingState>>;
	setData(data: T): void;
	submit(values: T): boolean;
	resetState(): void;
}

export interface IUseTableState<T extends object, S extends ISorting = ISorting> extends Omit<
	IRequestBody<T>,
	'sortings'
> {
	defaultValues?: T;
	sortings?: S[];
}

const toSortings = <S extends ISorting>(sorting: MRT_SortingState): S[] =>
	sorting.map(item => ({
		columName: item.id,
		typeSorting: item.desc ? 'DESC' : 'ASC',
	})) as S[];

const toMrtSorting = <S extends ISorting>(sortings: S[]): MRT_SortingState =>
	sortings.map(item => ({
		id: item.columName,
		desc: item.typeSorting === 'DESC',
	}));

const removeEmptyValues = <T extends object>(values: T): T =>
	Object.fromEntries(
		Object.entries(values).filter(
			([, value]) => value !== undefined && value !== null && value !== '',
		),
	) as T;

// useTableState 관리
// - 지금 몇 번째 페이지를 볼지
// - 페이지당 몇 권, 몇 명을 보여줄지
// - 어떤 열을 어떤 방향으로 정렬할지
// - 이름·연락처·상태 중 무엇으로 검색할지
//
// 이 정보를 모아 서버에 보낼 `requestBody`를 만듭니다.
// 화면용 상태(pageIndex, desc)를 서버 계약용 상태인 skip, typeSorting으로 바꾸는 번역가, 조회 상태 관리자

// MES useTableState의 목록 핵심만 유지한다. 개인화·컬럼 필터·차트는 실제 요구가 생길 때 추가한다.
const useTableState = <T extends object, S extends ISorting = ISorting>({
	take = 20,
	skip = 0,
	data: initialRequestData,
	sortings = [],
	defaultValues,
}: IUseTableState<T, S>): ITableState<T, S> => {
	const [initialData] = useState(() => removeEmptyValues(initialRequestData ?? ({} as T)));
	const [data, setData] = useState(initialData);
	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: take,
	});
	const [sorting, setSorting] = useState<MRT_SortingState>(() => toMrtSorting(sortings));

	const requestBody = useMemo<ITableRequestBody<T, S>>(
		() => ({
			skip:
				pagination.pageSize === ALL_PAGE_SIZE
					? 0
					: skip + pagination.pageIndex * pagination.pageSize,
			take: pagination.pageSize === ALL_PAGE_SIZE ? 0 : pagination.pageSize,
			sortings: toSortings<S>(sorting),
			data: Object.keys(data).length > 0 ? data : undefined,
		}),
		[data, pagination, skip, sorting],
	);

	const setTableData = useCallback((nextData: T) => {
		setData(removeEmptyValues(nextData));
		setPagination(previous => ({ ...previous, pageIndex: 0 }));
	}, []);

	const resetState = useCallback(() => {
		setPagination(previous => ({ ...previous, pageIndex: 0 }));
		setSorting([]);
		setData(initialData);
	}, [initialData]);

	const submit = useCallback(
		(values: T): boolean => {
			const nextData = removeEmptyValues(values);
			const keyUnchanged =
				pagination.pageIndex === 0 && sorting.length === 0 && isEqual(data, nextData);

			setPagination(previous => ({ ...previous, pageIndex: 0 }));
			setSorting([]);
			setData(nextData);

			return keyUnchanged;
		},
		[data, pagination.pageIndex, sorting.length],
	);

	return {
		requestBody,
		defaultValues,
		defaultPageSize: take,
		pagination,
		sorting,
		setPagination,
		setSorting,
		setData: setTableData,
		submit,
		resetState,
	};
};

export default useTableState;
