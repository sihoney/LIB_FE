import { setupWorker } from 'msw/browser';
import { handlers } from '@/src/mocks/handlers';

// 핸들러를 연결한 MSW 제어 객체 생성
export const worker = setupWorker(...handlers);
