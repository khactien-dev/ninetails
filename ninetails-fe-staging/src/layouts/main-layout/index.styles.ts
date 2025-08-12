import BgMain from '@/assets/images/common/bg1.jpg';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Section = styled.section`
  background-image: url('${BgMain.src}');
  background-repeat: no-repeat;
  background-position: top center;
  background-size: cover;
  padding: 0 0 40px;
  background-color: var(--white);
  @media only screen and ${media.lg} {
    padding: 0 0 120px;
  }
`;

export const Main = styled.div`
  padding-top: 80px;
  @media only screen and ${media.lg} {
    padding-top: 130px;
  }
`;

export const Footer = styled.div`
  font-weight: ${FONT_WEIGHT.regular};
  background: var(--white);
  padding: 28px 28px;
  color: #555;
  font-size: 13px;
  line-height: 19px;
  text-align: center;
  @media only screen and ${media.sm} {
    font-size: ${FONT_SIZE.xs};
    text-align: left;
  }
`;
