import { Faker, ko, en } from '@faker-js/faker';
import type { INotice } from '@/src/types/modules/dev/notice';

// 독립 Faker 인스턴스와 고정 seed로 데이터 생성
const faker = new Faker({ locale: [ko, en] });
faker.seed(20261011); // seed: 난수 생성의 시작값

const fixedNotices: INotice[] = [
	{
		id: 1,
		isDeleted: false,
		title: '도서관 이용 안내',
		content: '도서관 이용 전 이용 규칙을 확인해 주세요.',
	},
	{
		id: 2,
		isDeleted: false,
		title: '신규 도서 입고 안내',
		content: '이번 달 새로 들어온 도서를 확인해 주세요.',
	},
	{
		id: 3,
		isDeleted: false,
		title: '자료실 정비 안내',
		content: '자료실 정비 중에는 일부 서가 이용이 제한됩니다.',
	},
];

// 기존 학습용 공지 3개를 보존, 데이터 추가
// 모듈 초기화 때 한 번 생성, 요청마다 새로 만들지 않습니다.
// TODO: 상세·등록·수정·삭제 구현 시 같은 데이터를 공유하고 MES MockRepository로 공통화합니다.
export const notices: INotice[] = [
	...fixedNotices,
	...Array.from({ length: 50 }, (_, index) => ({
		id: index + 4,
		isDeleted: false,
		title:
			faker.helpers.arrayElement(['도서', '자료실', '회원', '행사']) + ' 안내 ' + (index + 1),
		content: faker.lorem.paragraph(),
	})),
];
