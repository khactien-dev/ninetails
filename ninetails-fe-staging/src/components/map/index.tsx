import React from 'react';
import { NavermapsProvider } from 'react-naver-maps';

import * as S from './index.style';
import BaseMap from './naver-map';

const Map = () => {
  return (
    <NavermapsProvider ncpClientId={process.env.NEXT_PUBLIC_NAVER_API_KEY || ''}>
      <S.MapContainer>
        <BaseMap />
      </S.MapContainer>
    </NavermapsProvider>
  );
};

export default Map;
