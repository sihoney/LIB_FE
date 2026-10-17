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

export type IBookListRequest = IRequestBody<IBookSearch>;

// 공통 응답에서는 선택값이지만 도서 목록에서는 페이징 전 건수가 필수입니다.
export type IBookListResponse = IResponseBody<IBookListItem[]> & {
	totalRecords: number;
};
