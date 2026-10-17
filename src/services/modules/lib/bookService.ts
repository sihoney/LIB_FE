import { BOOK_LIST_META, BOOK_MODULE } from '@/src/consts/modules/lib/book';
import type BookRepository from '@/src/repositories/modules/lib/bookRepository';
import type { IBookListRequest } from '@/src/types/modules/lib/book';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export default class BookService {
	constructor(private readonly bookRepository: BookRepository) {}

	public useGetBookList = (body: IBookListRequest) =>
		useQuery({
			queryKey: [BOOK_MODULE, BOOK_LIST_META.signature, BOOK_LIST_META.functionCode, body],
			queryFn: ({ signal }) => this.bookRepository.getBookList(body, signal),
			placeholderData: keepPreviousData,
		});
}
