import IconInfoGray from '@/assets/images/svg/notification/info-gray.svg';
import IconInfo from '@/assets/images/svg/notification/info.svg';
import IconSuccessGray from '@/assets/images/svg/notification/success-gray.svg';
import IconSuccess from '@/assets/images/svg/notification/success-noti.svg';
import { SETTING_NOTIFICATION_KEY } from '@/constants/notification';
import { NotificationItemType } from '@/interfaces';
import { Dates } from '@/utils';
import React, { useMemo } from 'react';

import { NOTI_ICON_TYPE } from '../index.ultis';
import { KeySettingNotificationsType, notificationsData } from '../setting/setting-form';
import * as S from './index.styles';

interface IProps {
  data: NotificationItemType;
  onClick: (data: NotificationItemType) => void;
}

const IconStatus = {
  [NOTI_ICON_TYPE.SUCCESS]: {
    read: <IconSuccessGray />,
    unRead: <IconSuccess />,
  },
  [NOTI_ICON_TYPE.INFO]: {
    read: <IconInfoGray />,
    unRead: <IconInfo />,
  },
};

const NotiItem = ({ data, onClick }: IProps) => {
  const { createdAt, type, read_at, route_name } = data;

  const noti = useMemo(() => {
    return notificationsData[type as KeySettingNotificationsType];
  }, [type]);

  if (!noti) return null;

  return (
    <S.NotiItem $isRead={!!read_at} onClick={() => onClick(data)}>
      <S.IconStatus>{IconStatus[noti.iconType][read_at ? 'read' : 'unRead']}</S.IconStatus>
      <S.ContentWrapper>
        <S.TimeWithTitle>
          <S.Title>{type === SETTING_NOTIFICATION_KEY.LOST_SIGNAL ? '미관제' : noti.title}</S.Title>
          <S.Time>{Dates.getGapTime(createdAt)}</S.Time>
        </S.TimeWithTitle>
        <S.Description>
          <S.Area>{`[${route_name}]`}</S.Area>
          <S.Text>{noti.body}</S.Text>
        </S.Description>
      </S.ContentWrapper>
    </S.NotiItem>
  );
};

export default NotiItem;
