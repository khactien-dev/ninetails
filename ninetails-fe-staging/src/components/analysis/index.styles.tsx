import { BaseRow } from '@/components/common/base-row';
import { media } from '@/constants';
import styled from 'styled-components';

export const TablesWrapper = styled(BaseRow)`
  flex-direction: column;
  @media only screen and ${media.xl} {
    flex-direction: row;
  }

  .item {
    border: 1px solid #d0d0d0 !important;
    border-radius: 5px !important;
    margin-left: 20px;
    height: 34px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: start;
  }
`;

export const WrapContent = styled.div`
  flex: 1;
  padding: 1rem 1rem 0 1rem;

  background-color: #f6f6f9;
`;

export const MainContent = styled.div`
  display: block;
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--box-shadow);
  padding: 24px 28px 30px;
`;

export const FilterResult = styled.div`
  font-size: 20px;
  margin-bottom: 32px;

  span {
    font-weight: 700;
    margin-right: 24px;
    display: inline-block;
  }
`;
