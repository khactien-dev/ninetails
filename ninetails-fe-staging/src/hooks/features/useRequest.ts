import { contactRequest, creatRequest, submitMail } from '@/api/form-request';
import { SubmitMailRequest } from '@/interfaces/request';

import useAppMutation, { AppMutationOptions } from '../useAppMutation';

export const useCreateRequest = (options?: AppMutationOptions) =>
  useAppMutation(creatRequest, {
    useAppMutationProps: options,
  });

export const useContactRequest = (options?: AppMutationOptions) =>
  useAppMutation(contactRequest, {
    useAppMutationProps: options,
  });

export const useSubmitMail = (options: SubmitMailRequest) =>
  useAppMutation(submitMail, {
    useAppMutationProps: options,
  });
