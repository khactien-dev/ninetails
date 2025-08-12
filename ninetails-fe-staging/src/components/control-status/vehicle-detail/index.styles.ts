import { BaseButton } from '@/components/common/base-button';
import { media } from '@/constants/theme';
import { Tabs } from 'antd';
import styled from 'styled-components';

export const FullScreen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const VehicleDetail = styled.div``;

export const ExportWrapper = styled.div`
  /* background-color: #f7f6f9; */
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

export const Wrapper = styled.div`
  padding: 16px;
  margin-bottom: 10px;
  background: var(--white);
  position: relative;
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Title = styled.div`
  h3 {
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
    margin-bottom: 10px;
  }
`;

export const Description = styled.p`
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 0;
`;

export const CardInfo = styled.div`
  padding: 1.25rem;
  border-radius: 8px;
  background: var(--Primary-Green-50, #eef8e6);
  color: var(--primary-color);
`;

export const CardTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

export const Label = styled.div`
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 700;
  line-height: 28px;
`;

export const Value = styled.div`
  color: var(--white);
  font-size: 14px;
  font-weight: 700;
  line-height: 22px;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--primary-color);
  padding: 4px 12px;
  border-radius: 4px;
`;

export const CardContent = styled.div``;

export const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 0.5rem;
  &:last-child {
    margin-bottom: 0;
  }
`;

export const AntTabs = styled(Tabs)``;

export const Flex = styled.div`
  display: flex;
  gap: 1rem;
`;

export const RouteHistory = styled.div`
  width: 100%;
  display: flex;
  padding-top: 6px;
  padding-bottom: 6px;
  gap: 0.5rem;
  padding-right: 85px;
  &:last-child {
    .route-history-distance,
    .route-history-time {
      display: none;
    }
    .route-history-arrow {
      visibility: hidden;
    }
    strong {
      margin-bottom: 0;
      margin-top: 0.5rem;
    }
  }
`;

export const RouteTime = styled.div`
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  padding-top: 8px;
`;

export const RouteInfor = styled.div`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  p,
  strong {
    display: block;
    margin-bottom: 0.5rem;
  }
  p {
    color: #a3a5a7;
  }
`;

export const RouteType = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0.75rem;
  figure {
    background-repeat: no-repeat;
    background-position: center;
    width: 40px;
    height: 40px;
    border: 1px solid #a0a0a0;
    border-radius: 50%;
  }
`;

export const Score = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  max-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  border-radius: 2px;
  background: rgba(255, 46, 145, 0.05);
  padding: 10px;
  p,
  strong {
    display: block;
    white-space: nowrap;
  }
  svg {
    cursor: pointer;
    margin-top: 0.5rem;
  }
`;

export const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1rem 0;
  figure {
    width: 40px;
    height: 40px;
    border-radius: 40px;
    border: 1px solid #a0a0a0;
    background: url(../images/map/icon-map-car-location.svg) center no-repeat;
  }
  p {
    display: block;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 22px;
    margin-bottom: 0;
  }
  span {
    display: block;
    color: var(--Text-Tertiary, #a3a5a7);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
  }
`;

export const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const CloseButton = styled(BaseButton)`
  position: absolute;
  right: 0;
  top: 0;
  border: none;
  z-index: 1;
  border-radius: 0 4px 4px 0 !important;
  @media only screen and ${media.custom} {
    left: 100%;
    right: auto;
  }
`;
