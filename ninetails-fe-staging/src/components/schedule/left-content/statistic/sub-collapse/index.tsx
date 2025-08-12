import * as S from '@/components/schedule/left-content/statistic/index.styles';
import React, { useState } from 'react';

interface ISubCollapse {
  children: React.ReactElement;
  titles: {
    title: string;
    value: number | string;
    unit: string;
    withBracket?: boolean;
  }[];
}

export const SubCollapse: React.FC<ISubCollapse> = (props) => {
  const { children, titles } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <S.WrapContentSection>
      <S.WrapContentItemHeader onClick={() => setIsOpen((prev) => !prev)}>
        {titles.map((item, index) => (
          <S.ContentItemHeaderTitle key={index}>
            {item.withBracket && <S.Bracket>[</S.Bracket>}
            <S.SubTitle>{item.title}</S.SubTitle>&nbsp;&nbsp;
            <S.TotalValue>
              {item.value}
              {item.unit}
            </S.TotalValue>
            {item.withBracket && <S.Bracket>]</S.Bracket>}
          </S.ContentItemHeaderTitle>
        ))}
        <div>
          <S.ArrowIcon isActive={isOpen} />
        </div>
      </S.WrapContentItemHeader>
      {isOpen && children}
    </S.WrapContentSection>
  );
};
