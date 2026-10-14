import {
	NOTICE_DELETE_META,
	NOTICE_UPDATE_META,
	NOTICE_CREATE_META,
	NOTICE_DETAIL_META,
	NOTICE_META,
	NOTICE_MODULE,
} from '@/src/consts/modules/dev/notice';
import type HttpClient from '@/src/networks/httpClient';
import type { IRequestBody } from '@/src/types/common/repository';
import type {
	INotice,
	INoticeCreate,
	INoticeSearch,
	INoticeUpdate,
} from '@/src/types/modules/dev/notice';

export default class NoticeRepository {
	constructor(private readonly httpClient: HttpClient) {}

	public getNoticeList = (body: IRequestBody<INoticeSearch>, signal?: AbortSignal) =>
		this.httpClient.get<INoticeSearch, INotice[]>({
			url: NOTICE_MODULE,
			meta: NOTICE_META,
			body,
			signal,
		});

	public getNoticeDetail = (body: IRequestBody<{ noticeId?: number }>, signal?: AbortSignal) =>
		this.httpClient.get<{ noticeId?: number }, INotice | null>({
			url: NOTICE_MODULE,
			meta: NOTICE_DETAIL_META,
			body,
			signal,
		});

	public postNotice = (body: IRequestBody<INoticeCreate>) =>
		this.httpClient.post<INoticeCreate, INotice>({
			url: NOTICE_MODULE,
			meta: NOTICE_CREATE_META,
			body,
		});

	public patchNotice = (body: IRequestBody<INoticeUpdate>) =>
		this.httpClient.patch<INoticeUpdate, INotice>({
			url: NOTICE_MODULE,
			meta: NOTICE_UPDATE_META,
			body,
		});

	public deleteNotice = (body: IRequestBody<Pick<INotice, 'id'>>) =>
		this.httpClient.delete<Pick<INotice, 'id'>, INotice>({
			url: NOTICE_MODULE,
			meta: NOTICE_DELETE_META,
			body,
		});
}
