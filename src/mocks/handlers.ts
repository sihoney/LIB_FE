import type { RequestHandler } from 'msw';

// 도서 API 계약을 정의하는 단계에서 업무별 핸들러를 연결합니다.
export const handlers: RequestHandler[] = [];
