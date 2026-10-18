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
	TableSortLabel,
	TextField,
	Typography,
} from '@mui/material';
import Button from '@/src/components/ui/buttons/Button';
import { MEMBER_STATUSES } from '@/src/consts/modules/lib/member';
import services from '@/src/services/services';
import type {
	IMemberSearch,
	IMemberSorting,
	TMemberSortColumn,
	TMemberStatus,
} from '@/src/types/modules/lib/member';

const PAGE_SIZE = 10;
const emptyDraft = {
	name: '',
	phone: '',
	status: '' as TMemberStatus | '',
};

const Component = () => {
	const [draft, setDraft] = useState(emptyDraft);
	const [search, setSearch] = useState<{
		data: IMemberSearch;
		pageIndex: number;
		sortings: IMemberSorting[];
	}>({
		data: {},
		pageIndex: 0,
		sortings: [],
	});

	const query = services.memberService.useGetMemberList({
		data: search.data,
		skip: search.pageIndex * PAGE_SIZE,
		take: PAGE_SIZE,
		sortings: search.sortings,
	});
	const totalRecords = query.data?.totalRecords ?? 0;
	const pageCount = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
	const isBusy = query.isFetching;

	const applySearch = (data: IMemberSearch) => {
		const sameConditions =
			search.data.name === data.name &&
			search.data.phone === data.phone &&
			search.data.status === data.status;

		if (sameConditions && search.pageIndex === 0 && search.sortings.length === 0)
			void query.refetch(); // '같은 조건으로 다시 검색' 의도 존중 -> 직접 refetch()
		else setSearch({ data, pageIndex: 0, sortings: [] }); // 첫 페이지로 변경, queryKey 변경(queryFn 호출)
	};

	const handleSort = (column: TMemberSortColumn) => {
		if (isBusy) return;

		const current = search.sortings[0];
		const nextSortings: IMemberSorting[] =
			current?.columName !== column
				? [{ columName: column, typeSorting: 'ASC' }]
				: current.typeSorting === 'ASC'
					? [{ columName: column, typeSorting: 'DESC' }]
					: [];

		setSearch(previous => ({ ...previous, pageIndex: 0, sortings: nextSortings }));
	};

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isBusy) return;

		applySearch({
			name: draft.name.trim() || undefined,
			phone: draft.phone.trim() || undefined,
			status: draft.status || undefined,
		});
		// trim() || undefined: 빈 문자열을 검색 조건을 보내지 않기 위해서
	};

	return (
		<section>
			<Typography component='h1' variant='h4' className='mb-4 font-bold'>
				회원 목록
			</Typography>

			<form onSubmit={handleSearch} className='my-4 flex flex-wrap items-start gap-3'>
				<TextField
					label='이름'
					size='small'
					value={draft.name}
					onChange={event =>
						setDraft(previous => ({ ...previous, name: event.target.value }))
					}
				/>
				<TextField
					label='연락처'
					size='small'
					value={draft.phone}
					onChange={event =>
						setDraft(previous => ({ ...previous, phone: event.target.value }))
					}
				/>
				<TextField
					select
					label='상태'
					size='small'
					className='min-w-32'
					value={draft.status}
					onChange={event =>
						setDraft(previous => ({
							...previous,
							status: event.target.value as TMemberStatus | '',
						}))
					}
				>
					<MenuItem value=''>전체</MenuItem>
					{MEMBER_STATUSES.map(status => (
						<MenuItem key={status} value={status}>
							{status === 'ACTIVE' ? '정상' : '탈퇴'}
						</MenuItem>
					))}
				</TextField>
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
			</form>

			{query.isLoading && <p role='status'>회원 목록을 불러오고 있습니다.</p>}
			{isBusy && !query.isLoading && (
				<p role='status'>이전 조회 결과를 표시하며 회원 목록을 갱신하고 있습니다.</p>
			)}

			{query.isError && (
				<Alert
					severity='error'
					action={
						<Button type='button' onClick={() => void query.refetch()}>
							다시 시도
						</Button>
					}
				>
					회원 목록을 불러오지 못했습니다.
				</Alert>
			)}

			{query.data && (
				<>
					<p className='my-3'>전체 {totalRecords}건</p>
					<TableContainer>
						<Table aria-label='회원 목록' size='small'>
							<TableHead>
								<TableRow>
									{(
										[
											['이름', 'name'],
											['연락처', 'phone'],
											['이메일', 'email'],
											['상태', 'status'],
											['가입일', 'joinedAt'],
										] as const
									).map(([label, column]) => {
										const sorting = search.sortings.find(
											item => item.columName === column,
										);
										const direction =
											sorting?.typeSorting === 'DESC' ? 'desc' : 'asc';

										return (
											<TableCell
												key={column}
												sortDirection={sorting ? direction : false}
											>
												<TableSortLabel
													active={!!sorting}
													direction={direction}
													disabled={isBusy}
													onClick={() => handleSort(column)}
												>
													{label}
												</TableSortLabel>
											</TableCell>
										);
									})}
									<TableCell>탈퇴일</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{query.data.data.map(member => (
									<TableRow key={member.id}>
										<TableCell component='th' scope='row'>
											{member.name}
										</TableCell>
										<TableCell>{member.phone}</TableCell>
										<TableCell>{member.email}</TableCell>
										<TableCell>
											{member.status === 'ACTIVE' ? '정상' : '탈퇴'}
										</TableCell>
										<TableCell>{member.joinedAt.slice(0, 10)}</TableCell>
										<TableCell>
											{member.withdrawnAt?.slice(0, 10) ?? '-'}
										</TableCell>
									</TableRow>
								))}
								{query.data.data.length === 0 && (
									<TableRow>
										<TableCell colSpan={6}>등록된 회원이 없습니다.</TableCell>
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

export const Route = createFileRoute('/(web)/(authenticated)/lib/member/')({
	staticData: { title: '회원 목록' },
	component: Component,
});
