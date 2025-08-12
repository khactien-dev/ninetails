import { BaseEmpty } from '@/components/common/base-empty';
import { NotificationItemType } from '@/interfaces';
import { Spin } from 'antd';
import React, { forwardRef } from 'react';

import * as S from './index.styles';
import NotiItem from './item';

interface IProps {
  notifications: Array<NotificationItemType>;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  onClickItem: (data: NotificationItemType) => void;
  onReadAll: () => void;
  isLoading: boolean;
}

const Notifications = forwardRef<HTMLDivElement, IProps>(
  ({ notifications, isLoading, onScroll, onClickItem, onReadAll }, ref) => {
    return notifications.length > 0 ? (
      <S.Wrapper>
        <S.Notifications ref={ref} onScroll={onScroll} className="notifications">
          {notifications.map((item: NotificationItemType) => (
            <NotiItem key={item.id} data={{ ...item }} onClick={onClickItem} />
          ))}
          <S.Loading>{isLoading && <Spin />}</S.Loading>
        </S.Notifications>
        <S.ButtonWrapper className="notificationsButtonGroup">
          <S.Button onClick={onReadAll}>모두 읽음</S.Button>
        </S.ButtonWrapper>
      </S.Wrapper>
    ) : (
      <BaseEmpty />
    );
  }
);

Notifications.displayName = 'Notifications';

export default Notifications;
