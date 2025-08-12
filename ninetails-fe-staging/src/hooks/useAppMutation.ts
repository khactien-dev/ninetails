import useLoadServerError from '@/hooks/useLoadServerError';
import { ApiError } from '@/interfaces';
import { useMutation } from '@/utils/react-query';
import {
  DefaultError,
  MutationFunction,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { FormInstance } from 'antd';

export interface AppMutationOptions {
  form?: FormInstance;
}

export interface useAppMutationCustomProps {
  toast: boolean;
}

export interface useAppMutationProps<TData, TError, TVariables, TContext> {
  useAppMutationProps?: AppMutationOptions;
  queryOptions?: UseMutationOptions<TData, TError, TVariables, TContext>;
  customProps?: useAppMutationCustomProps;
}

export default function useAppMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: MutationFunction<TData, TVariables>,
  props?: useAppMutationProps<TData, TError, TVariables, TContext>,
  customProps?: useAppMutationCustomProps
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { loadServerErrors } = useLoadServerError();
  // custom
  const mutation = useMutation({
    ...props?.queryOptions,
    mutationFn,
    onError: (error) => {
      loadServerErrors({
        error: error as unknown as ApiError,
        ...props?.useAppMutationProps,
        customProps: {
          toast: customProps ? customProps?.toast : true,
        },
      });
      return;
    },
  });

  const safeMutate = (...args: Parameters<typeof mutation.mutate>) => {
    if (!mutation.isPending) {
      return mutation.mutate(...args);
    }
  };

  return { ...mutation, mutate: safeMutate };
}
