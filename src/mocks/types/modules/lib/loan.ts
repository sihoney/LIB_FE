// 재고 계산용 최소 Mock 계약입니다.
// 최종 대출 DTO가 아니며 회원·예정일 정책은 포함하지 않습니다.
// 회원·대출 구현 시, 실제 회원 참조와 전체 대출 계약으로 확장합니다.
export interface IMockLoanStockRecord {
	id: number;
	bookId: number;
	returnedAt: string | null;
	cancelledAt: string | null;
}
