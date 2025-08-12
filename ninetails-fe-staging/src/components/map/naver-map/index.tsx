import RouteExportIcon from '@/assets/images/svg/map/icon-file-export.svg';
import RouteIcon from '@/assets/images/svg/map/icon-route.svg';
import CurrentLocationIcon from '@/assets/images/svg/map/m2fix.svg';
import ZoomOutIcon from '@/assets/images/svg/map/m2minus.svg';
import ZoomInIcon from '@/assets/images/svg/map/m2plus.svg';
import { usePermissions } from '@/hooks/usePermissions';
import React, { memo } from 'react';
import { NaverMap, Polygon, PolygonProps, Polyline, PolylineProps } from 'react-naver-maps';

import * as S from '../index.style';
import BaseMarker, { IMarker } from '../marker';
// import MarkerCluster from '../marker-cluster';
import useMap, { IDefaultConfig } from './index.utils';

interface BaseMapProps {
  initMarkers?: IMarker[];
  polygons?: PolylineProps[];
  areaPolygons?: PolygonProps[];
  map?: any;
  setMap?: any;
  activedAllRoute?: boolean | null;
  hasAllRouteChange?: boolean;
  hasCurrentLocation?: boolean;
  isExport?: boolean;
  config?: IDefaultConfig;
  onToggleAllRoute?: () => void;
  onScreenExport?: () => void;
  getCurrentLocation?: () => void;
  // eslint-disable-next-line no-undef
  onCenterChanged?: (value: naver.maps.Coord) => void;
}

const BaseMap: React.FC<BaseMapProps> = ({
  initMarkers,
  polygons,
  areaPolygons,
  map,
  config,
  setMap,
  activedAllRoute,
  hasAllRouteChange = false,
  hasCurrentLocation = false,
  isExport = false,
  getCurrentLocation,
  onCenterChanged,
  onToggleAllRoute,
  onScreenExport,
}) => {
  const { defaultConfig, onZoomIn, onZoomOut } = useMap({ map: map, config });
  const permissions = usePermissions();

  return (
    <NaverMap
      defaultCenter={defaultConfig.center}
      defaultZoom={defaultConfig.zoom}
      ref={setMap}
      onCenterChanged={onCenterChanged}
    >
      <S.ControlWrap $isExport={isExport}>
        {hasAllRouteChange && (
          <S.ControlButton $actived={activedAllRoute === true} onClick={onToggleAllRoute}>
            <RouteIcon />
          </S.ControlButton>
        )}

        {hasCurrentLocation && getCurrentLocation && (
          <S.ControlButton $actived={activedAllRoute === false} onClick={getCurrentLocation}>
            <CurrentLocationIcon />
          </S.ControlButton>
        )}

        <S.ControlButton onClick={onZoomIn}>
          <ZoomInIcon />
        </S.ControlButton>

        <S.ControlButton onClick={onZoomOut}>
          <ZoomOutIcon />
        </S.ControlButton>

        {onScreenExport && (
          <S.ControlButton onClick={onScreenExport} disabled={!permissions.exportAble}>
            <RouteExportIcon />
          </S.ControlButton>
        )}
      </S.ControlWrap>

      {initMarkers?.map((marker, i) => (
        <BaseMarker key={i} marker={marker} />
      ))}

      {/* <MarkerCluster /> */}

      {polygons && polygons?.map((polygon, i) => <Polyline key={i} {...polygon} />)}

      {areaPolygons && areaPolygons?.map((polygon, i) => <Polygon key={i} {...polygon} />)}
    </NaverMap>
  );
};

export default memo(BaseMap);
