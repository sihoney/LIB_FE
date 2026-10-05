import { NOTICE_META, NOTICE_MODULE } from '@/src/consts/modules/dev/notice';
import type NoticeRepository from '@/src/repositories/modules/dev/noticeRepository';
import type { IRequestBody } from '@/src/types/common/repository';
import type { INoticeSearch } from '@/src/types/modules/dev/notice';
import { useQuery } from '@tanstack/react-query';

export default class NoticeService {
	constructor(private readonly noticeRepository: NoticeRepository) {}

	public useGetNoticeList = (body: IRequestBody<INoticeSearch>) =>
		useQuery({
			queryKey: [NOTICE_MODULE, NOTICE_META.signature, NOTICE_META.functionCode, body],
			queryFn: ({ signal }) => this.noticeRepository.getNoticeList(body, signal),
		});
}
