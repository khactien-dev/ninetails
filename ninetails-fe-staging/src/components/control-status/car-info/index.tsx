import { ROUTER_PATH } from '@/constants';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { IMetric } from '@/interfaces';
import React from 'react';

import { IParams } from '../index.utils';
import * as S from './index.style';

interface Props {
  data: IMetric[];
  onChangeParams: (params: IParams) => void;
}

const InfoCar = ({ data, onChangeParams }: Props) => {
  const router = useRouterWithAuthorize();

  const onClickItem = async (item: any) => {
    await router.pushWithAuthorize(ROUTER_PATH.ADMIN_REALTIME_ACTIVITY);
    onChangeParams({
      vehicleNumber: item?.vehicle_number,
      routeName: item?.route_name,
      isArea: false,
    });
  };

  return (
    <S.CarInfo>
      {data?.length ? (
        data?.map((item: any, index: number) => (
          <S.Item key={index} onClick={() => onClickItem(item)}>
            <S.Id>{index + 1}</S.Id>
            <S.Title>{item?.vehicle_number}</S.Title>
          </S.Item>
        ))
      ) : (
        <S.Empry>No data</S.Empry>
      )}
    </S.CarInfo>
  );
};

export default React.memo(InfoCar);
