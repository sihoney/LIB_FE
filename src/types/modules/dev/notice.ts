export interface INotice {
	id: number;
	title: string;
	content: string;
}

// 테스트용 업무 계약입니다. 실제 도서 API의 검색 조건과는 분리합니다.

export interface INoticeSearch {
	title?: string;
}

/**
 * INotice: 공지글 한 건의 구조
 * INoticeSearch: 제목 검색 조건을 담는 조회 조건 객체
 */
