import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import {
	MEMBER_LIST_META,
	MEMBER_CREATE_META,
	MEMBER_MODULE,
	MEMBER_NAME_MAX_LENGTH,
	MEMBER_PHONE_MAX_LENGTH,
	MEMBER_EMAIL_MAX_LENGTH,
	MEMBER_SORT_COLUMNS,
	MEMBER_STATUSES,
} from '@/src/consts/modules/lib/member';
import { members } from '@/src/mocks/data/modules/lib/members';
import type {
	IMemberListItem,
	IMember,
	IMemberCreate,
	IMemberListRequest,
	IMemberListResponse,
	IMemberSorting,
	TMemberSortColumn,
} from '@/src/types/modules/lib/member';
import { delay, http, HttpResponse } from 'msw';
import type { IResponseBody } from '@/src/types/common/repository';

const apiBase = new URL(`${ENV_API_BASE_URL.replace(/\/$/, '')}/`, window.location.origin);
const endpoint = new URL(
	`v2/${MEMBER_MODULE}/${MEMBER_LIST_META.signature}/${MEMBER_LIST_META.functionCode}/GetData`,
	apiBase,
).href;
const createEndpoint = new URL(
	`v2/${MEMBER_MODULE}/${MEMBER_CREATE_META.signature}/${MEMBER_CREATE_META.functionCode}/Update`,
	apiBase,
).href;

// isRecord: 받은 JSON이 객체인지 확인
const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const memberSortColumns = new Set<TMemberSortColumn>(MEMBER_SORT_COLUMNS);
const memberStatuses = new Set<string>(MEMBER_STATUSES);

// isMemberSortings: 정렬 컬럼·방향·중복 컬럼을 검사
const isMemberSortings = (value: unknown): value is IMemberSorting[] => {
	if (value === undefined) return true;
	if (!Array.isArray(value)) return false;

	const columns = new Set<string>();
	return value.every(sorting => {
		if (!isRecord(sorting)) return false;

		const { columName, typeSorting } = sorting;

		if (
			typeof columName !== 'string' ||
			!memberSortColumns.has(columName as TMemberSortColumn) ||
			(typeSorting !== 'ASC' && typeSorting !== 'DESC') ||
			columns.has(columName)
		)
			return false;

		columns.add(columName);
		return true;
	});
};

// isMemberListRequest: 검색 조건, `skip`, `take`, 정렬 값 전체를 검사
const isMemberListRequest = (value: unknown): value is IMemberListRequest => {
	if (!isRecord(value)) return false;

	for (const key of ['skip', 'take']) {
		const number = value[key];
		if (
			number !== undefined &&
			(typeof number !== 'number' || !Number.isSafeInteger(number) || number < 0)
		)
			return false;
	}
	if (!isMemberSortings(value.sortings)) return false;
	if (value.data === undefined) return true;
	if (!isRecord(value.data)) return false;

	const { name, phone, status } = value.data;
	return (
		(name === undefined || typeof name === 'string') &&
		(phone === undefined || typeof phone === 'string') &&
		(status === undefined || (typeof status === 'string' && memberStatuses.has(status)))
	);
};

const getMemberCreateData = (value: unknown): IMemberCreate | null => {
	if (!isRecord(value) || !isRecord(value.data)) return null;
	const { name, phone, email } = value.data;
	if (typeof name !== 'string' || typeof phone !== 'string' || typeof email !== 'string')
		return null;
	const data = { name: name.trim(), phone: phone.trim(), email: email.trim() };
	if (
		!data.name ||
		data.name.length > MEMBER_NAME_MAX_LENGTH ||
		!data.phone ||
		data.phone.length > MEMBER_PHONE_MAX_LENGTH ||
		!data.email ||
		data.email.length > MEMBER_EMAIL_MAX_LENGTH ||
		!/^\S+@\S+\.\S+$/.test(data.email)
	)
		return null;
	return data;
};

// compareMemberListItems: 정렬 순서를 계산
const compareMemberListItems = (
	left: IMemberListItem,
	right: IMemberListItem,
	sortings: IMemberSorting[],
) => {
	for (const sorting of sortings) {
		const compared = left[sorting.columName].localeCompare(right[sorting.columName]);
		if (compared !== 0) return sorting.typeSorting === 'ASC' ? compared : -compared;
	}
	return left.id - right.id;
};

export const memberHandlers = [
	http.post(endpoint, async ({ request }) => {
		const body: unknown = await request.json().catch(() => undefined);

		await delay(350);

		if (!isMemberListRequest(body)) {
			return HttpResponse.json<IMemberListResponse>({
				success: false,
				returnMess: '검색 조건과 페이지 값을 확인해 주세요.',
				returnMessCode: 'INVALID_MEMBER_LIST_REQUEST',
				data: [],
				totalRecords: 0,
			});
		}

		const name = body.data?.name?.trim().toLocaleLowerCase() ?? '';
		const phone = body.data?.phone?.trim() ?? '';
		const status = body.data?.status;

		// 검색 조건 필터, accountId 제외, 정렬
		const listItems: IMemberListItem[] = members
			.filter(
				member =>
					member.name.toLocaleLowerCase().includes(name) &&
					member.phone.includes(phone) &&
					(status === undefined || member.status === status),
			)
			.map(({ accountId: _accountId, ...member }) => member)
			.sort((left, right) => compareMemberListItems(left, right, body.sortings ?? []));

		// 페이지네이션
		const skip = body.skip ?? 0;
		const take = body.take ?? 20;
		const data = take === 0 ? listItems.slice(skip) : listItems.slice(skip, skip + take);

		return HttpResponse.json<IMemberListResponse>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data,
			totalRecords: listItems.length,
		});
	}),

	http.post(createEndpoint, async ({ request }) => {
		const data = getMemberCreateData(await request.json().catch(() => undefined));
		await delay(350);
		if (!data) {
			return HttpResponse.json<IResponseBody<IMember | null>>({
				success: false,
				returnMess: '이름, 연락처, 이메일을 확인해 주세요.',
				returnMessCode: 'INVALID_MEMBER_CREATE_REQUEST',
				data: null,
			});
		}
		const member: IMember = {
			id: Math.max(0, ...members.map(item => item.id)) + 1,
			// sys 인증이 아직 없으므로 Mock에서만 임시 계정 연결 키를 만든다.
			accountId: Math.max(0, ...members.map(item => item.accountId)) + 1,
			...data,
			status: 'ACTIVE',
			joinedAt: new Date().toISOString(),
			withdrawnAt: null,
		};
		members.push(member);
		return HttpResponse.json<IResponseBody<IMember>>({
			success: true,
			returnMess: '',
			returnMessCode: 0,
			data: member,
		});
	}),
];
