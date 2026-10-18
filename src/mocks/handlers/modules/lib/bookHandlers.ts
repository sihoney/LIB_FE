import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import {
	BOOK_AUTHOR_MAX_LENGTH,
	BOOK_CATEGORIES,
	BOOK_CREATE_META,
	BOOK_DELETE_META,
	BOOK_LIST_META,
	BOOK_MODULE,
	BOOK_SORT_COLUMNS,
	BOOK_TITLE_MAX_LENGTH,
	BOOK_UPDATE_META,
} from '@/src/consts/modules/lib/book';
import { books } from '@/src/mocks/data/modules/lib/books';
import { loans } from '@/src/mocks/data/modules/lib/loans';
import {
	getBookAvailableQuantity,
	getBookOutstandingQuantity,
} from '@/src/mocks/utils/modules/lib/book';
import type {
	IBook,
	IBookCreate,
	IBookDelete,
	IBookListItem,
	IBookListRequest,
	IBookListResponse,
	IBookSorting,
	TBookSortColumn,
	IBookUpdate,
} from '@/src/types/modules/lib/book';
import type { IResponseBody } from '@/src/types/common/repository';
import { delay, http, HttpResponse } from 'msw';

const apiBase = new URL(`${ENV_API_BASE_URL.replace(/\/$/, '')}/`, window.location.origin);
const endpoint = new URL(
	`v2/${BOOK_MODULE}/${BOOK_LIST_META.signature}/${BOOK_LIST_META.functionCode}/GetData`,
	apiBase,
).href;
const createEndpoint = new URL(
	`v2/${BOOK_MODULE}/${BOOK_CREATE_META.signature}/${BOOK_CREATE_META.functionCode}/Update`,
	apiBase,
).href;
const updateEndpoint = new URL(
	`v2/${BOOK_MODULE}/${BOOK_UPDATE_META.signature}/${BOOK_UPDATE_META.functionCode}/Update`,
	apiBase,
).href;
const deleteEndpoint = new URL(
	`v2/${BOOK_MODULE}/${BOOK_DELETE_META.signature}/${BOOK_DELETE_META.functionCode}/Update`,
	apiBase,
).href;

// isRecord:
// - value가 객체 형태의 JSON 데이터인지 검사
// - request.json() 결과는 런타임에 무엇이 올지 확신할 수 없어 처음에는 unknown
// - isRecord를 통과한 뒤, value.data, value.is 처럼 속성에 안전하게 접근
const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const bookSortColumns = new Set<TBookSortColumn>(BOOK_SORT_COLUMNS);

const isBookSortings = (value: unknown): value is IBookSorting[] => {
	if (value === undefined) return true;
	if (!Array.isArray(value)) return false;
	const columns = new Set<string>();
	return value.every(sorting => {
		if (!isRecord(sorting)) return false;
		const { columName, typeSorting } = sorting;
		if (
			typeof columName !== 'string' ||
			!bookSortColumns.has(columName as TBookSortColumn) ||
			(typeSorting !== 'ASC' && typeSorting !== 'DESC') ||
			columns.has(columName)
		)
			return false;
		columns.add(columName);
		return true;
	});
};

// TypeScript 타입과 별개로 HTTP 경계에서 실제 입력을 검사합니다. (서버 입력값 검증)
const isBookListRequest = (value: unknown): value is IBookListRequest => {
	if (!isRecord(value)) return false;

	for (const key of ['skip', 'take']) {
		const number = value[key];
		if (
			number !== undefined &&
			(typeof number !== 'number' || !Number.isSafeInteger(number) || number < 0)
		)
			return false;
	}
	if (!isBookSortings(value.sortings)) return false;
	if (value.data === undefined) return true;
	if (!isRecord(value.data)) return false;

	const { title, author, category } = value.data;
	return (
		(title === undefined || typeof title === 'string') &&
		(author === undefined || typeof author === 'string') &&
		(category === undefined ||
			(typeof category === 'string' && Object.hasOwn(BOOK_CATEGORIES, category)))
	);
};

const compareBookListItems = (
	left: IBookListItem,
	right: IBookListItem,
	sortings: IBookSorting[],
) => {
	for (const sorting of sortings) {
		const leftValue = left[sorting.columName];
		const rightValue = right[sorting.columName];
		const compared =
			typeof leftValue === 'string' && typeof rightValue === 'string'
				? leftValue.localeCompare(rightValue)
				: Number(leftValue) - Number(rightValue);
		if (compared !== 0) return sorting.typeSorting === 'ASC' ? compared : -compared;
	}

	return left.id - right.id;
};

const getBookCreateData = (value: unknown): IBookCreate | null => {
	// 객체 타입 검사
	if (!isRecord(value) || !isRecord(value.data)) return null;

	const { title, author, category, totalQuantity } = value.data;

	// data 타입 검사
	if (
		typeof title !== 'string' ||
		typeof author !== 'string' ||
		typeof category !== 'string' ||
		typeof totalQuantity !== 'number'
	)
		return null;

	// trim 후 값 유효성 검사(길이, 빈 문자열, 카테고리 범위, 숫자 범위)
	const trimmedTitle = title.trim();
	const trimmedAuthor = author.trim();
	if (
		!trimmedTitle ||
		trimmedTitle.length > BOOK_TITLE_MAX_LENGTH ||
		!trimmedAuthor ||
		trimmedAuthor.length > BOOK_AUTHOR_MAX_LENGTH ||
		!Object.hasOwn(BOOK_CATEGORIES, category) ||
		!Number.isSafeInteger(totalQuantity) ||
		totalQuantity < 0
	)
		return null;

	return {
		title: trimmedTitle,
		author: trimmedAuthor,
		category: category as IBookCreate['category'],
		totalQuantity,
	};
};

const getBookUpdateData = (value: unknown): IBookUpdate | null => {
	if (!isRecord(value) || !isRecord(value.data)) return null;
	const id = value.data.id;
	const createData = getBookCreateData(value);
	if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0 || !createData) return null;
	return { id, ...createData };
};

const getBookDeleteData = (value: unknown): IBookDelete | null => {
	if (!isRecord(value) || !isRecord(value.data)) return null;
	const id = value.data.id;
	if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) return null;
	return { id };
};

export const bookHandlers = [
	// [1] 도서 목록 조회
	http.post(endpoint, async ({ request }) => {
		// request json 처리
		const body: unknown = await request.json().catch(() => undefined);

		// 지연 처리
		await delay(350);

		// 입력 검사
		if (!isBookListRequest(body)) {
			return HttpResponse.json<IBookListResponse>({
				success: false,
				returnMess: '검색 조건과 페이지 값을 확인해 주세요.',
				returnMessCode: 'INVALID_BOOK_LIST_REQUEST',
				data: [],
				totalRecords: 0,
			});
		}

		// 검색 조건 적용 (제목, 저자, 카테고리)
		const title = body.data?.title?.trim().toLocaleLowerCase() ?? '';
		const author = body.data?.author?.trim().toLocaleLowerCase() ?? '';
		const category = body.data?.category;
		const rows = books.filter(
			book =>
				!book.isDeleted &&
				book.title.toLocaleLowerCase().includes(title) &&
				book.author.toLocaleLowerCase().includes(author) &&
				(category === undefined || book.category === category),
		);

		// sorting
		const listItems = rows
			.map(book => ({
				id: book.id,
				title: book.title,
				author: book.author,
				category: book.category,
				totalQuantity: book.totalQuantity,
				availableQuantity: getBookAvailableQuantity(book, loans),
			}))
			.sort((left, right) => compareBookListItems(left, right, body.sortings ?? []));

		// 페이지네이션 처리
		const skip = body.skip ?? 0;
		const take = body.take ?? 20;
		const data = take === 0 ? listItems.slice(skip) : listItems.slice(skip, skip + take);

		// 저장 정보에서 필요한 필드와 계산한 가용 수량만 목록 DTO로 반환합니다.
		return HttpResponse.json<IBookListResponse>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data,
			totalRecords: listItems.length,
		});
	}),

	// [2] 도서 등록
	http.post(createEndpoint, async ({ request }) => {
		// request json 처리 & 입력값 검증 및 trim
		const data = getBookCreateData(await request.json().catch(() => undefined));

		await delay(350);

		// 입력값 검증 실패 시
		// 등록 화면 검증과 별개로 HTTP 경계에서 도서 정책을 다시 검사합니다.
		if (!data) {
			return HttpResponse.json<IResponseBody<IBook | null>>({
				success: false,
				returnMess: `제목은 1~${BOOK_TITLE_MAX_LENGTH}자, 저자는 1~${BOOK_AUTHOR_MAX_LENGTH}자이며 분류와 보유 수량을 확인해 주세요.`,
				returnMessCode: 'INVALID_BOOK_CREATE_REQUEST',
				data: null,
			});
		}

		const book: IBook = {
			id: Math.max(0, ...books.map(item => item.id)) + 1,
			...data,
			isDeleted: false,
		};
		books.push(book);

		return HttpResponse.json<IResponseBody<IBook>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data: book,
		});
	}),

	// [3] 도서 수정: 목록 재고 계산과 동일한 미반납 수량보다 보유 수량을 낮출 수 없습니다.
	http.post(updateEndpoint, async ({ request }) => {
		const data = getBookUpdateData(await request.json().catch(() => undefined));

		await delay(350);

		// 입력값 검증 실패 시
		if (!data) {
			return HttpResponse.json<IResponseBody<IBook | null>>({
				success: false,
				returnMess: '도서 ID와 제목·저자·분류·보유 수량을 확인해 주세요.',
				returnMessCode: 'INVALID_BOOK_UPDATE_REQUEST',
				data: null,
			});
		}

		// 404, 해당 도서 정보가 없는 경우
		const index = books.findIndex(book => book.id === data.id && !book.isDeleted);
		if (index < 0) {
			return HttpResponse.json<IResponseBody<IBook | null>>({
				success: false,
				returnMess: '수정할 도서를 찾을 수 없습니다.',
				returnMessCode: 'BOOK_NOT_FOUND',
				data: null,
			});
		}

		const outstandingQuantity = getBookOutstandingQuantity(data.id, loans);
		if (data.totalQuantity < outstandingQuantity) {
			return HttpResponse.json<IResponseBody<IBook | null>>({
				success: false,
				returnMess: `보유 수량은 현재 대출 중인 ${outstandingQuantity}권보다 작을 수 없습니다.`,
				returnMessCode: 'BOOK_QUANTITY_BELOW_OUTSTANDING',
				data: null,
			});
		}
		const updated: IBook = {
			...books[index],
			...data,
		};
		books[index] = updated;
		return HttpResponse.json<IResponseBody<IBook>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data: updated,
		});
	}),

	// [4] 도서 삭제: 대출 이력 보존을 위해 행은 남기고 목록 조회에서만 제외합니다.
	http.post(deleteEndpoint, async ({ request }) => {
		const data = getBookDeleteData(await request.json().catch(() => undefined));

		await delay(350);

		if (!data) {
			return HttpResponse.json<IResponseBody<IBook | null>>({
				success: false,
				returnMess: '삭제할 도서 ID를 확인해 주세요.',
				returnMessCode: 'INVALID_BOOK_DELETE_REQUEST',
				data: null,
			});
		}

		const index = books.findIndex(book => book.id === data.id && !book.isDeleted);
		if (index < 0) {
			return HttpResponse.json<IResponseBody<IBook | null>>({
				success: false,
				returnMess: '삭제할 도서를 찾을 수 없습니다.',
				returnMessCode: 'BOOK_NOT_FOUND',
				data: null,
			});
		}

		if (getBookOutstandingQuantity(data.id, loans) > 0) {
			return HttpResponse.json<IResponseBody<IBook | null>>({
				success: false,
				returnMess: '미반납 대출이 있는 도서는 삭제할 수 없습니다.',
				returnMessCode: 'BOOK_HAS_OUTSTANDING_LOANS',
				data: null,
			});
		}

		books[index] = {
			...books[index],
			isDeleted: true,
		};
		return HttpResponse.json<IResponseBody<IBook>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data: books[index],
		});
	}),
];
