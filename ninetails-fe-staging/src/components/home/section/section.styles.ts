import styled from 'styled-components';
import { Swiper } from 'swiper/react';

export const SwiperPagination = styled.div`
  text-align: center;
  width: 100%;
  position: absolute;
  left: 0;
  z-index: 50;
  bottom: 30px !important;
  & .swiper-pagination-bullet {
    opacity: 1 !important;
    border-radius: 50% !important;
    width: 18px !important;
    height: 18px !important;
    background: none !important;
    border: 2px solid #fff !important;
    margin: 0 7px !important;
  }
  & .swiper-pagination-bullet-active {
    background: #fff !important;
  }
`;
export const SwiperWrapper = styled(Swiper)`
  & .swiper-pagination2a {
    text-align: center;
    width: 100%;
    position: absolute;
    left: 0;
    z-index: 50;
    bottom: 30px !important;
  }

  & .swiper-pagination2a .swiper-pagination-bullet {
    opacity: 1 !important;
    border-radius: 50% !important;
    width: 18px !important;
    height: 18px !important;
    background: none !important;
    border: 2px solid #fff !important;
    margin: 0 7px !important;
  }

  & .swiper-pagination2a .swiper-pagination-bullet-active {
    background: #fff !important;
  }
`;
