// 현재 조회에서 사용하는 MES 계약만 정의합니다. 정렬·필터·첨부는 필요할 때 추가합니다.
export interface IRequestBody<T = unknown> {
	data?: T;
	skip?: number;
	take?: number;
}

export interface IResponseBody<T> {
	success: boolean;
	returnMess: string;
	returnMessCode: number | string;
	data: T;
	totalRecords?: number;
}

export interface IRepositoryMeta {
	signature: string;
	functionCode: string;
}
