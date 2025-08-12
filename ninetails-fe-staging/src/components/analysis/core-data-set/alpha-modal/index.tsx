import QuestionareIcon from '@/assets/images/chart/questionare.svg';
import { BaseTooltip } from '@/components/common/base-tooltip';
import { Slider } from 'antd';
import React, { useEffect, useState } from 'react';

import * as S from './index.style';

interface IProps {
  onCancel: () => void;
  alphaValueSaved: number;
  setAlphaValueSaved: (v: number) => void;
  loading: boolean;
}

const MAX_ALPHA = 50;
const INDICATION_NUMBER = 25;
const MARK_NUMBER = 5;

export const AlphaModal: React.FC<IProps> = (props) => {
  const { onCancel, alphaValueSaved, setAlphaValueSaved, loading } = props;
  const [alphaValue, setAlphaValue] = useState<number>(alphaValueSaved);

  useEffect(() => {
    setAlphaValue(alphaValueSaved);
  }, [alphaValueSaved]);

  const renderIndications = () => {
    const elements: React.ReactElement[] = [];
    for (let i = 0; i <= INDICATION_NUMBER; i++) {
      elements.push(<S.Indication index={i} />);
    }
    return elements;
  };

  const renderMarks = () => {
    const elements: React.ReactElement[] = [];
    for (let i = 0; i <= MARK_NUMBER; i++) {
      elements.push(<S.Mark index={i}>{i * (MARK_NUMBER * 2)}</S.Mark>);
    }
    return elements;
  };

  const onChangeAlpha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value ? parseInt(e.target.value) : 0;

    if (num <= MAX_ALPHA) {
      return setAlphaValue(num);
    }
  };

  const onSave = () => {
    setAlphaValueSaved(alphaValue);
    onCancel();
  };

  return (
    <>
      <S.WrapFilter>
        <S.FilterTitle>
          <BaseTooltip title="최신 데이터에 부여할 가중치를 의미하며, 지수가중평균(EWM)의 평탄화(smoothing) 수준을 결정합니다.">
            <QuestionareIcon />
          </BaseTooltip>
          <S.TitleText>평활계수</S.TitleText>
        </S.FilterTitle>
        <S.WrapSliderWeight>
          {renderMarks()}
          <Slider
            value={alphaValue}
            tooltip={{
              formatter: null,
            }}
            max={MAX_ALPHA}
            onChange={setAlphaValue}
          />
          <S.Rail />
          {renderIndications()}
        </S.WrapSliderWeight>
      </S.WrapFilter>
      <S.WrapInput>
        <S.InputTitle>(Alpha)</S.InputTitle>
        <S.Input value={alphaValue} onChange={onChangeAlpha} />
        <S.Text>%</S.Text>
      </S.WrapInput>
      <S.WrapActionButton>
        <S.ActionButton type="primary" onClick={onSave} loading={loading}>
          확인
        </S.ActionButton>
        <S.CancelButton onClick={onCancel} type="default">
          취소
        </S.CancelButton>
      </S.WrapActionButton>
    </>
  );
};
