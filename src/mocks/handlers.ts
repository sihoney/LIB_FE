import { noticeHandlers } from '@/src/mocks/handlers/modules/dev/noticeHandlers';
import { bookHandlers } from '@/src/mocks/handlers/modules/lib/bookHandlers';
import type { RequestHandler } from 'msw';

export const handlers: RequestHandler[] = [...noticeHandlers, ...bookHandlers];
