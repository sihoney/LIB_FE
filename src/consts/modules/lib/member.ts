export const MEMBER_STATUSES = ['ACTIVE', 'WITHDRAWN'] as const;
export const MEMBER_NAME_MAX_LENGTH = 50;
export const MEMBER_PHONE_MAX_LENGTH = 30;
export const MEMBER_EMAIL_MAX_LENGTH = 100;

export const MEMBER_SORT_COLUMNS = ['name', 'phone', 'email', 'status', 'joinedAt'] as const;

export const MEMBER_MODULE = 'Lib';

export const MEMBER_LIST_META = {
	signature: 'Member',
	functionCode: 'GetMemberList',
} as const;

export const MEMBER_CREATE_META = {
	signature: 'Member',
	functionCode: 'Create',
} as const;
