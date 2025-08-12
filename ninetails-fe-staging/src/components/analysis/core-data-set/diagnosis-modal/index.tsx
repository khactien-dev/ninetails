import { Slider } from 'antd';
import React, { useEffect, useState } from 'react';

import * as S from './index.style';

interface IProps {
  onCancel: () => void;
  pValueSaved: number;
  setPValueSaved: (v: number) => void;
  loading: boolean;
}

const MAX_P_VALUE = 25;
const MARK_NUMBER = 5;

export const DiagnosisModal: React.FC<IProps> = (props) => {
  const { onCancel, pValueSaved, setPValueSaved, loading } = props;
  const [pValue, setPValue] = useState<number>(pValueSaved);

  useEffect(() => {
    setPValue(pValueSaved);
  }, [pValueSaved]);

  const renderIndications = () => {
    const elements: React.ReactElement[] = [];
    for (let i = 0; i <= MAX_P_VALUE; i++) {
      elements.push(<S.Indication index={i} />);
    }
    return elements;
  };

  const renderMarks = () => {
    const elements: React.ReactElement[] = [];
    for (let i = 0; i <= MARK_NUMBER; i++) {
      elements.push(<S.Mark index={i}>{i * MARK_NUMBER}</S.Mark>);
    }
    return elements;
  };

  const onChangePValue = (e: any) => {
    const num = e.target.value ? parseInt(e.target.value) : 0;
    if (num <= MAX_P_VALUE) {
      return setPValue(num);
    }
  };

  const onSave = () => {
    setPValueSaved(pValue);
    onCancel();
  };

  return (
    <>
      <S.WrapFilter>
        <S.FilterTitle>
          <S.TitleText>유의수준</S.TitleText>
        </S.FilterTitle>
        <S.WrapSliderWeight>
          {renderMarks()}
          <Slider
            value={pValue}
            tooltip={{
              formatter: null,
            }}
            max={MAX_P_VALUE}
            onChange={setPValue}
          />
          <S.Rail />
          {renderIndications()}
        </S.WrapSliderWeight>
      </S.WrapFilter>
      <S.WrapInput>
        <S.InputTitle>(P-value)</S.InputTitle>
        <S.Input value={pValue} onChange={onChangePValue} />
        <S.Text>%</S.Text>
      </S.WrapInput>
      <S.WrapActionButton>
        <S.ActionButton type="primary" onClick={onSave} loading={loading}>
          확인
        </S.ActionButton>
        <S.CancelButton onClick={onCancel}>취소</S.CancelButton>
      </S.WrapActionButton>
    </>
  );
};
