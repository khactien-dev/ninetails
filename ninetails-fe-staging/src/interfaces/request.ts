import { AppMutationOptions } from '@/hooks/useAppMutation';

export interface IRequest {
  organizational_name: string;
  email: string;
  name: string;
  phone_number: string;
  request_quotation: string;
  is_agree: boolean;
}

export interface GetRequestResponse {
  entities: IRequest[];
}

export interface SubmitMailRequest extends AppMutationOptions {
  email: string;
}
