import React from 'react';

import * as S from './index.styles';

interface MainFooterProps {
  isShow: boolean;
}

export const MainFooter: React.FC<MainFooterProps> = ({ isShow }) => {
  return (
    <S.Footer $isShow={isShow}>{'Copyright 2024. SuperBucket © all rights reserved.'} </S.Footer>
  );
};
