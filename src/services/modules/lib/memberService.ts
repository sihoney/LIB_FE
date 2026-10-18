import {
	MEMBER_CREATE_META,
	MEMBER_LIST_META,
	MEMBER_MODULE,
} from '@/src/consts/modules/lib/member';
import { queryClient } from '@/src/contexts/QueryProvider';
import type MemberRepository from '@/src/repositories/modules/lib/memberRepository';
import type { IMemberCreate, IMemberListRequest } from '@/src/types/modules/lib/member';
import type { IRequestBody } from '@/src/types/common/repository';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

export default class MemberService {
	constructor(private readonly memberRepository: MemberRepository) {}

	public useGetMemberList = (body: IMemberListRequest) =>
		useQuery({
			queryKey: [
				MEMBER_MODULE,
				MEMBER_LIST_META.signature,
				MEMBER_LIST_META.functionCode,
				body,
			],
			queryFn: ({ signal }) => this.memberRepository.getMemberList(body, signal),
			placeholderData: keepPreviousData,
		});

	public usePostMember = () =>
		useMutation({
			mutationKey: [
				MEMBER_MODULE,
				MEMBER_CREATE_META.signature,
				MEMBER_CREATE_META.functionCode,
			],
			mutationFn: (body: IRequestBody<IMemberCreate>) =>
				this.memberRepository.postMember(body),
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: [
						MEMBER_MODULE,
						MEMBER_LIST_META.signature,
						MEMBER_LIST_META.functionCode,
					],
				}),
		});
}
