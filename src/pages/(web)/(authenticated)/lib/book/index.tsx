import { Alert, MenuItem, TextField, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import TableLibBooks from '@/src/components/tables/modules/lib/TableLibBooks';
import Button from '@/src/components/ui/buttons/Button';
import { BOOK_CATEGORIES } from '@/src/consts/modules/lib/book';
import useTableState from '@/src/hooks/common/table/useTableState';
import ModalCreateBook from '@/src/pages/(web)/(authenticated)/lib/book/-components/modals/ModalCreateBook';
import ModalDeleteBook from '@/src/pages/(web)/(authenticated)/lib/book/-components/modals/ModalDeleteBook';
import ModalUpdateBook from '@/src/pages/(web)/(authenticated)/lib/book/-components/modals/ModalUpdateBook';
import services from '@/src/services/services';
import type {
	IBookListItem,
	IBookSearch,
	IBookSorting,
	TBookCategory,
} from '@/src/types/modules/lib/book';

const PAGE_SIZE = 10;
const emptyDraft = {
	title: '',
	author: '',
	category: '' as TBookCategory | '',
};

const Component = () => {
	// 입력 중인 검색 초안은 Page에, 실제 조회 조건은 useTableState에 둔다.
	const [draft, setDraft] = useState(emptyDraft);
	const [createBook, setCreateBook] = useState(false);
	const [updateBook, setUpdateBook] = useState<IBookListItem | null>(null);
	const [deleteBook, setDeleteBook] = useState<IBookListItem | null>(null);
	const tableState = useTableState<IBookSearch, IBookSorting>({
		take: PAGE_SIZE,
	});
	const query = services.bookService.useGetBookList(tableState.requestBody);
	const totalRecords = query.data?.totalRecords ?? 0;
	const isBusy = query.isFetching;

	const applySearch = (data: IBookSearch) => {
		if (tableState.submit(data)) {
			// 같은 조건으로 다시 검색해도 조회 의도를 존중해 직접 refetch()
			void query.refetch();
		}
	};

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (isBusy) return;

		applySearch({
			title: draft.title.trim() || undefined,
			author: draft.author.trim() || undefined,
			category: draft.category || undefined,
		});
	};

	const handleReset = () => {
		if (isBusy) return;

		setDraft(emptyDraft);
		applySearch({});
	};

	return (
		<section>
			<Typography component='h1' variant='h4' className='mb-4 font-bold'>
				도서 목록
			</Typography>

			<form onSubmit={handleSearch} className='my-4 flex flex-wrap items-start gap-3'>
				<TextField
					label='제목'
					size='small'
					value={draft.title}
					onChange={event =>
						setDraft(previous => ({ ...previous, title: event.target.value }))
					}
				/>
				<TextField
					label='저자'
					size='small'
					value={draft.author}
					onChange={event =>
						setDraft(previous => ({ ...previous, author: event.target.value }))
					}
				/>
				<TextField
					select
					label='분류'
					size='small'
					className='min-w-32'
					value={draft.category}
					onChange={event =>
						setDraft(previous => ({
							...previous,
							category: event.target.value as TBookCategory | '',
						}))
					}
				>
					<MenuItem value=''>전체</MenuItem>
					{Object.entries(BOOK_CATEGORIES).map(([code, label]) => (
						<MenuItem key={code} value={code}>
							{label}
						</MenuItem>
					))}
				</TextField>

				<Button type='submit' disabled={isBusy}>
					검색
				</Button>
				<Button type='button' disabled={isBusy} onClick={handleReset}>
					초기화
				</Button>
				<Button type='button' disabled={isBusy} onClick={() => void query.refetch()}>
					새로고침
				</Button>
				<Button type='button' disabled={isBusy} onClick={() => setCreateBook(true)}>
					등록
				</Button>
			</form>

			{createBook && (
				<ModalCreateBook open={createBook} onClose={() => setCreateBook(false)} />
			)}
			{updateBook && (
				<ModalUpdateBook
					key={updateBook.id}
					open
					data={updateBook}
					onClose={() => setUpdateBook(null)}
				/>
			)}
			{deleteBook && (
				<ModalDeleteBook open data={deleteBook} onClose={() => setDeleteBook(null)} />
			)}

			{isBusy && (
				<p role='status'>
					{query.isPlaceholderData
						? '새 결과를 불러오는 중입니다. 이전 조회 결과를 표시합니다.'
						: '도서를 불러오고 있습니다.'}
				</p>
			)}
			{query.isError && (
				<Alert
					severity='error'
					action={
						<Button
							type='button'
							disabled={isBusy}
							onClick={() => void query.refetch()}
						>
							다시 시도
						</Button>
					}
				>
					{query.data
						? '새로고침에 실패했습니다. 이전 조회 결과를 표시합니다.'
						: '도서 목록을 불러오지 못했습니다.'}
				</Alert>
			)}

			<p className='my-3'>
				{query.isPlaceholderData || query.isError ? '이전 결과' : '검색 결과'}:{' '}
				{totalRecords}건
			</p>

			<TableLibBooks
				tableState={tableState}
				data={query.data?.data ?? []}
				rowCount={totalRecords}
				state={{
					isLoading: query.isLoading,
					showProgressBars: query.isFetching,
				}}
				getRowId={book => String(book.id)}
				disabled={isBusy}
				onUpdate={setUpdateBook}
				onDelete={setDeleteBook}
			/>
		</section>
	);
};

export const Route = createFileRoute('/(web)/(authenticated)/lib/book/')({
	staticData: { title: '도서 목록' },
	component: Component,
});
