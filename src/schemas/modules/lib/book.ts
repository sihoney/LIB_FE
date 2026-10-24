import {
	BOOK_AUTHOR_MAX_LENGTH,
	BOOK_CATEGORIES,
	BOOK_TITLE_MAX_LENGTH,
} from '@/src/consts/modules/lib/book';
import type { TBookCategory } from '@/src/types/modules/lib/book';
import z from 'zod';

const bookCategoryCodes = Object.keys(BOOK_CATEGORIES) as [TBookCategory, ...TBookCategory[]];

export const schemaCreateBook = z.object({
	title: z
		.string()
		.trim()
		.min(1, '제목을 입력해 주세요.')
		.max(BOOK_TITLE_MAX_LENGTH, `제목은 ${BOOK_TITLE_MAX_LENGTH}자 이하여야 합니다.`),
	author: z
		.string()
		.trim()
		.min(1, '저자를 입력해 주세요.')
		.max(BOOK_AUTHOR_MAX_LENGTH, `저자는 ${BOOK_AUTHOR_MAX_LENGTH}자 이하여야 합니다.`),
	category: z.enum(bookCategoryCodes, '분류를 선택해 주세요.'),
	totalQuantity: z.coerce
		.number<number>()
		.int('보유 수량은 0 이상의 정수여야 합니다.')
		.min(0, '보유 수량은 0 이상의 정수여야 합니다.'),
});

export interface ISchemaCreateBook extends z.infer<typeof schemaCreateBook> {}

export const schemaUpdateBook = schemaCreateBook.extend({
	id: z.number().int().positive(),
});

export interface ISchemaUpdateBook extends z.infer<typeof schemaUpdateBook> {}
