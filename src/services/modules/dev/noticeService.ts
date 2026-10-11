import { queryClient } from '@/src/contexts/QueryProvider';
import {
	NOTICE_CREATE_META,
	NOTICE_DETAIL_META,
	NOTICE_META,
	NOTICE_MODULE,
} from '@/src/consts/modules/dev/notice';
import type NoticeRepository from '@/src/repositories/modules/dev/noticeRepository';
import type { IRequestBody } from '@/src/types/common/repository';
import type { INoticeCreate, INoticeSearch } from '@/src/types/modules/dev/notice';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

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

	public usePostNotice = () =>
		useMutation({
			mutationKey: [
				NOTICE_MODULE,
				NOTICE_CREATE_META.signature,
				NOTICE_CREATE_META.functionCode,
			],
			mutationFn: (body: IRequestBody<INoticeCreate>) =>
				this.noticeRepository.postNotice(body),
			// MES처럼 목록 API 키까지만 지정하여 검색 조건·페이지별 목록을 함께 무효화합니다.
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: [NOTICE_MODULE, NOTICE_META.signature, NOTICE_META.functionCode],
				}),
		});
}
