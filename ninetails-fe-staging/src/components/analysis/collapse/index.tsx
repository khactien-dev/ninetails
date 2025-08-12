import { BasePopover } from '@/components/common/base-popover';
import React, { useState } from 'react';

import * as S from './index.styles';

interface SelectCollapse {
  title?: string;
  typeTitle?: string;
  children?: React.ReactNode;
  defaultCollapsed?: boolean;
  type?: 'sumary' | 'detail';
  icon?: React.ReactNode;
  onSetting?: () => void;
  settingContent?: React.ReactElement;
}

const Collapse = (props: SelectCollapse) => {
  const {
    title,
    typeTitle = null,
    icon = null,
    children,
    defaultCollapsed = true,
    type = 'sumary',
    onSetting,
    settingContent,
  } = props;
  const [setCollapse, isSetCollapse] = useState(defaultCollapsed);

  const onChange = () => {
    isSetCollapse(!setCollapse);
  };

  return (
    <S.CollapseContainer type={type}>
      <S.Title collapsed={setCollapse}>
        {type === 'detail' && (
          <BasePopover content={settingContent} trigger="click" zIndex={10} placement="right">
            <S.GearButton
              onClick={() => {
                onSetting && onSetting();
              }}
            />
          </BasePopover>
        )}
        {icon && <S.Icon> {icon} </S.Icon>}
        <S.Div>
          {typeTitle} <S.TitleContent type={type}>{title}</S.TitleContent>{' '}
        </S.Div>
        <S.ArrowButton onClick={onChange} collapsed={setCollapse} />
      </S.Title>
      <S.Wrapper collapsed={setCollapse}>{children}</S.Wrapper>
    </S.CollapseContainer>
  );
};

export default Collapse;
