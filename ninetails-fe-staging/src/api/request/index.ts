import { RESPONSE_CODE } from '@/constants';
import { RefreshTokenResponse } from '@/interfaces';
import cookies from '@/utils/cookie';
import Axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import Router from 'next/router';

interface FailedRequest {
  resolve: (value: AxiosResponse<any, any> | PromiseLike<AxiosResponse<any, any>>) => void;
  reject: (reason?: AxiosError) => void;
  config: AxiosRequestConfig & { _retry?: boolean };
}

const axiosInstance = Axios.create({
  timeout: 3 * 60 * 1000,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    // config header
  },
});

let isRefreshing = false;
let failedRequestsQueue: Array<FailedRequest> = [];

const refreshToken = async () => {
  isRefreshing = true;
  const refreshToken = cookies.get('refreshToken');
  if (refreshToken) {
    try {
      const response = await axiosInstance.post<{ refreshToken: string }, RefreshTokenResponse>(
        '/auth/refresh-token',
        { refreshToken }
      );
      if (response?.accessToken && response?.refreshToken) {
        cookies.set('access_token', response.accessToken);
        cookies.set('refreshToken', response.refreshToken);
        failedRequestsQueue.forEach((queuedRequest) => {
          if (queuedRequest.config.headers) {
            queuedRequest.config.headers.Authorization = `Bearer ${response.accessToken}`;
            axiosInstance(queuedRequest.config)
              .then((res) => queuedRequest.resolve(res))
              .catch((err) => queuedRequest.reject(err));
          }
        });
        failedRequestsQueue = [];
      }
    } catch (error) {
      Router.push({ pathname: '/', query: { isOpenLogin: true } });
    } finally {
      isRefreshing = false;
    }
  } else {
    Router.push({ pathname: '/', query: { isOpenLogin: true } });
  }
};

axiosInstance.interceptors.request.use(
  async (config: any) => {
    // if (!isRefreshing && !cookies.get('access_token')) {
    //   await refreshToken();
    // }

    const token = cookies.get('access_token');
    const queryString = window.location.search;
    const urlSearchParams = new URLSearchParams(queryString);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (config) {
      return {
        ...config,
        headers: {
          Authorization: `Bearer ${token}`,
          opId: params.opId,
          schema: params.schema,
          ...config.headers,
        },
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig<any> & { _retry?: boolean };

    if (
      error.response?.status === RESPONSE_CODE.UNAUTHORIZED &&
      (error.response?.data as any).error == 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (!isRefreshing) {
        if (cookies.get('refreshToken')) {
          await refreshToken();
        } else {
          Router.pathname !== '/' && Router.push({ pathname: '/', query: { isOpenLogin: true } });
        }
        originalRequest._retry = true;
        return axiosInstance(originalRequest);
      } else {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject, config: originalRequest });
        });
      }
    }
    if (error.response?.status === RESPONSE_CODE.SERVER_ERROR) {
      return Promise.reject(error.response);
    }
    return Promise.reject(error.response);
  }
);

export const request = {
  get<ReqType, ResType>(
    url: string,
    params?: ReqType,
    config?: AxiosRequestConfig<ReqType>
  ): Promise<ResType> {
    return axiosInstance.get(url, { params, ...config });
  },
  post<ReqType, ResType>(
    url: string,
    data?: ReqType,
    config?: AxiosRequestConfig<ReqType>
  ): Promise<ResType> {
    return axiosInstance.post(url, data, config);
  },
  put<ReqType, ResType>(
    url: string,
    data?: ReqType,
    config?: AxiosRequestConfig<ReqType>
  ): Promise<ResType> {
    return axiosInstance.put(url, data, config);
  },
  patch<ReqType, ResType>(url: string, data?: ReqType): Promise<ResType> {
    return axiosInstance.patch(url, data);
  },
  delete<ReqType, ResType>(
    url: string,
    data?: ReqType,
    config?: AxiosRequestConfig<ReqType>
  ): Promise<ResType> {
    return axiosInstance.delete(url, { data, ...config });
  },
};
