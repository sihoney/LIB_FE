import { NOTICE_DETAIL_META, NOTICE_META, NOTICE_MODULE } from '@/src/consts/modules/dev/notice';
import type NoticeRepository from '@/src/repositories/modules/dev/noticeRepository';
import type { IRequestBody } from '@/src/types/common/repository';
import type { INoticeSearch } from '@/src/types/modules/dev/notice';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export default class NoticeService {
	constructor(private readonly noticeRepository: NoticeRepository) {}

	public useGetNoticeList = (body: IRequestBody<INoticeSearch>) =>
		useQuery({
			queryKey: [NOTICE_MODULE, NOTICE_META.signature, NOTICE_META.functionCode, body],
			queryFn: ({ signal }) => this.noticeRepository.getNoticeList(body, signal),
			// MES 공지 목록처럼 조건 변경 중에는 이전 결과를 잠시 표시합니다.
			placeholderData: keepPreviousData,
		});

	public useGetNoticeDetail = (body: IRequestBody<{ noticeId?: number }> = {}) =>
		useQuery({
			queryKey: [
				NOTICE_MODULE,
				NOTICE_DETAIL_META.signature,
				NOTICE_DETAIL_META.functionCode,
				body,
			],
			queryFn: ({ signal }) => this.noticeRepository.getNoticeDetail(body, signal),
			enabled: !!body.data?.noticeId,
		});
}
