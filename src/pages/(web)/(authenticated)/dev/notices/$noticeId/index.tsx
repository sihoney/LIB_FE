import services from '@/src/services/services';
import { Card, Typography } from '@mui/material';
import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router';

const route = getRouteApi('/(web)/(authenticated)/dev/notices/$noticeId/');

const Component = () => {
	const { noticeId } = route.useParams();

	const query = services.noticeService.useGetNoticeDetail({
		skip: 0,
		take: 0,
		data: { noticeId },
	});
	const notice = query.data?.data;

	// MES에는 공통 통신 오류 처리가 있습니다. 현재 LIB에서는 기존 Router 오류 화면을 사용합니다.
	if (query.isError && !query.data) throw query.error;

	return (
		<section>
			<div className='mb-4 flex items-center justify-between gap-3'>
				<Typography component='h1' variant='h4' className='font-bold'>
					공지글 상세
				</Typography>
				{/* TODO: 대시보드 도입 후 MES 상세 화면의 닫기 동작(/dashboard)을 연결합니다. */}
				<Link to='/dev/notices' className='text-primary hover:underline'>
					목록으로
				</Link>
			</div>

			{query.isLoading && <p role='status'>공지글을 불러오고 있습니다.</p>}
			{query.isError && <p role='alert'>재조회에 실패했습니다. 기존 내용을 표시합니다.</p>}
			{!query.isLoading && !notice && <p>공지글을 찾을 수 없습니다.</p>}

			{notice && (
				<Card component='article'>
					<Typography component='h2' variant='h6' className='mb-3'>
						{notice.title}
					</Typography>
					<p className='whitespace-pre-wrap text-on-surface-secondary'>
						{notice.content || '내용이 없습니다.'}
					</p>
				</Card>
			)}
		</section>
	);
};

export const Route = createFileRoute('/(web)/(authenticated)/dev/notices/$noticeId/')({
	staticData: { title: '공지글 상세' },
	params: {
		parse: ({ noticeId }) => {
			// TODO: Zod 도입 시 MES의 z.coerce.number().int().positive() 검증으로 교체합니다.
			const parsedNoticeId = Number(noticeId);
			if (!Number.isSafeInteger(parsedNoticeId) || parsedNoticeId <= 0) {
				throw new Error('공지 ID는 양의 정수여야 합니다.');
			}
			return { noticeId: parsedNoticeId };
		},
	},
	// TODO: 인증·권한 기반이 준비되면 MES의 beforeLoad 권한 검사를 연결합니다.
	component: Component,
});
