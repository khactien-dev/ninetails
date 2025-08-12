import { media } from '@/constants';
import { Container } from 'react-naver-maps';
import { css, styled } from 'styled-components';

export const MapContainer = styled(Container)`
  width: 100%;
  height: 100%;
  .marker-icon {
  }

  .row {
    display: flex;
    width: 100%;
  }

  .space-between {
    justify-content: space-between;
  }

  .ml-auto {
    margin-left: auto;
  }

  .mapModal {
    display: block;
    position: absolute;
    bottom: 60px;
    left: -240px;
    width: 340px;
    background: #fff;
    border-radius: 15px;
    border: 1px solid #d6d7de;
    box-shadow: 0 5px 30px 0 rgba(0, 0, 0, 0.15);
    padding: 32px 19px 19px;
    z-index: 30;
  }

  .buttonCloseMapModal {
    cursor: pointer;
    display: block;
    position: absolute;
    z-index: 55;
    top: 0px;
    right: 0;
    width: 40px;
    height: 40px;
    background: url(../images/close-26-r-b111.png) center no-repeat;
    background-size: 10px 10px;
    box-shadow: none;
    border: none;
  }

  .mapModal .mmBox1 {
    display: block;
    width: 100%;
    background: #e6f3dd;
    padding: 11px 20px 15px;
    border-radius: 10px;
  }

  .mapModal .mmBox1.status1 {
    background: #d4d4d4;
  }
  .mapModal .mmBox1.status2 {
    background: #ffcfd0;
  }
  .mapModal .mmBox1.status3 {
    background: #ffebcc;
  }
  .mapModal .mmBox1.status4 {
    background: #fff8c6;
  }
  .mapModal .mmBox1.status5 {
    background: #e6f3dd;
  }
  .mapModal .mmBox1.status6 {
    background: #ccf1ff;
  }
  .mapModal .mmBox1.status7 {
    background: #c8d2fa;
  }
  .mapModal .mmBox1.status8 {
    background: #ebc3fa;
  }

  .mapModal .mmBox1.mmBox1Type2 {
    background: none;
    padding: 0;
  }

  .mapModal .mmBox1 .carNum {
    position: relative;
    display: block;
    max-width: 160px;
  }

  .mapModal .mmBox1 .carNum span {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #222;
    line-height: 28px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .mapModal .mmBox1 .carNum .carNum-tooltip {
    display: none;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px;
    width: 100%;
    height: fit-content;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 12px;
    &:before {
      content: '';
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 5px solid rgba(0, 0, 0, 0.7);
    }
  }
  .mapModal .mmBox1 .carNum:hover .carNum-tooltip {
    display: block;
  }

  .mapModal .mmBox1 .carStatus {
    display: block;

    height: 28px;
    line-height: 26px;
    text-align: center;
    padding: 0 8px;
    border-radius: 7px;
    background: #fff;
  }

  .mapModal .mmBox1 .carStatus.noIcon span {
    background: none !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mapModal .mmBox1 .carStatus span {
    display: inline-block;
    line-height: 26px;
    text-align: left;
    padding: 0 0 0 27px;
    color: #222 !important;
    font-size: 500;
    font-size: 13px;
  }

  .no-wrap {
    white-space: nowrap;
  }

  .mapModal .mmBox1 .carStatus span .boxNum {
    width: 17px !important;
    height: 17px !important;
    line-height: 17px !important;
    text-align: center !important;
    border-radius: 4px;
    margin: 0px 4px 0 0;
  }

  .mapModal .mmBox1 .carStatus1 span .boxNum {
    background: #231916 !important;
    color: #fff !important;
  }
  .mapModal .mmBox1 .carStatus2 span .boxNum {
    background: #ea5d5f !important;
    color: #fff !important;
  }
  .mapModal .mmBox1 .carStatus3 span .boxNum {
    background: #f8bd60 !important;
    color: #fff !important;
  }
  .mapModal .mmBox1 .carStatus4 span .boxNum {
    background: #ffe63a !important;
    color: #fff !important;
  }
  .mapModal .mmBox1 .carStatus5 span .boxNum {
    background: #83c257 !important;
    color: #fff !important;
  }
  .mapModal .mmBox1 .carStatus6 span .boxNum {
    background: #5fc5ed !important;
    color: #fff !important;
  }
  .mapModal .mmBox1 .carStatus7 span .boxNum {
    background: #4357aa !important;
    color: #fff !important;
  }
  .mapModal .mmBox1 .carStatus8 span .boxNum {
    background: #a34bc4 !important;
    color: #fff !important;
  }

  .mapModal .mmBox1 .carStatus1 {
    border: 1px solid #231916;
  }
  .mapModal .mmBox1 .carStatus2 {
    border: 1px solid #ea5d5f;
  }
  .mapModal .mmBox1 .carStatus3 {
    border: 1px solid #f8bd60;
  }
  .mapModal .mmBox1 .carStatus4 {
    border: 1px solid #ffe63a;
  }
  .mapModal .mmBox1 .carStatus5 {
    border: 1px solid #83c257;
  }
  .mapModal .mmBox1 .carStatus6 {
    border: 1px solid #5fc5ed;
  }
  .mapModal .mmBox1 .carStatus7 {
    border: 1px solid #4357aa;
  }
  .mapModal .mmBox1 .carStatus8 {
    border: 1px solid #a34bc4;
  }

  .mapModal .mmBox1 .carStatus1 span {
    background: url(../images/car0.svg) left no-repeat;
    background-size: 20px 12px;
  }

  .mapModal .mmBox1 .carStatus2 span {
    background: url(../images/car_red.svg) left no-repeat;
    background-size: 20px 12px;
  }

  .mapModal .mmBox1 .carStatus3 span {
    background: url(../images/map/car-orange.svg) left no-repeat;
    background-size: 20px 12px;
  }

  .mapModal .mmBox1 .carStatus4 span {
    background: url(../images/car2.svg) left no-repeat;
    background-size: 20px 12px;
  }

  .mapModal .mmBox1 .carStatus5 span {
    background: url(../images/car1.svg) left no-repeat;
    background-size: 20px 12px;
  }

  .mapModal .mmBox1 .carStatus6 span {
    background: url(../images/car3.svg) left no-repeat;
    background-size: 20px 12px;
  }

  .mapModal .mmBox1 .carStatus7 span {
    background: url(../images/car_nav.svg) left no-repeat;
    background-size: 20px 12px;
  }

  .mapModal .mmBox1 .carStatus8 span {
    background: url(../images/car_violet.svg) left no-repeat;
    background-size: 20px 12px;
  }

  .mapModal .mmBox1 .row {
    margin: 5px 0 0;
  }

  .mapModal .mmBox1 .row2,
  .mapModal .mmBox1 .row1 {
    justify-content: space-between;
    padding: 0 0 5px;
  }

  .mapModal .mmBox1 .row .t1 {
    display: block;
    float: left;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
    text-align: left;
  }

  .mapModal .mmBox1 .row .t2 {
    display: block;
    float: right;
    font-size: 14px;
    line-height: 22px;
    font-weight: 400;
    text-align: right;
  }

  .mapModal .mmBox2 .mmBox2Inside {
    display: block;
    width: calc(100% + 20px);
    padding: 0 12px 0 0;
    max-height: 100px;
    overflow-y: scroll;
  }

  .mapModal .mmBox2 .mmBox2Inside::-webkit-scrollbar {
    width: 8px;
  }

  .mapModal .mmBox2 .mmBox2Inside::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  .mapModal .mmBox2 .mmBox2Inside::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0);
  }

  .mapModal .mmBox2 {
    display: block;
    width: 100%;
    padding: 11px 20px 0;
  }

  .mapModal .mmBox2 .row .t1 {
    display: block;
    float: left;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
    text-align: left;
  }

  .mapModal .mmBox2 .row .t1.t1Fix {
    width: 60px;
  }

  .mapModal .mmBox2 .row .t1graph {
    width: 70px;

    height: 10px;
    background: #e0e0e0;
    margin: 6px 0 0;
  }

  .mapModal .mmBox2 .row .t1graph .bar {
    height: 10px;
    background: var(--blue);
  }

  .mapModal .mmBox2 .row .t2 {
    display: block;
    float: right;
    font-size: 14px;
    line-height: 22px;
    font-weight: 400;
    text-align: right;
  }

  .mapModal .mmBox2 .row .t2 .ss1 {
    color: var(--blue);
  }

  //
  .carModal {
    display: block;
    position: absolute;
    top: -250px;
    left: -240px;
    width: 340px;
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 5px 30px 0 rgba(0, 0, 0, 0.15);
    padding: 0;
    z-index: 30;
    @media only screen and ${media.md} {
      width: 520px;
    }
  }

  .carModal .buttonCloseMapModal {
    right: -44px;
    background-color: #fff;
    border-radius: 3px;
    border: 1px solid #a0a0a0;
  }

  .carBox1 {
    padding: 20px;
    background: #57ba00;
    color: #fff;
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    border-radius: 15px 15px 0 0;
  }
  .carBox1-title {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .carBox1-title .label {
    font-size: 18px;
    line-height: 28px;
  }
  .carBox1-title .value {
    font-size: 14px;
    line-height: 22px;
    color: #57ba00;
    border-radius: 4px;
    background-color: #fff;
    padding: 5px 12px 5px 47px;
    background-image: url(../images/map/icon-map-car-car.svg);
    background-position: 14px center;
    background-repeat: no-repeat;
  }
  .carBox1-content .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  .wrapper {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 20px;
    overflow-y: auto;
    max-height: 470px;
  }

  .point {
    margin-top: 40%;
    margin-bottom: 40%;
    height: fit-content;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    border-radius: 2px;
    background: rgba(255, 46, 145, 0.05);
  }

  .point .point-title p {
    font-size: 12px;
    font-weight: 600;
  }

  .carBox2 {
    width: 60%;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
  }

  .carBox2 .item .row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .carBox2 .item .row .col1 {
    flex: 0 0 25%;
  }
  .carBox2 .item .row .col2 {
    flex: 0 0 10%;
    justify-content: center;
    display: flex;
  }
  .carBox2 .item .row .col3 {
    flex: 0 0 44%;
    padding-left: 15px;
    @media only screen and ${media.md} {
      padding-left: 25px;
    }
  }
  .carBox2 .item .row .col4 {
    flex: 0 0 28%;
  }
  .carBox2 .item .row.top .col1 {
    font-size: 12px;
  }
  .carBox2 .item .row.top .col1 strong {
    font-size: 14px;
  }
  .carBox2 .item .row.top .col2 figure {
    background-repeat: no-repeat;
    background-position: center;
    width: 40px;
    height: 40px;
    border: 1px solid #a0a0a0;
    border-radius: 50%;
  }
  .carBox2 .item .row.top .col2.home figure {
    background: url(../images/map/icon-map-car-home.svg) center no-repeat;
  }
  .carBox2 .item .row.top .col2.in figure {
    background: url(../images/map/icon-map-car-in.svg) center no-repeat;
  }
  .carBox2 .item .row.top .col2.out figure {
    background: url(../images/map/icon-map-car-out.svg) center no-repeat;
  }
  .carBox2 .item .row.top .col2.clean figure {
    background: url(../images/map/icon-map-car-eat.svg) center no-repeat;
  }
  .carBox2 .item .row.bottom {
    margin: 10px 0 20px;
  }
  .carBox2 .item .row.bottom .col2 {
    margin-bottom: -10px;
  }
  .carBox2 .item .row.bottom .col2 figure {
    width: 40px;
    height: 67px;
    text-align: center;
  }
  .carBox2 .item .row.bottom .col3 .status {
    white-space: nowrap;
    font-size: 16px;
  }
  .carBox2 .item .row.bottom .col3 .time {
    color: #a0a0a0;
    margin: 11px 0 0 0;
  }
  .carBox2 .item .row.bottom .col4 {
    border-radius: 2px;
    background: rgba(255, 46, 145, 0.05);
    padding: 10px;
    display: block;
    gap: 10px;
    align-items: center;
    @media only screen and ${media.md} {
      display: flex;
    }
  }
  .carBox2 .item .row.bottom .col4:empty {
    display: none;
  }
  .carBox2 .item .row.bottom .col4 .title span {
    font-size: 12px;
    display: block;
  }
  .carBox2 .item .row.bottom .col4 figure {
    width: 26px;
    height: 26px;
    background: url(../images/map/icon-map-car-vector.svg) center no-repeat;
  }
  .carBox2 .item .row.bottom .col2.yellow figure {
    background: url(../images/map/icon-map-car-yellow.svg) center no-repeat;
  }
  .carBox2 .item .row.bottom .col2.pink figure {
    background: url(../images/map/icon-map-car-pink.svg) center no-repeat;
  }
  .carBox2 .item .row.bottom .col2.green figure {
    background: url(../images/map/icon-map-car-green.svg) center no-repeat;
  }

  .carBox3 {
    border-top: 1px solid #a0a0a0;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .carBox3 figure {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid #a0a0a0;
    background: url(../images/map/icon-map-car-location.svg) center no-repeat;
  }
  .carBox3 .info .title {
    display: flex;
    align-items: center;
    gap: 13px;
  }
  .carBox3 .info .title .distance {
    font-size: 16px;
    line-height: 22px;
  }
  .carBox3 .info .title .km {
    font-size: 14px;
    font-weight: 700;
    line-height: 22px;
  }
  .carBox3 .info .desc {
    color: #a0a0a0;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
  }
  .overlay-detail {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 29;
  }
`;

export const ControlButton = styled.button<{
  $isExport?: boolean;
  $actived?: boolean;
}>`
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 3px;
  border: 1px solid #a0a0a0;
  background: #fff;
  background-size: 16px 16px;
  margin-bottom: 6px;
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
  }
  ${({ $actived }) =>
    $actived &&
    css`
      border-color: var(--primary-color);
      background-color: var(--primary-color);
      svg g {
        fill: var(--primary-color);
        stroke: #fff;
        path {
          stroke: var(--primary-color);
          fill: #fff;
        }
      }

      svg g circle {
        fill: var(--primary-color);
      }

      svg path {
        stroke: #fff;
      }
    `}
`;

export const ControlWrap = styled.div<{ $isExport?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: ${(props) => (props.$isExport ? '10px' : '2rem')};
`;
