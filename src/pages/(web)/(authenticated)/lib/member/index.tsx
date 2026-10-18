import { Alert, MenuItem, TextField, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import TableLibMembers from '@/src/components/tables/modules/lib/TableLibMembers';
import Button from '@/src/components/ui/buttons/Button';
import { MEMBER_STATUSES } from '@/src/consts/modules/lib/member';
import useTableState from '@/src/hooks/common/table/useTableState';
import ModalCreateMember from '@/src/pages/(web)/(authenticated)/lib/member/-components/modals/ModalCreateMember';
import services from '@/src/services/services';
import type { IMemberSearch, IMemberSorting, TMemberStatus } from '@/src/types/modules/lib/member';

const PAGE_SIZE = 10;

const emptyDraft = {
	name: '',
	phone: '',
	status: '' as TMemberStatus | '',
};

const Component = () => {
	const [draft, setDraft] = useState(emptyDraft);
	const [createMember, setCreateMember] = useState(false);

	const tableState = useTableState<IMemberSearch, IMemberSorting>({
		take: PAGE_SIZE,
	});

	const query = services.memberService.useGetMemberList(tableState.requestBody);
	const totalRecords = query.data?.totalRecords ?? 0;
	const isBusy = query.isFetching;

	const applySearch = (data: IMemberSearch) => {
		if (tableState.submit(data)) {
			// 같은 조건으로 다시 검색해도 조회 의도를 존중해 직접 refetch(), 명시적 재조회
			void query.refetch();
		}
	};

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (isBusy) return;

		applySearch({
			name: draft.name.trim() || undefined,
			phone: draft.phone.trim() || undefined,
			status: draft.status || undefined,
		});
		// trim() || undefined:
		// - 빈 문자열을 검색 조건으로 보내지 않기 위해서
	};

	const handleReset = () => {
		if (isBusy) return;

		setDraft(emptyDraft);
		applySearch({});
	};

	return (
		<section>
			<Typography component='h1' variant='h4' className='mb-6'>
				회원 목록
			</Typography>

			<form className='mb-6 flex flex-wrap items-end gap-3' onSubmit={handleSearch}>
				<TextField
					label='이름'
					value={draft.name}
					onChange={event =>
						setDraft(previous => ({ ...previous, name: event.target.value }))
					}
				/>
				<TextField
					label='연락처'
					value={draft.phone}
					onChange={event =>
						setDraft(previous => ({ ...previous, phone: event.target.value }))
					}
				/>
				<TextField
					select
					label='상태'
					value={draft.status}
					onChange={event =>
						setDraft(previous => ({
							...previous,
							status: event.target.value as TMemberStatus | '',
						}))
					}
					className='min-w-32'
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
				<Button type='button' disabled={isBusy} onClick={handleReset}>
					초기화
				</Button>
				<Button type='button' disabled={isBusy} onClick={() => setCreateMember(true)}>
					등록
				</Button>
			</form>

			{createMember && (
				<ModalCreateMember open={createMember} onClose={() => setCreateMember(false)} />
			)}

			{query.isLoading && <p role='status'>회원 목록을 불러오고 있습니다.</p>}
			{isBusy && !query.isLoading && (
				<p role='status'>이전 조회 결과를 표시하며 회원 목록을 갱신하고 있습니다.</p>
			)}
			{query.isError && (
				<Alert
					severity='error'
					className='mb-4'
					action={
						<Button type='button' onClick={() => void query.refetch()}>
							다시 시도
						</Button>
					}
				>
					회원 목록을 불러오지 못했습니다.
				</Alert>
			)}

			<p className='my-3'>전체 {totalRecords}건</p>

			{/*
				헤더 클릭은 TableLibMembers → 공통 Table → MRT의 onSortingChange를 거쳐
				tableState.setSorting을 갱신한다.

				정렬·페이지 상태와 API requestBody 변환은 Page가 아닌 useTableState가 담당한다.
			*/}
			<TableLibMembers
				tableState={tableState}
				data={query.data?.data ?? []}
				rowCount={totalRecords}
				state={{
					isLoading: query.isLoading,
					showProgressBars: query.isFetching,
				}}
				getRowId={member => String(member.id)}
			/>
		</section>
	);
};

export const Route = createFileRoute('/(web)/(authenticated)/lib/member/')({
	staticData: { title: '회원 목록' },
	component: Component,
});
