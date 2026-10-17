import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import HttpClient from '@/src/networks/httpClient';
import NoticeRepository from '@/src/repositories/modules/dev/noticeRepository';
import NoticeService from '@/src/services/modules/dev/noticeService';
import BookRepository from '@/src/repositories/modules/lib/bookRepository';
import BookService from '@/src/services/modules/lib/bookService';

// MES의 조립 지점 역할을 따르되, 반복이 충분히 확인되기 전에는 wire/Base 추상화를 생략합니다.
const httpClient = new HttpClient(ENV_API_BASE_URL);
const noticeRepository = new NoticeRepository(httpClient);

const bookRepository = new BookRepository(httpClient);
const services = {
	noticeService: new NoticeService(noticeRepository),
	bookService: new BookService(bookRepository),
};

export default services;
