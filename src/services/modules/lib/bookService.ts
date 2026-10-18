import { queryClient } from '@/src/contexts/QueryProvider';
import {
	BOOK_CREATE_META,
	BOOK_DELETE_META,
	BOOK_LIST_META,
	BOOK_MODULE,
	BOOK_UPDATE_META,
} from '@/src/consts/modules/lib/book';
import type BookRepository from '@/src/repositories/modules/lib/bookRepository';
import type {
	IBookCreate,
	IBookDelete,
	IBookListRequest,
	IBookUpdate,
} from '@/src/types/modules/lib/book';
import type { IRequestBody } from '@/src/types/common/repository';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

export default class BookService {
	constructor(private readonly bookRepository: BookRepository) {}

	public useGetBookList = (body: IBookListRequest) =>
		useQuery({
			queryKey: [BOOK_MODULE, BOOK_LIST_META.signature, BOOK_LIST_META.functionCode, body],
			queryFn: ({ signal }) => this.bookRepository.getBookList(body, signal),
			placeholderData: keepPreviousData,
		});

	public usePostBook = () =>
		useMutation({
			mutationKey: [BOOK_MODULE, BOOK_CREATE_META.signature, BOOK_CREATE_META.functionCode],
			mutationFn: (body: IRequestBody<IBookCreate>) => this.bookRepository.postBook(body),
			// 화면 목록을 직접 수정하지 않고, 모든 검색·페이지 목록을 다시 조회합니다.
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: [BOOK_MODULE, BOOK_LIST_META.signature, BOOK_LIST_META.functionCode],
				}),
		});

	public usePatchBook = () =>
		useMutation({
			mutationKey: [BOOK_MODULE, BOOK_UPDATE_META.signature, BOOK_UPDATE_META.functionCode],
			mutationFn: (body: IRequestBody<IBookUpdate>) => this.bookRepository.patchBook(body),
			// 등록과 같은 목록 Query를 무효화해 모든 검색·페이지 캐시를 다시 조회합니다.
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: [BOOK_MODULE, BOOK_LIST_META.signature, BOOK_LIST_META.functionCode],
				}),
		});

	public useDeleteBook = () =>
		useMutation({
			mutationKey: [BOOK_MODULE, BOOK_DELETE_META.signature, BOOK_DELETE_META.functionCode],
			mutationFn: (body: IRequestBody<IBookDelete>) => this.bookRepository.deleteBook(body),
			// 논리 삭제 뒤에도 화면 배열을 직접 바꾸지 않고, 현재 검색·페이지 목록을 다시 조회합니다.
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: [BOOK_MODULE, BOOK_LIST_META.signature, BOOK_LIST_META.functionCode],
				}),
		});
}
