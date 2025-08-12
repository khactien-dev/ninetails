import {
  CrewIcon,
  StatusIcon,
  TruckIcon,
  carInfo,
  crewInfo,
  statusInfo,
} from '@/components/schedule/left-content/statistic/icon/index';
import React from 'react';

import * as S from './index.styles';

interface IProps {
  active: string | null;
  onChangeActive: (v: string | null) => void;
}

export const LegendModal: React.FC<IProps> = (props) => {
  const { active, onChangeActive } = props;

  return (
    <S.Modal
      open={!!active}
      onCancel={() => onChangeActive(null)}
      footer={null}
      width={534}
      centered
    >
      <S.WrapModalContent>
        <S.WrapGroupButton>
          <S.GroupButton
            options={[
              { label: '인력', value: 'staff' },
              { label: '차량', value: 'vehicle' },
            ]}
            value={active}
            optionType="button"
            buttonStyle="solid"
            onChange={(v) => onChangeActive(v.target.value)}
          />
        </S.WrapGroupButton>
        <S.WrapContent>
          <S.WrapCarItems row={active === 'vehicle' ? 4 : 3}>
            {active === 'vehicle' ? (
              <>
                {carInfo.map((item, index) => (
                  <S.WrapCarItem key={index}>
                    <TruckIcon vehicle_type={item.type} />
                    <S.Label>{item.label}</S.Label>
                  </S.WrapCarItem>
                ))}
              </>
            ) : (
              <>
                {crewInfo.map((item, index) => (
                  <S.WrapCarItem key={index}>
                    <CrewIcon crew_type={item.type} />
                    <S.Label>{item.label}</S.Label>
                  </S.WrapCarItem>
                ))}
              </>
            )}
          </S.WrapCarItems>
          <S.WrapCarItems>
            {statusInfo.map((item, index) => (
              <S.WrapCarItem key={index}>
                <StatusIcon status={item.type} />
                <S.Label>{item.label}</S.Label>
              </S.WrapCarItem>
            ))}
          </S.WrapCarItems>
        </S.WrapContent>

        <S.WrapButton>
          <S.Button type="primary" onClick={() => onChangeActive(null)}>
            확인
          </S.Button>
        </S.WrapButton>
      </S.WrapModalContent>
    </S.Modal>
  );
};
