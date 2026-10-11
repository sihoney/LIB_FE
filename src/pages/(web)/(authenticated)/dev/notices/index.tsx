import ModalUpdateNotice from '@/src/pages/(web)/(authenticated)/dev/notices/-components/modals/ModalUpdateNotice';
import type { INotice } from '@/src/types/modules/dev/notice';
import ModalCreateNotice from '@/src/pages/(web)/(authenticated)/dev/notices/-components/modals/ModalCreateNotice';
import { useState, type FormEvent } from 'react';
import Button from '@/src/components/ui/buttons/Button';
import { Card, Pagination, TextField, Typography } from '@mui/material';
import services from '@/src/services/services';
import { createFileRoute, Link } from '@tanstack/react-router';

const PAGE_SIZE = 10;

const Component = () => {
	// TODO: 반복되는 모달 상태를 확인한 뒤 MES의 useModalState로 옮깁니다.
	const [createNotice, setCreateNotice] = useState(false);
	const [updateNotice, setUpdateNotice] = useState<INotice | null>(null);

	// 공통화 전에 입력값 → 적용 조건 → API 요청 흐름을 이 페이지에서 직접 학습합니다.
	// TODO: 두 번째 목록에서 반복을 확인한 뒤 MES의 검색 툴바·useTableState로 옮깁니다.
	const [draftTitle, setDraftTitle] = useState('');
	const [search, setSearch] = useState({ title: '', pageIndex: 0 });
	const query = services.noticeService.useGetNoticeList({
		data: search.title ? { title: search.title } : {},
		skip: search.pageIndex * PAGE_SIZE,
		take: PAGE_SIZE,
	});
	const totalRecords = query.data?.totalRecords ?? 0;
	const pageCount = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (query.isFetching) return;
		const title = draftTitle.trim();
		// 같은 조건·첫 페이지이면 queryKey가 바뀌지 않으므로 직접 재조회합니다.
		if (search.title === title && search.pageIndex === 0) {
			void query.refetch();
		} else {
			setSearch({ title, pageIndex: 0 });
		}
	};
	const handleReset = () => {
		if (query.isFetching) return;
		setDraftTitle('');
		// 입력값과 조회 조건을 함께 초기화합니다. 이미 초기 조건이면 다시 요청합니다.
		if (search.title === '' && search.pageIndex === 0) {
			void query.refetch();
		} else {
			setSearch({ title: '', pageIndex: 0 });
		}
	};

	// 첫 조회 실패는 Router가 처리
	// 재조회 실패 시, 기존 목록을 보존
	if (query.isError && !query.data) throw query.error;

	return (
		<section>
			<Typography component='h1' variant='h4' className='mb-4 font-bold'>
				테스트용 공지글
			</Typography>

			<form onSubmit={handleSearch} className='my-4 flex flex-wrap items-start gap-3'>
				<TextField
					label='제목 검색'
					size='small'
					value={draftTitle}
					onChange={event => setDraftTitle(event.target.value)}
				/>
				<Button type='button' disabled={query.isFetching} onClick={handleReset}>
					초기화
				</Button>
				<Button type='submit' disabled={query.isFetching}>
					검색
				</Button>
			</form>

			<Button type='button' disabled={query.isFetching} onClick={() => void query.refetch()}>
				재조회
			</Button>

			<Button type='button' className='ml-2' onClick={() => setCreateNotice(true)}>
				등록
			</Button>
			{createNotice && (
				<ModalCreateNotice open={createNotice} onClose={() => setCreateNotice(false)} />
			)}

			{updateNotice && (
				<ModalUpdateNotice
					key={updateNotice.id}
					data={updateNotice}
					open={!!updateNotice}
					onClose={() => setUpdateNotice(null)}
				/>
			)}

			{/* 로딩 상태 */}
			{query.isFetching && (
				<p role='status'>
					{query.isPlaceholderData
						? '새 결과를 불러오는 중입니다. 이전 조회 결과를 표시합니다.'
						: '공지글을 불러오고 있습니다.'}
				</p>
			)}

			<p className='mt-3'>
				{query.isPlaceholderData ? '이전 결과' : '검색 결과'}: {totalRecords}건
			</p>

			{/* 조회 실패 */}
			{query.isError && <p role='alert'>재조회에 실패했습니다. 기존 목록을 표시합니다.</p>}

			{/* 빈 배열 */}
			{query.data?.data.length === 0 && <p>등록된 공지글이 없습니다.</p>}

			<ul className='notice-list mt-6 grid list-none gap-4 p-0'>
				{query.data?.data.map(notice => (
					<Card component='li' key={notice.id}>
						<Typography component='h2' variant='h6' className='mb-2 text-primary'>
							<Link
								to='/dev/notices/$noticeId'
								params={{ noticeId: notice.id }}
								className='hover:underline'
							>
								{notice.title}
							</Link>
						</Typography>
						<p className='text-on-surface-secondary'>{notice.content}</p>
						<Button
							type='button'
							variant='outlined'
							className='mt-2'
							aria-label={notice.title + ' 수정'}
							disabled={query.isFetching}
							onClick={() => setUpdateNotice(notice)}
						>
							수정
						</Button>
					</Card>
				))}
			</ul>

			<Pagination
				className='mt-4'
				count={pageCount}
				page={search.pageIndex + 1}
				disabled={query.isFetching || totalRecords === 0}
				onChange={(_, page) =>
					setSearch(previous => ({ ...previous, pageIndex: page - 1 }))
				}
				getItemAriaLabel={(type, page) =>
					type === 'page'
						? String(page) + '페이지'
						: type === 'next'
							? '다음 페이지'
							: type === 'previous'
								? '이전 페이지'
								: type === 'first'
									? '첫 페이지'
									: '마지막 페이지'
				}
			/>
		</section>
	);
};

export const Route = createFileRoute('/(web)/(authenticated)/dev/notices/')({
	staticData: {
		title: '테스트용 공지글',
	}, // staticData.title: 자신의 탭 제목을 지정
	component: Component,
});
