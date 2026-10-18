import { MEMBER_LIST_META, MEMBER_MODULE } from '@/src/consts/modules/lib/member';
import type MemberRepository from '@/src/repositories/modules/lib/memberRepository';
import type { IMemberListRequest } from '@/src/types/modules/lib/member';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

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
}
