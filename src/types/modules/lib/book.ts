import type { BOOK_CATEGORIES } from '@/src/consts/modules/lib/book';
import type { IRequestBody, IResponseBody } from '@/src/types/common/repository';

export type TBookCategory = keyof typeof BOOK_CATEGORIES;

// 저장 정보에는 대출 기록에서 계산하는 availableQuantity를 넣지 않습니다.
export interface IBook {
	id: number;
	title: string;
	author: string;
	category: TBookCategory;
	totalQuantity: number;
	isDeleted: boolean;
}

// 목록에는 삭제되지 않은 도서만 반환하므로 삭제 여부는 노출하지 않습니다.
export interface IBookListItem extends Omit<IBook, 'isDeleted'> {
	availableQuantity: number;
}

export interface IBookSearch {
	title?: string;
	author?: string;
	category?: TBookCategory;
}

// 등록 요청은 서버가 부여하는 ID·삭제 여부·계산 재고를 받지 않습니다.
export interface IBookCreate {
	title: string;
	author: string;
	category: TBookCategory;
	totalQuantity: number;
}

// 현재 수정 화면은 식별자와 저장 필드를 모두 전송합니다.
export interface IBookUpdate extends IBookCreate {
	id: number;
}

// 삭제는 ID만 전달하고, 실제 데이터는 논리 삭제 상태로 보존합니다.
export type IBookDelete = Pick<IBook, 'id'>;

export type IBookListRequest = IRequestBody<IBookSearch>;

// 공통 응답에서는 선택값이지만 도서 목록에서는 페이징 전 건수가 필수입니다.
export type IBookListResponse = IResponseBody<IBookListItem[]> & {
	totalRecords: number;
};
// & { totalRecords: number }:
// - 같은 필드를 필수로 다시 선언 (기존 totalRecords는 선택값, ?)
// - interface IBookListResponse extends IResponseBody<IBookListItem[]> {...} --> extends interface 형태로도 가능
