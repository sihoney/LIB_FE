export const BOOK_CATEGORIES = {
	LITERATURE: '문학',
	SCIENCE: '과학',
	HISTORY: '역사',
	OTHER: '기타',
} as const;

export const BOOK_TITLE_MAX_LENGTH = 200;
export const BOOK_AUTHOR_MAX_LENGTH = 100;

export const BOOK_MODULE = 'Lib';

export const BOOK_LIST_META = {
	signature: 'Book',
	functionCode: 'GetBookList',
} as const;
