import React from 'react';

import * as S from './index.styles';

interface IProps {
  isOpen: boolean;
  onToogle: () => void;
  title: string;
  textSize?: 'md' | 'xl';
}

export const ScheduleCollapse: React.FC<IProps> = (props) => {
  const { isOpen, onToogle, title, textSize = 'md' } = props;

  return (
    <S.WrapTitle>
      <S.Title onClick={() => onToogle()} size={textSize}>
        {title}
      </S.Title>
      <S.ArrowIcon onClick={() => onToogle()} isActive={isOpen} />
    </S.WrapTitle>
  );
};
