import { BaseButton } from '@/components/common/base-button';
import styled from 'styled-components';

export const Wrapper = styled.section``;

export const Notifications = styled.div`
  max-height: min(520px, calc(100vh - 170px));
  overflow: auto;
  padding: 10px 10px 10px 0;
`;

export const ButtonWrapper = styled.div`
  margin-top: 15px;
`;

export const Button = styled(BaseButton)`
  background: var(--green);
  color: var(--white) !important;
  padding: 0px 50px;
  margin-top: 20px;
  font-size: 12px;
  height: 32px;
  margin: auto;
  width: 140px;
  border-radius: 4px;
`;

export const NotiItem = styled.div<{ $isRead?: boolean }>`
  border: 1px solid transparent;
  border-color: ${(props) => (props.$isRead ? '#D6D7DE' : '#57BA00')};
  background-color: ${(props) => (props.$isRead ? '' : 'var(--primary1-color)')};
  cursor: pointer;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  line-height: 1;
`;

export const IconStatus = styled.div`
  margin-right: 5px;
`;

export const ContentWrapper = styled.div`
  margin-left: 7px;
  color: #383b40;
`;

export const TimeWithTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

export const Title = styled.span`
  font-size: 16px;
  font-weight: bold;
  margin-right: 24px;
  min-width: 150px;
`;

export const Time = styled.span`
  font-size: 14px;
  color: #a2a2a2;
`;

export const Area = styled.span`
  font-size: 14px;
  font-weight: bold;
  margin-right: 5px;
`;

export const Text = styled.span`
  color: #a2a2a2;
`;

export const Description = styled.span`
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

export const IconLoad = styled.div`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  z-index: 1;
  svg {
    filter: invert(156%) sepia(6%) saturate(7476%) hue-rotate(195deg) brightness(95%) contrast(103%);
    opacity: 0.2;
  }
`;

export const Loading = styled.p`
  text-align: center;
`;
