import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import {
	BOOK_AUTHOR_MAX_LENGTH,
	BOOK_CATEGORIES,
	BOOK_CREATE_META,
	BOOK_LIST_META,
	BOOK_MODULE,
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
	IBookListRequest,
	IBookListResponse,
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

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

const getBookCreateData = (value: unknown): IBookCreate | null => {
	if (!isRecord(value) || !isRecord(value.data)) return null;

	const { title, author, category, totalQuantity } = value.data;

	if (
		typeof title !== 'string' ||
		typeof author !== 'string' ||
		typeof category !== 'string' ||
		typeof totalQuantity !== 'number'
	)
		return null;

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
		const rows = books
			.filter(
				book =>
					!book.isDeleted &&
					book.title.toLocaleLowerCase().includes(title) &&
					book.author.toLocaleLowerCase().includes(author) &&
					(category === undefined || book.category === category),
			)
			.sort((a, b) => a.id - b.id);

		// 페이지네이션 처리
		const skip = body.skip ?? 0;
		const take = body.take ?? 20;
		const page = take === 0 ? rows.slice(skip) : rows.slice(skip, skip + take);

		// 저장 정보에서 필요한 필드와 계산한 가용 수량만 목록 DTO로 반환합니다.
		const data = page.map(book => ({
			id: book.id,
			title: book.title,
			author: book.author,
			category: book.category,
			totalQuantity: book.totalQuantity,
			availableQuantity: getBookAvailableQuantity(book, loans),
		}));

		return HttpResponse.json<IBookListResponse>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data,
			totalRecords: rows.length,
		});
	}),

	// [2] 도서 등록
	http.post(createEndpoint, async ({ request }) => {
		// request json 처리 & 입력값 검증 및 trim
		const data = getBookCreateData(await request.json().catch(() => undefined));

		await delay(350);

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
		if (!data) {
			return HttpResponse.json<IResponseBody<IBook | null>>({
				success: false,
				returnMess: '도서 ID와 제목·저자·분류·보유 수량을 확인해 주세요.',
				returnMessCode: 'INVALID_BOOK_UPDATE_REQUEST',
				data: null,
			});
		}
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
		const updated: IBook = { ...books[index], ...data };
		books[index] = updated;
		return HttpResponse.json<IResponseBody<IBook>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data: updated,
		});
	}),
];
