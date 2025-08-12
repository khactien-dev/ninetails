import { ResultProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseResultProps = ResultProps;

export const BaseResult: React.FC<BaseResultProps> = (props) => {
  return <S.Result {...props} />;
};
