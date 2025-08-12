import { IMetricDetail } from '@/interfaces/control-status';
import { getDriveState, kmConversion, minuteToTime } from '@/utils/control';
import dayjs from 'dayjs';
import VirtualList from 'rc-virtual-list';
import React from 'react';

import * as S from '../index.styles';

const RouteHistory: React.FC<{ history?: IMetricDetail[]; height?: number }> = ({
  history,
  height = 488,
}) => {
  return (
    <VirtualList data={history ?? []} itemKey="id" height={height} itemHeight={130}>
      {(item, i) => (
        <S.RouteHistory key={i}>
          <S.RouteTime>
            <strong>{dayjs(item?.start_time).format('HH:mm')}</strong> &nbsp;
            {dayjs(item?.start_time).format('A')}
          </S.RouteTime>
          <S.RouteType>
            <figure
              style={{
                backgroundImage: `url(${getDriveState(item?.drive_mode)?.icon})`,
              }}
            ></figure>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="66"
              viewBox="0 0 24 66"
              fill="none"
              className="route-history-arrow"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.8762 1C17.8762 0.447715 17.4285 0 16.8762 0H6.87622C6.32393 0 5.87622 0.447715 5.87622 1V45C5.87622 45.5523 5.4285 46 4.87622 46H1.60794C0.838136 46 0.357012 46.8333 0.741912 47.5L11.1342 65.5C11.5191 66.1667 12.4814 66.1667 12.8663 65.5L23.2586 47.5C23.6435 46.8333 23.1623 46 22.3925 46H18.8762C18.3239 46 17.8762 45.5523 17.8762 45V1Z"
                fill={getDriveState(item?.drive_mode)?.color}
              />
            </svg>
          </S.RouteType>
          <S.RouteInfor>
            <strong>{getDriveState(item?.drive_mode)?.name || '--'}</strong>
            <strong className="route-history-distance">
              이동 거리: {kmConversion(item?.total_distance) || '--'}km
            </strong>
            <p className="route-history-time">기간 min: {minuteToTime(item?.total_time) || '--'}</p>
          </S.RouteInfor>
        </S.RouteHistory>
      )}
    </VirtualList>
  );
};

export default RouteHistory;
