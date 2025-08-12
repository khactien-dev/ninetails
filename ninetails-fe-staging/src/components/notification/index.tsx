import IconBellActive from '@/assets/images/svg/notification/bell-active.svg';
import IconBell from '@/assets/images/svg/notification/bell.svg';
import { useResponsive } from '@/hooks/useResponsive';
import { CloseOutlined } from '@ant-design/icons';
import React, { memo } from 'react';

import * as S from './index.styles';
import useNotifications from './index.ultis';
import Notifications from './item';
import NotificationSetting from './setting';

const Notification: React.FC = () => {
  const {
    openPopover,
    notificationRef,
    notifications,
    totalUnRead,
    isPending,
    handleTogglePopover,
    handleScroll,
    handleClickNotification,
    handleReadAll,
    user,
  } = useNotifications();
  const notificationsUser = user?.permission?.notification;
  const readAble = notificationsUser?.split(',').includes('read');
  const updateAble = notificationsUser?.split(',').includes('update');

  const { mobileOnly, tabletOnly } = useResponsive();

  const content = (
    <S.PopoverWrapper>
      <S.PopoverHeader className="notificationsHeader">
        <span>알림</span>
        <S.GroupButton>
          {updateAble && (
            <S.Button type="text">
              <NotificationSetting />
            </S.Button>
          )}
          <S.Button type="text" onClick={handleTogglePopover}>
            <CloseOutlined />
          </S.Button>
        </S.GroupButton>
      </S.PopoverHeader>

      <S.Divider />

      <S.PopoverContent>
        <Notifications
          notifications={notifications}
          ref={notificationRef}
          isLoading={isPending}
          onScroll={handleScroll}
          onClickItem={handleClickNotification}
          onReadAll={handleReadAll}
        />
      </S.PopoverContent>
    </S.PopoverWrapper>
  );

  if (!readAble) return null;

  return (
    <S.Wrapper>
      <S.GlobalStyles />
      <S.PopoverComponent
        placement="rightTop"
        content={content}
        trigger="click"
        open={openPopover}
        onOpenChange={readAble ? handleTogglePopover : undefined}
        getPopupContainer={(triggerNode) =>
          mobileOnly || tabletOnly ? document.body : triggerNode
        }
        rootClassName={mobileOnly || tabletOnly ? 'notificationsRoot' : ''}
      >
        <S.CustomBadge $disabled={!readAble}>
          {totalUnRead > 0 ? <IconBellActive /> : <IconBell />}
        </S.CustomBadge>
      </S.PopoverComponent>
    </S.Wrapper>
  );
};

export default memo(Notification);
