import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import { BOOK_CATEGORIES, BOOK_LIST_META, BOOK_MODULE } from '@/src/consts/modules/lib/book';
import { books } from '@/src/mocks/data/modules/lib/books';
import { loans } from '@/src/mocks/data/modules/lib/loans';
import { getBookAvailableQuantity } from '@/src/mocks/utils/modules/lib/book';
import type { IBookListRequest, IBookListResponse } from '@/src/types/modules/lib/book';
import { delay, http, HttpResponse } from 'msw';

const apiBase = new URL(`${ENV_API_BASE_URL.replace(/\/$/, '')}/`, window.location.origin);
const endpoint = new URL(
	`v2/${BOOK_MODULE}/${BOOK_LIST_META.signature}/${BOOK_LIST_META.functionCode}/GetData`,
	apiBase,
).href;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

// TypeScript 타입과 별개로 HTTP 경계에서 실제 입력을 검사합니다.
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

export const bookHandlers = [
	http.post(endpoint, async ({ request }) => {
		const body: unknown = await request.json().catch(() => undefined);
		await delay(350);
		if (!isBookListRequest(body)) {
			return HttpResponse.json<IBookListResponse>({
				success: false,
				returnMess: '검색 조건과 페이지 값을 확인해 주세요.',
				returnMessCode: 'INVALID_BOOK_LIST_REQUEST',
				data: [],
				totalRecords: 0,
			});
		}
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
];
