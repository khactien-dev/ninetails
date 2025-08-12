import { request } from '@/api/request';
import { ISearchParams, ResponseData, SelectComboBoxItem } from '@/interfaces';
import { IComboBox, IComboBoxDelete, IUpdateComboBox } from '@/interfaces/comboBox';

export const getComboBox = (name: string, headers: ISearchParams) =>
  request.get<string, ResponseData<SelectComboBoxItem[]>>(
    `/user/combo-box?field=${name}`,
    undefined,
    {
      headers,
    }
  );

export const createComboBox = (body: IComboBox, headers: ISearchParams) =>
  request.post<IComboBox, ResponseData<any>>('/user/combo-box/create', body, {
    headers,
  });

export const updateComboBox = (body: IUpdateComboBox, headers: ISearchParams) =>
  request.put<{ data: string }, ResponseData<any>>(
    `/user/combo-box/update/${body.id}`,
    {
      data: body?.data,
    },
    {
      headers,
    }
  );

export const deleteComboBox = ({ id }: IComboBoxDelete, headers: ISearchParams) =>
  request.delete<{ id: number }, ResponseData<any>>(`/user/combo-box/delete/${id}`, undefined, {
    headers,
  });
