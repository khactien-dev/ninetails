// import { getMetricDetail } from '@/api/control';
import { getMetricDetail } from '@/api/control-status';
import { driveStatus } from '@/components/control-status/index.utils';
import { DATE_FORMAT, MARKER_TYPE } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
// import { DRIVER_MODE, DriveStatus } from '@/constants';
// import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useId, useState } from 'react';
import { Marker, Overlay, useNavermaps } from 'react-naver-maps';

import useMap from '../naver-map/index.utils';
import * as S from './index.style';

export interface IMarker {
  type: string;
  data: any;
}

interface BaseMarkerProps {
  marker: IMarker;
  size?: {
    width: number;
    height: number;
  };
  anchor?: number;
}

const BaseMarker: React.FC<BaseMarkerProps> = ({
  marker,
  size = {
    width: 44,
    height: 57,
  },
  anchor = 11,
}) => {
  const { data } = marker;
  const navermaps = useNavermaps();
  const mapInstance = (navermaps?.Map as any)?.__instances?.[0];
  const markerId = useId();
  const { getMarkderIcon, getDetailContent } = useMap({ map: null });
  const [isRealTime, setIsRealTime] = useState<boolean>(false);
  const [markerDetail, setMarkerDetail] = useState<any>();
  const { refetch, data: detailData } = useQuery({
    queryKey: ['metricDetail'],
    queryFn: () =>
      getMetricDetail({
        vehicleNumber: data.vehicle_number,
        date: dayjs(data.timestamp).format(DATE_FORMAT.R_BASIC),
      }),
    refetchInterval: data?.updateTime,
    refetchOnWindowFocus: true,
    enabled: isRealTime,
  });

  useEffect(() => {
    const htmlCollection = document.getElementsByClassName(markerId);
    if (htmlCollection.length) {
      Array.from(htmlCollection).map((btn: Element) => {
        btn?.addEventListener('click', () => {
          setMarkerDetail(null);
          setIsRealTime(false);
          if (mapInstance) {
            mapInstance.setOptions({
              draggable: true,
              scrollWheel: true,
            });
          }
        });
      });
    }
  });

  useEffect(() => {
    if (marker.type === MARKER_TYPE.CAR && mapInstance && isRealTime) {
      const originalPosition = new navermaps.LatLng(marker?.data?.lat, marker?.data?.lng);
      setMarkerDetail(
        new navermaps.Marker({
          position: markerDetail?.position || originalPosition,
          icon: {
            content: getDetailContent(markerId, marker?.type, {
              ...detailData?.data,
              routeData: data,
            }),
          },
        })
      );
    }
  }, [detailData?.data]);

  // const modalContent = useMemo(() => getDetailContent(markerId, marker.type, null), []);

  const adjustMarkerPosition = useCallback(
    (position: any) => {
      const map = (navermaps?.Map as any)?.__instances?.[0];
      if (!map) return position;

      const mapCenter = map.getCenter();

      // Calculate offset from center in pixels (adjust these values as needed)
      const offsetY = -350; // Offset upwards to make room for detail popup
      const offsetX = 50; // No horizontal offset

      // Convert pixel offset to coordinate offset at current zoom level
      const projection = map.getProjection();
      const centerPoint = projection.fromCoordToOffset(mapCenter);
      const newPoint = new navermaps.Point(centerPoint.x + offsetX, centerPoint.y + offsetY);
      const newPosition = projection.fromOffsetToCoord(newPoint);

      return newPosition;
    },
    [navermaps]
  );

  const onMarkerClick = useCallback(() => {
    if (data.hasDetail === false) return;

    if (marker.type === MARKER_TYPE.CAR && mapInstance) {
      data.onClick && data?.vehicle_number && data.onClick(data?.vehicle_number);
      return;
      // return refetch().then((response) => {
      //   if (response.error) {
      //     setMarkerDetail(null);
      //     return;
      //   }
      //   const originalPosition = new navermaps.LatLng(marker?.data?.lat, marker?.data?.lng);
      //   // First center the map on the marker
      //   mapInstance.setCenter(originalPosition);
      //   // Then calculate the adjusted position for the detail popup
      //   const detailPosition = adjustMarkerPosition(originalPosition);
      //   mapInstance.setOptions({
      //     draggable: false,
      //     scrollWheel: false,
      //   });
      //   setIsRealTime(true);
      //   setMarkerDetail((prev: any) =>
      //     prev
      //       ? null
      //       : new navermaps.Marker({
      //           position: detailPosition,
      //           icon: {
      //             content: getDetailContent(markerId, marker?.type, {
      //               ...response.data?.data,
      //               routeData: data,
      //             }),
      //           },
      //         })
      //   );
      // });
    }

    setMarkerDetail((prev: any) =>
      prev
        ? null
        : new navermaps.Marker({
            position: new navermaps.LatLng(marker?.data?.lat, marker?.data?.lng),
            icon: {
              content: getDetailContent(markerId, marker?.type, data),
            },
          })
    );
  }, [
    adjustMarkerPosition,
    data,
    getDetailContent,
    mapInstance,
    marker?.data?.lat,
    marker?.data?.lng,
    marker.type,
    markerId,
    navermaps.LatLng,
    navermaps.Marker,
    refetch,
  ]);

  const markerColor = () => {
    if (marker.type === MARKER_TYPE.CAR)
      return driveStatus.find((drive) => drive.id == Number(data?.drive_mode))?.color || '#ffffff';
    if (marker.type === MARKER_TYPE.ILL || marker.type === MARKER_TYPE.ILL_C) {
      if (data?.diff_week > 2) {
        return '#ea5d5f';
      }
      if (data?.diff_week > 1 && data?.diff_week <= 2) {
        return '#ffe63a';
      }
      return '#82c156';
    }
    return '#ffffff';
  };

  return (
    <S.MarkerWrap>
      {markerDetail && <Overlay element={markerDetail} autoMount></Overlay>}

      <Marker
        position={new navermaps.LatLng(marker?.data?.lat, marker?.data?.lng)}
        icon={{
          content:
            `<div class="marker-icon">` + getMarkderIcon(marker?.type, markerColor()) + `</div>`,
          size,
          anchor,
        }}
        onClick={onMarkerClick}
      ></Marker>
    </S.MarkerWrap>
  );
};

export default React.memo(BaseMarker);
