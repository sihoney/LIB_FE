import { noticeHandlers } from '@/src/mocks/handlers/modules/dev/noticeHandlers';
import type { RequestHandler } from 'msw';

export const handlers: RequestHandler[] = [...noticeHandlers];
