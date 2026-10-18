import {
	MEMBER_CREATE_META,
	MEMBER_UPDATE_META,
	MEMBER_LIST_META,
	MEMBER_MODULE,
} from '@/src/consts/modules/lib/member';
import type HttpClient from '@/src/networks/httpClient';
import type {
	IMemberListItem,
	IMemberListRequest,
	IMemberListResponse,
	IMemberSearch,
	IMember,
	IMemberCreate,
	IMemberUpdate,
} from '@/src/types/modules/lib/member';
import type { IRequestBody } from '@/src/types/common/repository';

export default class MemberRepository {
	constructor(private readonly httpClient: HttpClient) {}

	public getMemberList = async (
		body: IMemberListRequest,
		signal?: AbortSignal,
	): Promise<IMemberListResponse> => {
		const response = await this.httpClient.get<IMemberSearch, IMemberListItem[]>({
			url: MEMBER_MODULE,
			meta: MEMBER_LIST_META,
			body,
			signal,
		});

		// 공통 응답에서는 선택값이지만 회원 목록에서는 페이지 계산에 필수다.
		const totalRecords = response.totalRecords;
		if (
			typeof totalRecords !== 'number' ||
			!Number.isSafeInteger(totalRecords) ||
			totalRecords < 0
		) {
			throw new Error('회원 목록 응답의 전체 건수가 올바르지 않습니다.');
		}

		return { ...response, totalRecords };
	};

	public postMember = (body: IRequestBody<IMemberCreate>) =>
		this.httpClient.post<IMemberCreate, IMember>({
			url: MEMBER_MODULE,
			meta: MEMBER_CREATE_META,
			body,
		});
	public patchMember = (body: IRequestBody<IMemberUpdate>) =>
		this.httpClient.patch<IMemberUpdate, IMember>({
			url: MEMBER_MODULE,
			meta: MEMBER_UPDATE_META,
			body,
		});
}
