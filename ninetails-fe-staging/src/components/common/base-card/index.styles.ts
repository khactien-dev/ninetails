import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import { normalizeProp } from '@/utils';
import { Card as AntCard } from 'antd';
import styled from 'styled-components';

interface CardInternalProps {
  $padding: string | number | [number, number];
  $autoHeight: boolean;
}

export const Card = styled(AntCard)<CardInternalProps>`
  display: flex;
  flex-direction: column;

  ${(props) => props.$autoHeight && 'height: 100%'};

  .ant-card-head {
    border-bottom: 0;
    font-weight: ${FONT_WEIGHT.bold};

    padding-top: 15px;
    padding-bottom: 15px;
    min-height: 36px;

    @media only screen and ${media.md} {
      padding-top: 20px;
      padding-bottom: 0;
      min-height: 48px;
    }

    @media only screen and ${media.xl} {
      font-size: ${FONT_SIZE.xxl};
    }

    .ant-card-head-title {
      white-space: unset;
      overflow: unset;
      padding-bottom: 0;

      @media only screen and ${media.xl} {
        padding-bottom: 0.25rem;
      }
    }
  }

  .ant-card-body {
    flex-grow: 1;

    padding: ${(props) => props.$padding && normalizeProp(props.$padding)};
  }

  .ant-card-bordered {
    border-color: #f0f0f0;
  }
`;
