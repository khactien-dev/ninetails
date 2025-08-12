import { createComboBox, deleteComboBox, getComboBox, updateComboBox } from '@/api/combo-box';
import { ISearchParams } from '@/interfaces';
import { IComboBox, IComboBoxDelete, IUpdateComboBox } from '@/interfaces/comboBox';

import useAppMutation from '../useAppMutation';
import useAppQuery from '../useAppQuery';

export const useGetComboBox = (name: string, headers: ISearchParams) =>
  useAppQuery({
    queryKey: ['combo-box', name],
    queryFn: () => getComboBox(name, headers),
    gcTime: 0,
    enabled: false,
  });

export const useCreateComboBox = (headers: ISearchParams) => {
  return useAppMutation((variables: IComboBox) => createComboBox(variables, headers));
};

export const useUpdateComboBox = (headers: ISearchParams) => {
  return useAppMutation((variables: IUpdateComboBox) => updateComboBox(variables, headers));
};

export const useDeleteComboBox = (headers: ISearchParams) => {
  return useAppMutation((variables: IComboBoxDelete) => deleteComboBox(variables, headers));
};
