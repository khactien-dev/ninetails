import { BASE_COLORS, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

interface AdmnMenuIcon {
  $isActive: boolean;
  $isSuperAdmin: boolean;
}

export const LeftMenuWrapper = styled.div`
  display: block;
  background: #fff;

  top: 0;
  left: 60px;
  /* border-right: 1px solid #d6d7de; */
  /* box-shadow: 15px 0 20px 0 rgba(0, 0, 0, 0.07); */
  padding: 0px 30px 0;
  cursor: pointer;

  @media only screen and ${media.lg} {
    padding: 32px 30px 0;
  }
`;

export const AdmenuWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  row-gap: 12px;
  margin: 28px 0 0;
`;

export const AdmnMenu = styled.div<{
  $disabled?: boolean;
  $isActive: boolean;
  $isSuperAdmin: boolean;
}>`
  display: block;
  width: calc((100% - 24px) / 3);
  padding: 14px 4px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-secondary-color);
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  background-color: ${(props) =>
    props.$isActive && !props.$isSuperAdmin
      ? '#57BA00'
      : props.$isActive && props.$isSuperAdmin
      ? '#0085f7'
      : 'var(--white)'};
`;

export const AdmMenuIcon = styled.div<AdmnMenuIcon>`
  width: 60px;
  height: 60px;
  margin: 0 auto 10px;
  border-radius: 50%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid
    ${(props) =>
      !props.$isActive ? 'transparent' : !props.$isSuperAdmin ? 'var(--btn-content)' : '#0085f7'};
  background-color: ${(props) =>
    props.$isActive ? '#fff' : !props.$isSuperAdmin ? '#EEF8E6' : '#f0f8ff'};
`;

export const AdmMenuName = styled.span<AdmnMenuIcon>`
  display: block;
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  font-weight: ${(props) => (props.$isActive ? FONT_WEIGHT.bold : FONT_WEIGHT.regular)};
  color: ${(props) =>
    props.$isActive && props.$isSuperAdmin
      ? 'var(--white)'
      : props.$isActive && !props.$isSuperAdmin
      ? 'var(--white)'
      : 'var(--text-light-color)'};
  .ant-layout-sider {
    color: ${(props) =>
      !props.$isActive
        ? '#777'
        : !props.$isSuperAdmin
        ? 'var(--btn-content)'
        : '#0085f7'} !important;
  }
`;

export const UserInfo = styled.div`
  color: #404040;
  text-align: center;
  margin-top: 50px;
  span {
    color: ${BASE_COLORS.green};
    font-weight: ${FONT_WEIGHT.bold};
  }
`;

export const AdminOP = styled.div`
  text-align: center;
  color: #404040;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  margin-bottom: 50px;
  strong {
    font-family: ${FONT_WEIGHT.bold} !important;
  }
  .supper {
    color: #0085f7;
  }
  .op {
    color: var(--primary-color);
  }
`;
