import { useState, type FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
	Alert,
	MenuItem,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import Button from '@/src/components/ui/buttons/Button';
import { BOOK_CATEGORIES } from '@/src/consts/modules/lib/book';
import type { IBookListItem, IBookSearch, TBookCategory } from '@/src/types/modules/lib/book';
import services from '@/src/services/services';
import ModalCreateBook from '@/src/pages/(web)/(authenticated)/lib/book/-components/modals/ModalCreateBook';
import ModalUpdateBook from '@/src/pages/(web)/(authenticated)/lib/book/-components/modals/ModalUpdateBook';

const PAGE_SIZE = 10;
const emptyDraft = {
	title: '',
	author: '',
	category: '' as TBookCategory | '',
};

const Component = () => {
	// MES의 검색 폼 → 적용 조건 → requestBody 흐름을 먼저 페이지에서 구현합니다.
	// 일반 Outlet이므로 다른 화면으로 이동 후 돌아오면 로컬 상태는 초기화됩니다.
	const [draft, setDraft] = useState(emptyDraft);
	const [search, setSearch] = useState<{ data: IBookSearch; pageIndex: number }>({
		data: {},
		pageIndex: 0,
	});
	const [createBook, setCreateBook] = useState(false);
	const [updateBook, setUpdateBook] = useState<IBookListItem | null>(null);

	const query = services.bookService.useGetBookList({
		data: search.data,
		skip: search.pageIndex * PAGE_SIZE,
		take: PAGE_SIZE,
	});
	const totalRecords = query.data?.totalRecords ?? 0;
	const pageCount = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
	const isBusy = query.isFetching;

	const applySearch = (data: IBookSearch) => {
		const sameConditions =
			search.data.title === data.title &&
			search.data.author === data.author &&
			search.data.category === data.category;

		if (sameConditions && search.pageIndex === 0) void query.refetch();
		else setSearch({ data, pageIndex: 0 });
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

	return (
		<section>
			<Typography component='h1' variant='h4' className='mb-4 font-bold'>
				도서 목록
			</Typography>

			<form onSubmit={handleSearch} className='my-4 flex flex-wrap items-start gap-3'>
				{/* input 목록 */}
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

				{/* 버튼 목록 */}
				<Button type='submit' disabled={isBusy}>
					검색
				</Button>
				<Button
					type='button'
					disabled={isBusy}
					onClick={() => {
						setDraft(emptyDraft);
						applySearch({});
					}}
				>
					초기화
				</Button>
				<Button type='button' disabled={isBusy} onClick={() => void query.refetch()}>
					재조회
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
							재시도
						</Button>
					}
				>
					{query.data
						? '재조회에 실패했습니다. 이전 조회 결과를 표시합니다.'
						: '도서 목록을 불러오지 못했습니다.'}
				</Alert>
			)}

			{query.data && (
				<>
					<p className='my-3'>
						{query.isPlaceholderData || query.isError ? '이전 결과' : '검색 결과'}:{' '}
						{totalRecords}건
					</p>
					<TableContainer>
						<Table aria-label='도서 목록' size='small'>
							<TableHead>
								<TableRow>
									{[
										'제목',
										'저자',
										'분류',
										'보유 수량',
										'가용 수량',
										'대출 가능 여부',
										'관리',
									].map(label => (
										<TableCell key={label}>{label}</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{query.data.data.map(book => (
									<TableRow key={book.id}>
										<TableCell component='th' scope='row'>
											{book.title}
										</TableCell>
										<TableCell>{book.author}</TableCell>
										<TableCell>{BOOK_CATEGORIES[book.category]}</TableCell>
										<TableCell>{book.totalQuantity}</TableCell>
										<TableCell>{book.availableQuantity}</TableCell>
										<TableCell>
											{book.availableQuantity > 0 ? '대출 가능' : '대출 불가'}
										</TableCell>
										<TableCell>
											<Button
												type='button'
												variant='outlined'
												disabled={isBusy}
												onClick={() => setUpdateBook(book)}
											>
												수정
											</Button>
										</TableCell>
									</TableRow>
								))}

								{query.data.data.length === 0 && (
									<TableRow>
										<TableCell colSpan={7}>검색 결과가 없습니다.</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
					<Pagination
						className='mt-4'
						count={pageCount}
						page={search.pageIndex + 1}
						disabled={isBusy || totalRecords === 0}
						onChange={(_, page) =>
							setSearch(previous => ({ ...previous, pageIndex: page - 1 }))
						}
						getItemAriaLabel={(type, page) =>
							type === 'page'
								? `${page}페이지`
								: type === 'next'
									? '다음 페이지'
									: type === 'previous'
										? '이전 페이지'
										: type === 'first'
											? '첫 페이지'
											: '마지막 페이지'
						}
					/>
				</>
			)}
		</section>
	);
};

export const Route = createFileRoute('/(web)/(authenticated)/lib/book/')({
	staticData: { title: '도서 목록' },
	component: Component,
});
