import IconSetting from '@/assets/images/svg/notification/setting.svg';
import { useResponsive } from '@/hooks/useResponsive';
import { queryClient } from '@/utils/react-query';
import { CloseOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

import * as S from '../index.styles';
import NotificationSettingForm from './setting-form';

const NotificationSetting: React.FC = () => {
  const [openPopover, setOpenPopover] = useState(false);
  const { mobileOnly, tabletOnly } = useResponsive();

  const handleTogglePopover = () => {
    if (!openPopover) {
      queryClient.invalidateQueries({
        queryKey: ['setting-notification'],
      });
    }
    setOpenPopover(!openPopover);
  };

  const content = (
    <S.PopoverWrapper>
      <S.PopoverHeader className="notificationsSettingHeader">
        <span>알림 설정</span>
        <S.GroupButton>
          <S.Button type="text" onClick={handleTogglePopover}>
            <CloseOutlined />
          </S.Button>
        </S.GroupButton>
      </S.PopoverHeader>

      <S.PopoverContent>
        <NotificationSettingForm />
      </S.PopoverContent>
    </S.PopoverWrapper>
  );

  return (
    <S.Wrapper>
      <S.PopoverComponent
        placement="rightTop"
        content={content}
        trigger="click"
        open={openPopover}
        getPopupContainer={(triggerNode) =>
          mobileOnly || tabletOnly ? document.body : triggerNode
        }
        onOpenChange={handleTogglePopover}
        rootClassName={mobileOnly || tabletOnly ? 'notificationsSettingRoot' : ''}
      >
        <React.Fragment>
          <IconSetting />
        </React.Fragment>
      </S.PopoverComponent>
    </S.Wrapper>
  );
};

export default NotificationSetting;
