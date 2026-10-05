import { ENV_API_BASE_URL } from '@/src/consts/common/envKeys';
import HttpClient from '@/src/networks/httpClient';
import NoticeRepository from '@/src/repositories/modules/dev/noticeRepository';
import NoticeService from '@/src/services/modules/dev/noticeService';

// MES의 조립 지점 역할을 따르되, 한 업무이므로 wire/Base 추상화는 생략합니다.
const httpClient = new HttpClient(ENV_API_BASE_URL);
const noticeRepository = new NoticeRepository(httpClient);

const services = { noticeService: new NoticeService(noticeRepository) };

export default services;
