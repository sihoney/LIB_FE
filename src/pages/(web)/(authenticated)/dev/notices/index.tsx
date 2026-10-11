import Button from '@/src/components/ui/buttons/Button';
import { Card, Typography } from '@mui/material';
import services from '@/src/services/services';
import type { TNoticeScenario } from '@/src/types/modules/dev/notice';
import { createFileRoute, Link } from '@tanstack/react-router';

const Component = () => {
	const { scenario } = Route.useSearch(); // 'validateSearch'에서 정의한 검색 파라미터를 가져옵니다.

	const query = services.noticeService.useGetNoticeList({ data: { scenario } });

	// 첫 조회 실패는 Router가 처리
	// 재조회 실패 시, 기존 목록을 보존
	if (query.isError && !query.data) throw query.error;

	return (
		<section>
			<Typography component='h1' variant='h4' className='mb-4 font-bold'>
				테스트용 공지글
			</Typography>
			<p className='mb-6 text-on-surface-secondary'>
				응답 유형을 선택해 목록·로딩·오류 처리를 확인할 수 있습니다.
			</p>

			<nav className='actions' aria-label='테스트 응답 선택'>
				<Link to='/dev/notices' search={{ scenario: 'success' }}>
					정상 응답
				</Link>
				<Link to='/dev/notices' search={{ scenario: 'empty' }}>
					빈 목록
				</Link>
				<Link to='/dev/notices' search={{ scenario: 'error' }}>
					오류 응답
				</Link>
			</nav>

			<Button type='button' disabled={query.isFetching} onClick={() => void query.refetch()}>
				재조회
			</Button>

			{query.isFetching && <p role='status'>공지글을 불러오고 있습니다.</p>}
			{query.isError && <p role='alert'>재조회에 실패했습니다. 기존 목록을 표시합니다.</p>}
			{query.data?.data.length === 0 && <p>등록된 공지글이 없습니다.</p>}

			<ul className='notice-list mt-6 grid list-none gap-4 p-0'>
				{query.data?.data.map(notice => (
					<Card component='li' key={notice.id}>
						<Typography component='h2' variant='h6' className='mb-2 text-primary'>
							{notice.title}
						</Typography>
						<p className='text-on-surface-secondary'>{notice.content}</p>
					</Card>
				))}
			</ul>
		</section>
	);
};

export const Route = createFileRoute('/(web)/(authenticated)/dev/notices/')({
	staticData: { title: '테스트용 공지글' },
	// validateSearch: URL의 검색 파라미터를 확인&정리하는 함수
	validateSearch: (search: Record<string, unknown>): { scenario: TNoticeScenario } => ({
		scenario:
			search.scenario === 'empty' || search.scenario === 'error'
				? search.scenario
				: 'success',
	}),
	component: Component,
});
