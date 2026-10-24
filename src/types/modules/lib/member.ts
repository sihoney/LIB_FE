import type { MEMBER_SORT_COLUMNS, MEMBER_STATUSES } from '@/src/consts/modules/lib/member';
import type { IRequestBody, IResponseBody, ISorting } from '@/src/types/common/repository';

export type TMemberStatus = (typeof MEMBER_STATUSES)[number];

// TMemberSortColumn: 정렬 데이터의 타입
export type TMemberSortColumn = (typeof MEMBER_SORT_COLUMNS)[number];

// 계정 인증 계약은 sys에서 확정한다. Member는 연결 키만 보관한다.
export interface IMember {
	id: number;
	accountId: number;
	name: string;
	phone: string;
	email: string;
	status: TMemberStatus;
	joinedAt: string;
	withdrawnAt: string | null;
}

// 목록은 계정 식별자를 노출하지 않고 회원 업무 정보만 전달한다.
export type IMemberListItem = Omit<IMember, 'accountId'>;

export interface IMemberSearch {
	name?: string;
	phone?: string;
	status?: TMemberStatus;
}

// 계정 연결은 sys 인증 구현에서 확정한다. 회원 등록 단계에서는 업무 정보만 받는다.
export interface IMemberCreate {
	name: string;
	phone: string;
	email: string;
}
export interface IMemberUpdate extends IMemberCreate {
	id: number;
}

export interface IMemberDelete {
	id: number;
}

// '정렬 가능한 컬럼'을 제한하는 타입
export type IMemberSorting = ISorting & {
	columName: TMemberSortColumn;
};

export type IMemberListRequest = Omit<IRequestBody<IMemberSearch>, 'sortings'> & {
	sortings?: IMemberSorting[];
};

export type IMemberListResponse = IResponseBody<IMemberListItem[]> & {
	totalRecords: number;
};
