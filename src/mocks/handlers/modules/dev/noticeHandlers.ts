import { notices } from '@/src/mocks/data/modules/dev/notices';
import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import {
	NOTICE_CREATE_META,
	NOTICE_DETAIL_META,
	NOTICE_META,
	NOTICE_MODULE,
} from '@/src/consts/modules/dev/notice';
import type { IRequestBody, IResponseBody } from '@/src/types/common/repository';
import type { INotice, INoticeCreate, INoticeSearch } from '@/src/types/modules/dev/notice';
import { delay, http, HttpResponse } from 'msw';

// new URL(상대 주소, 기준주소);
// - 첫 번째 주소는 상대 주소
// - 두 번째 주소를 기준으로 완전한 주소를 계산, 그 정보를 담은 URL 객체를 생성
const apiBase = new URL(`${ENV_API_BASE_URL.replace(/\/$/, '')}/`, window.location.origin);
const endpoint = new URL(
	`v2/${NOTICE_MODULE}/${NOTICE_META.signature}/${NOTICE_META.functionCode}/GetData`,
	apiBase,
).href;

const detailEndpoint = new URL(
	`v2/${NOTICE_MODULE}/${NOTICE_DETAIL_META.signature}/${NOTICE_DETAIL_META.functionCode}/GetData`,
	apiBase,
).href;

const createEndpoint = new URL(
	`v2/${NOTICE_MODULE}/${NOTICE_CREATE_META.signature}/${NOTICE_CREATE_META.functionCode}/Update`,
	apiBase,
).href;

export const noticeHandlers = [
	http.post(endpoint, async ({ request }) => {
		const body = (await request.json()) as IRequestBody<INoticeSearch>;

		// 첫 조회와 재조회 중 상태를 눈으로 확인하기 위한 테스트용 지연입니다.
		await delay(350);
		// 제목 검색 → 검색 결과 전체 건수 → 페이지 자르기 순서입니다.
		// TODO: 다른 조회에서 반복되면 MES BaseMockRepository의 검색·페이징 처리로 이동합니다.
		const title = body.data?.title?.trim().toLocaleLowerCase() ?? '';
		const rows = notices.filter(notice => notice.title.toLocaleLowerCase().includes(title));

		const skip = body.skip ?? 0;
		const take = body.take ?? 20;

		return HttpResponse.json<IResponseBody<INotice[]>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			// MES와 동일하게 take: 0은 skip 이후 전체 조회입니다.
			data: take > 0 ? rows.slice(skip, skip + take) : rows.slice(skip),
			totalRecords: rows.length,
		});
	}),

	// notice 상세 조회
	http.post(detailEndpoint, async ({ request }) => {
		const body = (await request.json()) as IRequestBody<{ noticeId?: number }>;

		await delay(350);

		// 목록과 같은 데이터를 사용합니다. 없는 ID는 성공 응답의 null로 구분합니다.
		// TODO: LIB_BE 상세 API 연결 시 미존재 응답 계약을 확정합니다.
		return HttpResponse.json<IResponseBody<INotice | null>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data: notices.find(notice => notice.id === body.data?.noticeId) ?? null,
		});
	}),

	// notice 단건 등록
	// 화면 검증과 별개로 'API 경계에서도 입력값을 검사'
	http.post(createEndpoint, async ({ request }) => {
		const body = (await request.json()) as IRequestBody<INoticeCreate>;
		const title = typeof body?.data?.title === 'string' ? body.data.title.trim() : '';
		const content = typeof body?.data?.content === 'string' ? body.data.content.trim() : '';

		await delay(350);

		if (!title || title.length > 200 || !content) {
			return HttpResponse.json<IResponseBody<INotice | null>>({
				success: false,
				returnMess: '제목은 1~200자, 본문은 필수입니다.',
				returnMessCode: 'INVALID_NOTICE',
				data: null,
			});
		}

		// 지연 이후 현재 최댓값으로 ID를 생성합니다.
		// 새로고침하면 초기 데이터로 돌아갑니다.
		const notice: INotice = {
			id: Math.max(0, ...notices.map(item => item.id)) + 1,
			title,
			content,
		};

		notices.unshift(notice);

		return HttpResponse.json<IResponseBody<INotice | null>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data: notice,
		});
	}),
];
