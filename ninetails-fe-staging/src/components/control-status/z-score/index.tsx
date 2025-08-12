import ScoreIcon from '@/assets/images/control-status/icon-score.svg';
import { ROUTER_PATH } from '@/constants/common';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { IDataType } from '@/interfaces';
import { roundingNumber } from '@/utils/control';
import cn from 'classnames';
import React, { useState } from 'react';

import Collapse from '../collapse';
import * as S from '../index.style';
import { IParams, SelectData } from '../index.utils';
import * as Styles from './index.style';

interface ZScoreProps {
  routeName: string | null | undefined;
  areaOptions: SelectData[];
  zScore?: IDataType;
  disabled?: boolean;
  date?: string | null;
  isSingleVehicle?: boolean;
  weightRatio: { [key: string]: number };
  onChangeParams: (params: IParams) => void;
}

const ZScore: React.FC<ZScoreProps> = ({
  routeName,
  areaOptions,
  zScore,
  date,
  isSingleVehicle = false,
  weightRatio,
  onChangeParams,
  disabled = false,
}) => {
  const [active, setActive] = useState<boolean>(true);
  const router = useRouterWithAuthorize();

  const onChangeSelect = async (value: any) => {
    await router.pushWithAuthorize(ROUTER_PATH.ADMIN_REALTIME_ACTIVITY);
    onChangeParams({ routeName: value, vehicleNumber: null, isArea: true });
  };

  return (
    <Collapse
      defaultCollased
      title={'운행경로'}
      hasTooltip
      disabled={disabled}
      tooltip={'이전 10일간의 운행 뎅터를 기준으로 예측한 당일 경로지수가중평균(EWA)을 적용'}
    >
      <S.Select
        // defaultValue={areaOptions?.[0]?.value}
        value={routeName}
        options={areaOptions}
        onChange={onChangeSelect}
        suffixIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M8.96036 4.09003H5.84536H3.04036C2.56036 4.09003 2.32036 4.67003 2.66036 5.01003L5.25036 7.60003C5.66536 8.01503 6.34036 8.01503 6.75536 7.60003L7.74036 6.61503L9.34536 5.01003C9.68036 4.67003 9.44036 4.09003 8.96036 4.09003Z"
              fill="#7A7C7F"
            />
          </svg>
        }
      />
      <Styles.Wrapper>
        <div className="tableD1a">
          <div className="thd">
            <div className="thCol col1">
              <button
                tabIndex={0}
                type="button"
                className={cn('toggleTableD1a', { ['active']: active })}
                onClick={() => setActive((prev) => !prev)}
              >
                <span>주요지표</span>
              </button>
            </div>
            <div className="thCol col2">
              {routeName
                ? areaOptions.find((option) => option.value == routeName)?.label
                : '전체차량'}
            </div>
            <div className="thCol col3">평균</div>
            <div className="thCol col4">표준편차</div>
          </div>
          <div className="tbd">
            <div className="rowR">
              <div className="tdCol col1">
                수거/기타 거리 <span className="t1">%</span>
              </div>
              {zScore && zScore.distanceRatios ? (
                Object.keys(zScore.distanceRatios).map((key, index) => (
                  <div key={index} className={`tdCol col${index + 2}`}>
                    {roundingNumber(zScore?.distanceRatios[key], 3)}
                  </div>
                ))
              ) : (
                <>
                  <div className="tdCol col2">--</div>
                  <div className="tdCol col3">--</div>
                  <div className="tdCol col4">--</div>
                </>
              )}
            </div>
            <div className="rowR">
              <div className="tdCol col1">
                수거/기타 시간 <span className="t1">%</span>
              </div>
              {zScore && zScore.durationRatios ? (
                Object.keys(zScore.durationRatios).map((key, index) => (
                  <div key={index} className={`tdCol col${index + 2}`}>
                    {roundingNumber(zScore?.durationRatios[key], 3)}
                  </div>
                ))
              ) : (
                <>
                  <div className="tdCol col2">--</div>
                  <div className="tdCol col3">--</div>
                  <div className="tdCol col4">--</div>
                </>
              )}
            </div>
            <div className="rowR">
              <div className="tdCol col1">
                수거 거리 <span className="t1">km</span>
              </div>
              {zScore && zScore.collectDistance ? (
                Object.keys(zScore.collectDistance).map((key, index) => (
                  <div key={index} className={`tdCol col${index + 2}`}>
                    {roundingNumber(zScore?.collectDistance[key] / 1000, 3)}
                  </div>
                ))
              ) : (
                <>
                  <div className="tdCol col2">--</div>
                  <div className="tdCol col3">--</div>
                  <div className="tdCol col4">--</div>
                </>
              )}
            </div>
            <div className="rowR">
              <div className="tdCol col1">
                수거 시간 <span className="t1">분</span>
              </div>
              {zScore && zScore.collectDuration ? (
                Object.keys(zScore.collectDuration).map((key, index) => (
                  <div key={index} className={`tdCol col${index + 2}`}>
                    {roundingNumber(zScore?.collectDuration[key] / 60, 3)}
                  </div>
                ))
              ) : (
                <>
                  <div className="tdCol col2">--</div>
                  <div className="tdCol col3">--</div>
                  <div className="tdCol col4">--</div>
                </>
              )}
            </div>
            <div className="rowR">
              <div className="tdCol col1">
                수거량 <span className="t1">개</span>
              </div>
              {zScore && zScore.collectCount ? (
                Object.keys(zScore.collectCount).map((key, index) => (
                  <div key={index} className={`tdCol col${index + 2}`}>
                    {roundingNumber(zScore?.collectCount[key], 3)}
                  </div>
                ))
              ) : (
                <>
                  <div className="tdCol col2">--</div>
                  <div className="tdCol col3">--</div>
                  <div className="tdCol col4">--</div>
                </>
              )}
            </div>
          </div>
          <div className={cn('rate', { ['active']: active })}>
            <div className="row row1">
              <div className="inside">
                <div className="txt1">등급</div>
                <S.Tooltip
                  placement="bottom"
                  title={
                    <>
                      <div className="txt1a">
                        배차 지역의 동선 효율성과 운행 난이도를 평가하여 부여한 등급. 수거 대비 기타
                        운행의 비중, 수거 거리, 수거 시간, 수거량의 Z점 수에 가중치를 적용하여
                        합산한 결과를 5가지 등급으로 구분
                      </div>
                      <div className="tb12">
                        <div className="th1">
                          <div className="th">등급</div>
                          <div className="th">A</div>
                          <div className="th">B</div>
                          <div className="th">C</div>
                          <div className="th">D</div>
                          <div className="th">E</div>
                        </div>
                        <div className="th2">
                          <div className="th">%</div>
                          <div className="th">
                            최상
                            <br />
                            {weightRatio.A}
                          </div>
                          <div className="th">
                            상위
                            <br />
                            {weightRatio.B}
                          </div>
                          <div className="th">
                            중위
                            <br />
                            {weightRatio.C}
                          </div>
                          <div className="th">
                            하위
                            <br />
                            {weightRatio.D}
                          </div>
                          <div className="th">
                            최하
                            <br />
                            {weightRatio.E}
                          </div>
                        </div>
                      </div>
                      <div className="txt2a">
                        <div className="dotRow">[예] B 등급: 효율성 및 난이도 차상위 5개 지역</div>
                        <div className="dotRow">
                          § 표준편차: 배차 지역간 효율성 및 난이도의 차이
                        </div>
                      </div>
                    </>
                  }
                  getPopupContainer={(triggerNode) => triggerNode}
                >
                  ?
                </S.Tooltip>
              </div>
            </div>
            <div className="row row2">
              <span className="r1">{zScore?.rankScore || '--'}</span>
              <ScoreIcon
                style={isSingleVehicle ? { cursor: 'pointer' } : {}}
                onClick={() =>
                  isSingleVehicle &&
                  router.pushWithAuthorize(ROUTER_PATH.ADMIN_OPERATION_ANALYSIS, {
                    routeName: routeName,
                    date: date,
                  })
                }
              />
            </div>
          </div>
        </div>
      </Styles.Wrapper>
    </Collapse>
  );
};

export default ZScore;
