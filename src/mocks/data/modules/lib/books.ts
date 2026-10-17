import type { IBook } from '@/src/types/modules/lib/book';

// 목록·재고 확인용 가상 도서입니다. Faker 대량 데이터는 페이징 구현 시 추가합니다.
export const books: IBook[] = [
	{
		id: 1,
		title: '도서관의 하루',
		author: '김하늘',
		category: 'LITERATURE',
		totalQuantity: 3,
		isDeleted: false,
	},
	{
		id: 2,
		title: '생활 속 과학',
		author: '이수진',
		category: 'SCIENCE',
		totalQuantity: 3,
		isDeleted: false,
	},
	{
		id: 3,
		title: '역사를 읽는 시간',
		author: '박민호',
		category: 'HISTORY',
		totalQuantity: 2,
		isDeleted: false,
	},
	{
		id: 4,
		title: '기록하는 습관',
		author: '정유진',
		category: 'OTHER',
		totalQuantity: 0,
		isDeleted: false,
	},
	{
		id: 5,
		title: '다시 읽는 이야기',
		author: '최지우',
		category: 'LITERATURE',
		totalQuantity: 2,
		isDeleted: false,
	},
	{
		id: 6,
		title: '오래된 자료집',
		author: '한서준',
		category: 'HISTORY',
		totalQuantity: 1,
		isDeleted: true,
	},
];
