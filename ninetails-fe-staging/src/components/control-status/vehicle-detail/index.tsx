import { ROUTER_PATH } from '@/constants';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { IMetrics } from '@/interfaces';
import { getDriveState, kmConversion, minuteToTime } from '@/utils/control';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

import { IParams } from '../index.utils';
import * as S from './index.styles';
import RouteHistory from './route-history';

interface VehicleDetailProps {
  isError?: boolean;
  isLoading?: boolean;
  setDetailModal: (value: boolean) => void;
  params: IParams;
  metricData?: IMetrics;
}

const VehicleDetail: React.FC<VehicleDetailProps> = ({
  params,
  isError,
  metricData,
  isLoading,
  setDetailModal,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useOnClickOutside(contentRef, () => setDetailModal(false));
  const router = useRouterWithAuthorize();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isLoading)
    return (
      <S.FullScreen ref={contentRef}>
        <S.CloseButton size="small" onClick={() => setDetailModal(false)}>
          <CloseOutlined />
        </S.CloseButton>
        <S.Loading>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </S.Loading>
      </S.FullScreen>
    );

  if (isError || !metricData)
    return (
      <S.FullScreen ref={contentRef}>
        <S.CloseButton size="small" onClick={() => setDetailModal(false)}>
          <CloseOutlined />
        </S.CloseButton>
        <S.Loading>차량을 찾을 수 없습니다</S.Loading>
      </S.FullScreen>
    );

  return (
    <S.VehicleDetail ref={contentRef}>
      <S.CloseButton size="small" onClick={() => setDetailModal(false)}>
        <CloseOutlined />
      </S.CloseButton>
      <S.Wrapper>
        {/* <S.Title>Title</S.Title>
        <S.Description>Description</S.Description> */}

        {/* Card infor */}
        <S.CardInfo>
          <S.CardTitle>
            <S.Label>
              <strong>{metricData?.vehicleInfo?.[0]?.vehicle_number || '--'}</strong>
            </S.Label>
            <S.Value>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  opacity="0.2"
                  d="M2.25 10V16C2.25 16.1989 2.32902 16.3897 2.46967 16.5303C2.61032 16.671 2.80109 16.75 3 16.75H5.25C5.25 16.1533 5.48705 15.581 5.90901 15.159C6.33097 14.7371 6.90326 14.5 7.5 14.5C8.09674 14.5 8.66903 14.7371 9.09099 15.159C9.51295 15.581 9.75 16.1533 9.75 16.75H15.75C15.75 16.1533 15.9871 15.581 16.409 15.159C16.831 14.7371 17.4033 14.5 18 14.5C18.5967 14.5 19.169 14.7371 19.591 15.159C20.0129 15.581 20.25 16.1533 20.25 16.75H22.5C22.6989 16.75 22.8897 16.671 23.0303 16.5303C23.171 16.3897 23.25 16.1989 23.25 16V12.25H8.25V10H2.25Z"
                  fill="#EEF8E6"
                />
                <path
                  d="M1.55437 9.71875L2.86687 6.4375C2.97822 6.15988 3.17037 5.92209 3.41842 5.75494C3.66648 5.58778 3.95901 5.49897 4.25813 5.5H7.5V4.75C7.5 4.55109 7.57902 4.36032 7.71967 4.21967C7.86032 4.07902 8.05109 4 8.25 4H22.5C22.8978 4 23.2794 4.15804 23.5607 4.43934C23.842 4.72064 24 5.10218 24 5.5V16C24 16.3978 23.842 16.7794 23.5607 17.0607C23.2794 17.342 22.8978 17.5 22.5 17.5H20.9062C20.741 18.1453 20.3657 18.7173 19.8395 19.1257C19.3133 19.5342 18.6661 19.7559 18 19.7559C17.3339 19.7559 16.6867 19.5342 16.1605 19.1257C15.6343 18.7173 15.259 18.1453 15.0938 17.5H10.4062C10.241 18.1453 9.86572 18.7173 9.33952 19.1257C8.81331 19.5342 8.16613 19.7559 7.5 19.7559C6.83387 19.7559 6.18669 19.5342 5.66048 19.1257C5.13428 18.7173 4.75898 18.1453 4.59375 17.5H3C2.60217 17.5 2.22064 17.342 1.93934 17.0607C1.65804 16.7794 1.5 16.3978 1.5 16V10C1.49965 9.9036 1.51812 9.80807 1.55437 9.71875ZM7.5 7H4.25813L3.35813 9.25H7.5V7ZM22.5 5.5H9V11.5H22.5V5.5ZM18 18.25C18.2967 18.25 18.5867 18.162 18.8334 17.9972C19.08 17.8324 19.2723 17.5981 19.3858 17.324C19.4994 17.0499 19.5291 16.7483 19.4712 16.4574C19.4133 16.1664 19.2704 15.8991 19.0607 15.6893C18.8509 15.4796 18.5836 15.3367 18.2926 15.2788C18.0017 15.2209 17.7001 15.2506 17.426 15.3642C17.1519 15.4777 16.9176 15.67 16.7528 15.9166C16.588 16.1633 16.5 16.4533 16.5 16.75C16.5 17.1478 16.658 17.5294 16.9393 17.8107C17.2206 18.092 17.6022 18.25 18 18.25ZM10.4062 16H15.0938C15.259 15.3547 15.6343 14.7827 16.1605 14.3743C16.6867 13.9658 17.3339 13.7441 18 13.7441C18.6661 13.7441 19.3133 13.9658 19.8395 14.3743C20.3657 14.7827 20.741 15.3547 20.9062 16H22.5V13H9V14.1541C9.34491 14.3534 9.64681 14.6192 9.88821 14.936C10.1296 15.2529 10.3057 15.6146 10.4062 16ZM7.5 18.25C7.79667 18.25 8.08668 18.162 8.33336 17.9972C8.58003 17.8324 8.77229 17.5981 8.88582 17.324C8.99935 17.0499 9.02906 16.7483 8.97118 16.4574C8.9133 16.1664 8.77044 15.8991 8.56066 15.6893C8.35088 15.4796 8.08361 15.3367 7.79263 15.2788C7.50166 15.2209 7.20006 15.2506 6.92597 15.3642C6.65189 15.4777 6.41762 15.67 6.2528 15.9166C6.08797 16.1633 6 16.4533 6 16.75C6 17.1478 6.15804 17.5294 6.43934 17.8107C6.72064 18.092 7.10217 18.25 7.5 18.25ZM3 16H4.59375C4.76096 15.3563 5.13697 14.7862 5.66288 14.379C6.18879 13.9718 6.8349 13.7506 7.5 13.75V10.75H3V16Z"
                  fill="#EEF8E6"
                />
              </svg>
              <span>{getDriveState(metricData?.latestDriveMetric?.drive_mode)?.name || '--'}</span>
            </S.Value>
          </S.CardTitle>

          <S.CardContent>
            <S.Item>
              <p>최종업데이트</p>
              <strong>{dayjs(metricData?.latestDriveMetric?.timestamp).fromNow() || '--'}</strong>
            </S.Item>

            <S.Item>
              <p>오늘 배차</p>
              <strong>{metricData?.vehicleRoute?.[0]?.route_name || '--'}</strong>
            </S.Item>

            <S.Item>
              <p>현재 위치</p>
              <strong>{metricData?.currentLocation || '--'}</strong>
            </S.Item>
          </S.CardContent>
        </S.CardInfo>
      </S.Wrapper>

      <S.Wrapper>
        <RouteHistory history={metricData?.dispatchHistory} height={windowSize.height - 367} />

        {metricData?.dispatchHistory?.find((item) => item.drive_mode === 5) && (
          <S.Score>
            <strong>
              수거구간: {metricData?.coveredSections || '--'} / {metricData?.totalSection || '--'}
            </strong>
            <p>수거량: {metricData?.collectCount || '--'}</p>
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() =>
                router.pushWithAuthorize(ROUTER_PATH.ADMIN_OPERATION_ANALYSIS, {
                  routeName: metricData?.vehicleRoute?.[0]?.route_name,
                  date: params?.date ?? null,
                })
              }
            >
              <path
                d="M13 9.5C15.4853 9.5 17.5 7.48528 17.5 5C17.5 2.51472 15.4853 0.5 13 0.5C10.5147 0.5 8.5 2.51472 8.5 5C8.5 7.48528 10.5147 9.5 13 9.5ZM13 9.5V14.5M12.8123 14.1096L17.8123 18.1096M8.18765 18.1096L13.1877 14.1096M25.5 21C25.5 23.4853 23.4853 25.5 21 25.5C18.5147 25.5 16.5 23.4853 16.5 21C16.5 18.5147 18.5147 16.5 21 16.5C23.4853 16.5 25.5 18.5147 25.5 21ZM9.5 21C9.5 23.4853 7.48528 25.5 5 25.5C2.51472 25.5 0.5 23.4853 0.5 21C0.5 18.5147 2.51472 16.5 5 16.5C7.48528 16.5 9.5 18.5147 9.5 21Z"
                stroke="#FF2E91"
              />
            </svg>
          </S.Score>
        )}

        <S.Location>
          <figure />
          <div>
            <p>총 이동 거리: {kmConversion(metricData?.totals?.trip_distance || 0) || '--'} km</p>
            <span>총 시간: {minuteToTime(metricData?.totals?.trip_time || 0) || '--'}</span>
          </div>
        </S.Location>
      </S.Wrapper>
    </S.VehicleDetail>
  );
};

export default React.memo(VehicleDetail);
