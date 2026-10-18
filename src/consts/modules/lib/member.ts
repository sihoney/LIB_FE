export const MEMBER_STATUSES = ['ACTIVE', 'WITHDRAWN'] as const;

export const MEMBER_SORT_COLUMNS = ['name', 'phone', 'email', 'status', 'joinedAt'] as const;

export const MEMBER_MODULE = 'Lib';

export const MEMBER_LIST_META = {
	signature: 'Member',
	functionCode: 'GetMemberList',
} as const;
