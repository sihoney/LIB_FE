import { notices } from '@/src/mocks/data/modules/dev/notices';
import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import { NOTICE_META, NOTICE_MODULE } from '@/src/consts/modules/dev/notice';
import type { IRequestBody, IResponseBody } from '@/src/types/common/repository';
import type { INotice, INoticeSearch } from '@/src/types/modules/dev/notice';
import { delay, http, HttpResponse } from 'msw';

// new URL(상대 주소, 기준주소);
// - 첫 번째 주소는 상대 주소
// - 두 번째 주소를 기준으로 완전한 주소를 계산, 그 정보를 담은 URL 객체를 생성
const apiBase = new URL(`${ENV_API_BASE_URL.replace(/\/$/, '')}/`, window.location.origin);
const endpoint = new URL(
	`v2/${NOTICE_MODULE}/${NOTICE_META.signature}/${NOTICE_META.functionCode}/GetData`,
	apiBase,
).href;

export const noticeHandlers = [
	http.post(endpoint, async ({ request }) => {
		const body = (await request.json()) as IRequestBody<INoticeSearch>;

		// 첫 조회와 재조회 중 상태를 눈으로 확인하기 위한 테스트용 지연입니다.
		await delay(350);

		// [시나리오] 1. error
		if (body.data?.scenario === 'error') {
			return HttpResponse.json<IResponseBody<INotice[] | null>>({
				success: false,
				returnMess: '공지글 조회 실패를 재현했습니다.',
				returnMessCode: 'NOTICE_ERROR',
				data: null,
			});
		}

		// [시나리오] 2. success, empty
		// 제목 검색 → 검색 결과 전체 건수 → 페이지 자르기 순서입니다.
		// TODO: 다른 조회에서 반복되면 MES BaseMockRepository의 검색·페이징 처리로 이동합니다.
		const title = body.data?.title?.trim().toLocaleLowerCase() ?? '';
		const rows =
			body.data?.scenario === 'empty'
				? []
				: notices.filter(notice => notice.title.toLocaleLowerCase().includes(title));

		const skip = body.skip ?? 0;
		const take = body.take ?? 20;

		return HttpResponse.json<IResponseBody<INotice[] | null>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			// MES와 동일하게 take: 0은 skip 이후 전체 조회입니다.
			data: take > 0 ? rows.slice(skip, skip + take) : rows.slice(skip),
			totalRecords: rows.length,
		});
	}),
];
