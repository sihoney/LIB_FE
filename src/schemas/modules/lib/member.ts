import {
	MEMBER_EMAIL_MAX_LENGTH,
	MEMBER_NAME_MAX_LENGTH,
	MEMBER_PHONE_MAX_LENGTH,
} from '@/src/consts/modules/lib/member';
import z from 'zod';

export const schemaCreateMember = z.object({
	name: z.string().trim().min(1, '이름을 입력해 주세요.').max(MEMBER_NAME_MAX_LENGTH),
	phone: z.string().trim().min(1, '연락처를 입력해 주세요.').max(MEMBER_PHONE_MAX_LENGTH),
	email: z
		.string()
		.trim()
		.min(1, '이메일을 입력해 주세요.')
		.max(MEMBER_EMAIL_MAX_LENGTH)
		.email('이메일 형식을 확인해 주세요.'),
});

export interface ISchemaCreateMember extends z.infer<typeof schemaCreateMember> {}
