import type { IMockLoanStockRecord } from '@/src/mocks/types/modules/lib/loan';

// 도서 1: 대출 없음, 2: 일부 대출, 3: 전부 대출, 4: 보유 0권.
// 도서 5의 반납·취소 기록과 삭제된 도서 6의 과거 반납 기록은 재고를 차감하지 않습니다.
export const loans: IMockLoanStockRecord[] = [
	{ id: 1, bookId: 2, returnedAt: null, cancelledAt: null },
	{ id: 2, bookId: 2, returnedAt: null, cancelledAt: null },
	{ id: 3, bookId: 3, returnedAt: null, cancelledAt: null },
	{ id: 4, bookId: 3, returnedAt: null, cancelledAt: null },
	{ id: 5, bookId: 5, returnedAt: '2026-10-10T09:00:00+09:00', cancelledAt: null },
	{ id: 6, bookId: 5, returnedAt: null, cancelledAt: '2026-10-11T09:00:00+09:00' },
	{ id: 7, bookId: 6, returnedAt: '2026-10-09T09:00:00+09:00', cancelledAt: null },
];
