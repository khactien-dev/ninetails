import { ParagraphProps } from 'antd/es/typography/Paragraph';
import React from 'react';

import * as S from './index.styled';

export const BaseTooltipParagraph: React.FC<ParagraphProps> = ({ children }) => {
  return (
    <S.BaseParagraph ellipsis={{ tooltip: children }}>
      <>{children}</>
    </S.BaseParagraph>
  );
};
