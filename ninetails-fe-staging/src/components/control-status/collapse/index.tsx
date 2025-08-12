import React, { useState } from 'react';

import * as S from '../index.style';

interface CollapseProps {
  children: React.ReactNode;
  title: React.ReactNode;
  defaultCollased: boolean;
  hasTooltip: boolean;
  tooltip: React.ReactNode;
  extraTitle?: React.ReactNode;
  disabled?: boolean;
}

const Collapse: React.FC<CollapseProps> = ({
  children,
  title,
  defaultCollased,
  extraTitle,
  hasTooltip,
  tooltip,
  disabled = false,
}) => {
  const [visble, setVisble] = useState<boolean>(defaultCollased);

  return (
    <S.Eco>
      <S.EcoTitle>
        <S.WrapTitle>
          {hasTooltip && tooltip && (
            <S.Tooltip
              placement="bottomLeft"
              title={tooltip}
              getPopupContainer={(triggerNode) => triggerNode}
            >
              ?
            </S.Tooltip>
          )}

          <S.Title onClick={() => !disabled && setVisble((prev) => !prev)} open={visble}>
            {title}
          </S.Title>
          {extraTitle}
        </S.WrapTitle>

        {/* <S.EcoTitleValue>97점</S.EcoTitleValue> */}
      </S.EcoTitle>

      <S.Content open={visble}>{children}</S.Content>
    </S.Eco>
  );
};

export default Collapse;
