import { ResponseData } from '@/interfaces';
import { GetRequestResponse, IRequest, SubmitMailRequest } from '@/interfaces/request';

import { request } from '../request';

export const creatRequest = (params: IRequest) =>
  request.post<IRequest, ResponseData<GetRequestResponse>>('/form-request/demo-request', params);

export const contactRequest = (params: IRequest) =>
  request.post<IRequest, ResponseData<GetRequestResponse>>('/form-request/contact-request', params);

export const submitMail = (params: SubmitMailRequest) =>
  request.post<SubmitMailRequest, unknown>('/form-request/submit-mail', params);
