import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import { NOTICE_META, NOTICE_MODULE } from '@/src/consts/modules/dev/notice';
import type { IResponseBody } from '@/src/types/common/repository';
import type { INotice, TNoticeScenario } from '@/src/types/modules/dev/notice';
import { delay, http, HttpResponse } from 'msw';

const notices: INotice[] = [
	{ id: 1, title: '도서관 이용 안내', content: '도서관 이용 전 이용 규칙을 확인해 주세요.' },
	{ id: 2, title: '신규 도서 입고 안내', content: '이번 달 새로 들어온 도서를 확인해 주세요.' },
	{
		id: 3,
		title: '자료실 정비 안내',
		content: '자료실 정비 중에는 일부 서가 이용이 제한됩니다.',
	},
];

const apiBase = new URL(`${ENV_API_BASE_URL.replace(/\/$/, '')}/`, window.location.origin);
const endpoint = new URL(
	`v2/${NOTICE_MODULE}/${NOTICE_META.signature}/${NOTICE_META.functionCode}/GetData`,
	apiBase,
).href;

export const noticeHandlers = [
	http.post(endpoint, async ({ request }) => {
		const body = (await request.json()) as {
			data?: { scenario?: TNoticeScenario };
			skip?: number;
			take?: number;
		};
		// 첫 조회와 재조회 중 상태를 눈으로 확인하기 위한 테스트용 지연입니다.
		await delay(350);
		if (body.data?.scenario === 'error') {
			return HttpResponse.json<IResponseBody<INotice[] | null>>({
				success: false,
				returnMess: '공지글 조회 실패를 재현했습니다.',
				returnMessCode: 'NOTICE_ERROR',
				data: null,
			});
		}
		const rows = body.data?.scenario === 'empty' ? [] : notices;
		const skip = body.skip ?? 0;
		const take = body.take ?? 20;
		return HttpResponse.json<IResponseBody<INotice[] | null>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data: rows.slice(skip, skip + take),
			totalRecords: rows.length,
		});
	}),
];
