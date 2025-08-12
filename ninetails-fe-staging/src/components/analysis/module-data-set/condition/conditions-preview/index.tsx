import React from 'react';

import { ConditionPreview } from '../condition-preview';
import * as S from './../index.style';

interface IProps {
  conditions: any;
}

export const ConditionsPreview: React.FC<IProps> = (props) => {
  const { conditions } = props;

  return (
    <S.WrapCondition>
      <S.Content>
        {conditions.map((item: any, index: number) => (
          <ConditionPreview initialValues={item} key={index} />
        ))}
      </S.Content>
    </S.WrapCondition>
  );
};
