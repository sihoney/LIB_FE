export interface INotice {
	id: number;
	title: string;
	content: string;
}

// 테스트용 업무 계약입니다. 실제 도서 API의 검색 조건과는 분리합니다.
export type TNoticeScenario = 'success' | 'empty' | 'error';

export interface INoticeSearch {
	scenario: TNoticeScenario;
}

/**
 * INotice: 공지글 한 건의 구조
 * INoticeSearch: 선택 가능한 테스트 응답
 * TNoticeScenario: 공지글 조회 시 전달할 조건 객체
 */
