import {
	BOOK_CREATE_META,
	BOOK_LIST_META,
	BOOK_MODULE,
	BOOK_UPDATE_META,
} from '@/src/consts/modules/lib/book';
import type HttpClient from '@/src/networks/httpClient';
import type {
	IBookListItem,
	IBookListRequest,
	IBookListResponse,
	IBookSearch,
	IBook,
	IBookCreate,
	IBookUpdate,
} from '@/src/types/modules/lib/book';
import type { IRequestBody } from '@/src/types/common/repository';

export default class BookRepository {
	constructor(private readonly httpClient: HttpClient) {}

	public getBookList = async (
		body: IBookListRequest,
		signal?: AbortSignal,
	): Promise<IBookListResponse> => {
		const response = await this.httpClient.get<IBookSearch, IBookListItem[]>({
			url: BOOK_MODULE,
			meta: BOOK_LIST_META,
			body,
			signal,
		});

		// 공통 응답의 선택 필드를 도서 목록에서는 필수 계약으로 확인합니다.
		const totalRecords = response.totalRecords;
		if (
			typeof totalRecords !== 'number' ||
			!Number.isSafeInteger(totalRecords) ||
			totalRecords < 0
		) {
			throw new Error('도서 목록 응답의 전체 건수가 올바르지 않습니다.');
		}

		return { ...response, totalRecords };
	};

	public postBook = (body: IRequestBody<IBookCreate>) =>
		this.httpClient.post<IBookCreate, IBook>({
			url: BOOK_MODULE,
			meta: BOOK_CREATE_META,
			body,
		});

	// patch는 부분 수정 역할 이름이며, MES 규약에 따라 실제 요청은 POST입니다.
	public patchBook = (body: IRequestBody<IBookUpdate>) =>
		this.httpClient.patch<IBookUpdate, IBook>({
			url: BOOK_MODULE,
			meta: BOOK_UPDATE_META,
			body,
		});
}
