import notFoundImg from 'assets/images/nothing-found.webp';
import React from 'react';

import { BaseImage } from '../base-image';
import * as S from './index.styles';

export const NotFound: React.FC = () => {
  return (
    <S.NotFoundWrapper>
      <S.ImgWrapper>
        <BaseImage src={notFoundImg as unknown as string} alt="Not found" preview={false} />
      </S.ImgWrapper>
      <S.Text>Not Found</S.Text>
    </S.NotFoundWrapper>
  );
};
