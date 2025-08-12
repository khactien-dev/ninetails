import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});
