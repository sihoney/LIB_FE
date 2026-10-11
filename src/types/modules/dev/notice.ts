export interface INotice {
	id: number;
	title: string;
	content: string;
}

// 테스트용 업무 계약입니다. 실제 도서 API의 검색 조건과는 분리합니다.
export type TNoticeScenario = 'success' | 'empty' | 'error';

export interface INoticeSearch {
	scenario: TNoticeScenario;
	title?: string;
}

/**
 * INotice: 공지글 한 건의 구조
 * INoticeSearch: 제목과 테스트 응답 시나리오를 담는 조회 조건 객체
 * TNoticeScenario: 선택 가능한 테스트 응답 종류
 */
