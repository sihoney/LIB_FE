import type { IMockLoanStockRecord } from '@/src/mocks/types/modules/lib/loan';
import type { IBook } from '@/src/types/modules/lib/book';

// Mock 저장소를 직접 import하지 않고 전달받은 데이터로 계산합니다.
// 삭제 도서 제외·검색·페이징은 이후 목록 핸들러에서 담당합니다.
export const getBookAvailableQuantity = (
	book: Pick<IBook, 'id' | 'totalQuantity'>,
	loans: readonly IMockLoanStockRecord[],
): number => {
	if (!Number.isSafeInteger(book.totalQuantity) || book.totalQuantity < 0) {
		throw new Error('도서 보유 수량은 0 이상의 안전한 정수여야 합니다.');
	}

	const outstandingCount = loans.filter(
		loan => loan.bookId === book.id && loan.returnedAt === null && loan.cancelledAt === null,
	).length;
	const availableQuantity = book.totalQuantity - outstandingCount;

	// 잘못된 초기 데이터나 업무 처리 결과를 0으로 덮어 숨기지 않습니다.
	if (availableQuantity < 0) {
		throw new Error('미반납 대출 수량이 도서 보유 수량을 초과했습니다.');
	}

	return availableQuantity;
};
