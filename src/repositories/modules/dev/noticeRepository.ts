import { NOTICE_META, NOTICE_MODULE } from '@/src/consts/modules/dev/notice';
import type HttpClient from '@/src/networks/httpClient';
import type { IRequestBody } from '@/src/types/common/repository';
import type { INotice, INoticeSearch } from '@/src/types/modules/dev/notice';

export default class NoticeRepository {
	constructor(private readonly httpClient: HttpClient) {}

	public getNoticeList = (body: IRequestBody<INoticeSearch>, signal?: AbortSignal) =>
		this.httpClient.get<INoticeSearch, INotice[]>({
			url: NOTICE_MODULE,
			meta: NOTICE_META,
			body,
			signal,
		});
}
