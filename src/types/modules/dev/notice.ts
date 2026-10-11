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

// 등록 요청에는 서버가 생성하는 id를 포함하지 않습니다.
export type INoticeCreate = Pick<INotice, 'title' | 'content'>;

// Pick<INotice, 'title' | 'content'>: INotice에서 `title`과 `content`만 골라 새로운 타입을 정의
// Pick: TypeScript가 기본 제공하는 유틸리티 타입, 기존 타입에서 원하는 속성만 선택할 때 사용
