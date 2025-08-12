import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { BaseSpin } from '../base-spin';
import * as S from './index.styles';

export interface BaseFeedProps {
  next: () => void;
  hasMore: boolean;
  children: React.ReactNode[];
  target?: string;
}

export const BaseFeed: React.FC<BaseFeedProps> = ({
  next,
  hasMore,
  target = 'main-content',
  children,
}) => {
  return (
    <InfiniteScroll
      dataLength={children.length}
      next={next}
      hasMore={hasMore}
      loader={
        <S.SpinnerWrapper>
          <BaseSpin size="large" />
        </S.SpinnerWrapper>
      }
      scrollableTarget={target}
      style={{ overflow: 'visible' }}
    >
      <S.NewsWrapper>{children}</S.NewsWrapper>
    </InfiniteScroll>
  );
};
