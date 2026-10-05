import axios, { type AxiosInstance } from 'axios';
import type { IRepositoryMeta, IRequestBody, IResponseBody } from '@/src/types/common/repository';

interface IRequestConfig<T> {
	url: string;
	meta: IRepositoryMeta;
	body: IRequestBody<T>;
	signal?: AbortSignal;
}

export default class HttpClient {
	private readonly axios: AxiosInstance;

	constructor(baseURL: string) {
		this.axios = axios.create({ baseURL: baseURL.replace(/\/$/, '') || '/', timeout: 15_000 });
	}

	// MES의 get은 조회 역할 이름이며, 실제 HTTP 메서드는 POST입니다.
	public get = async <T, U>({ url, meta, body, signal }: IRequestConfig<T>) => {
		const response = await this.axios.post<IResponseBody<U>>(
			`v2/${url}/${meta.signature}/${meta.functionCode}/GetData`,
			{ ...body, data: body.data ?? {}, skip: body.skip ?? 0, take: body.take ?? 20 },
			{ signal },
		);
		// 인증·알림 인터셉터 대신 현재 필요한 응답 해제와 업무 실패 처리만 둡니다.
		if (!response.data.success) {
			throw new Error(response.data.returnMess || '요청을 처리하지 못했습니다.');
		}
		return response.data;
	};
}
