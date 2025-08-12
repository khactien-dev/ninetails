import QuestionareIcon from '@/assets/images/chart/questionare.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseDivider } from '@/components/common/base-divider';
import { BaseRow } from '@/components/common/base-row';
import { BaseTooltip } from '@/components/common/base-tooltip';
import { ICoreDataSetConfig } from '@/interfaces';
import { preventSpaceAndLetters } from '@/utils';
import { Slider } from 'antd';
import React from 'react';

import { useAnalysisContext } from '../../context';
import * as S from './index.style';
import { LevelRangeType, WeightRangeType, useRankingModal } from './index.utils';

interface IProps {
  onCancel: () => void;
  significantLevelRangeSaved: LevelRangeType;
  weightRangeSaved: WeightRangeType;
  onChangeConfigWeight: (v: ICoreDataSetConfig) => void;
  loading: boolean;
}

interface IInputTitleProps {
  color: string;
  title?: string;
  firstField?: string;
  firstTitle?: string;
  secondField?: string;
  secondTitle?: string;
  width?: number;
}

const InputTitle: React.FC<IInputTitleProps> = (props) => {
  const { color, title, firstField, firstTitle, secondField, secondTitle, width } = props;
  if (title) {
    return (
      <S.WeightInputTitle width={width}>
        <S.ColorBox color={color} />
        <S.Text>{title}</S.Text>
      </S.WeightInputTitle>
    );
  }
  return (
    <S.LevelInputTitle align={firstTitle && secondField ? 'end' : 'end'}>
      <S.ColorBox color={color} />
      <S.WrapLevelInputLabelItem>
        [<S.TextBold>{firstField}</S.TextBold>] {firstTitle}
        {secondField && secondTitle && (
          <>
            <S.VerticalSeperator />[<S.TextBold>{secondField}</S.TextBold>] {secondTitle}
          </>
        )}
      </S.WrapLevelInputLabelItem>
    </S.LevelInputTitle>
  );
};

export const RankingModal: React.FC<IProps> = (props) => {
  const { routeList } = useAnalysisContext();

  const { onCancel, significantLevelRangeSaved, onChangeConfigWeight, weightRangeSaved, loading } =
    props;

  const {
    colors,
    renderIndications,
    renderMarks,
    renderWeightTracks,
    renderLevelTracks,
    onChangeSignificantLevel,
    onChangeWeightRange,
    onChangeAE,
    onChangeBD,
    onChangeC,
    onChangeWeightInput,
    significantLevelRange,
    weightRange,
    levelAnE,
    levelBnD,
    levelC,
    preventOnPaste,
    onSave,
    errors,
  } = useRankingModal({
    significantLevelRangeSaved: significantLevelRangeSaved,
    weightRangeSaved: weightRangeSaved,
    onChangeConfigWeight: onChangeConfigWeight,
    onCancel: onCancel,
  });

  return (
    <>
      <S.WrapFilter>
        <S.FilterTitle>유의수준</S.FilterTitle>
        <S.WrapSliderLevel>
          {renderMarks()}
          {renderLevelTracks()}
          <Slider
            range
            value={significantLevelRange}
            tooltip={{
              formatter: null,
            }}
            onChange={(v) => onChangeSignificantLevel(v as LevelRangeType)}
          />
          <S.Rail />
          {renderIndications()}
        </S.WrapSliderLevel>
      </S.WrapFilter>
      <S.FlexBox>
        <S.WrapLevelForm>
          <S.WrapLevelRow>
            <InputTitle
              color={colors.pink}
              firstField="A"
              firstTitle="최상"
              secondField="E"
              secondTitle="최하"
            />
            <S.WrapInput>
              <S.Input
                value={levelAnE}
                onChange={onChangeAE}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
              />
              <S.Text>%</S.Text>
              <S.WrapItemCount>
                <S.Text>=</S.Text>
                <S.Input disabled value={Math.round(((routeList.length ?? 0) * levelAnE) / 100)} />
                대
              </S.WrapItemCount>
            </S.WrapInput>
          </S.WrapLevelRow>
          <S.WrapLevelRow>
            <InputTitle
              color={colors.yellow}
              firstField="B"
              firstTitle="상위"
              secondField="D"
              secondTitle="하위"
            />
            <S.WrapInput>
              <S.Input
                onChange={onChangeBD}
                value={levelBnD}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
                status={errors ? 'error' : undefined}
              />
              <S.Text>%</S.Text>
              <S.WrapItemCount>
                <S.Text>=</S.Text>
                <S.Input disabled value={Math.round(((routeList.length ?? 0) * levelBnD) / 100)} />
                대
              </S.WrapItemCount>
            </S.WrapInput>
          </S.WrapLevelRow>
          <S.WrapLevelRow>
            <InputTitle color={colors.green} firstField="C" firstTitle="중위" />
            <S.WrapInput>
              <S.Input
                value={levelC}
                onChange={onChangeC}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
              />
              <S.Text>%</S.Text>
              <S.WrapItemCount>
                <S.Text>=</S.Text>
                <S.Input
                  disabled
                  value={
                    (routeList.length ?? 0) -
                    Math.round(((routeList.length ?? 0) * levelAnE) / 100) -
                    Math.round(((routeList.length ?? 0) * levelBnD) / 100)
                  }
                />
                대
              </S.WrapItemCount>
            </S.WrapInput>
          </S.WrapLevelRow>
        </S.WrapLevelForm>
      </S.FlexBox>
      {!!errors && <S.WrapErrors>{errors}</S.WrapErrors>}

      <BaseDivider />

      <S.WrapFilter>
        <S.FilterTitle>
          <BaseTooltip title="등급 결정에 사용되는 운행 지표에 대한 가중치를 결정합니다. 동선 효율성과 운행 난이도에 높은 기여도를 보이는 지표에 더 많은 가중치를 부여합니다.">
            <QuestionareIcon />
          </BaseTooltip>
          <S.TitleText>가중치</S.TitleText>
        </S.FilterTitle>
        <S.WrapSliderWeight>
          {renderMarks()}
          {renderWeightTracks()}
          <Slider
            range
            value={weightRange}
            onChange={(v) => onChangeWeightRange(v as WeightRangeType)}
            tooltip={{ formatter: null }}
          />
          <S.Rail />
          {renderIndications()}
        </S.WrapSliderWeight>
      </S.WrapFilter>

      <S.WrapLevelForm>
        <BaseRow gutter={24}>
          <BaseCol sm={24} lg={12}>
            <S.WrapLevelRow>
              <InputTitle color={colors.orange} title="수거/기타 거리 비율" />
              <S.Input
                value={weightRange[0]}
                onChange={(e) => onChangeWeightInput(e, 0)}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
              />
              <S.Text>%</S.Text>
            </S.WrapLevelRow>
          </BaseCol>
          <BaseCol sm={24} lg={12}>
            <S.WrapLevelRow>
              <InputTitle color={colors.green} title="수거 거리" width={88} />
              <S.Input
                value={weightRange[1] - weightRange[0]}
                onChange={(e) => onChangeWeightInput(e, 1)}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
              />
              <S.Text>%</S.Text>
            </S.WrapLevelRow>
          </BaseCol>

          <BaseCol sm={24} lg={12}>
            <S.WrapLevelRow>
              <InputTitle color={colors.blue} title="수거/기타 시간 비율" />
              <S.Input
                value={weightRange[2] - weightRange[1]}
                onChange={(e) => onChangeWeightInput(e, 2)}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
              />
              <S.Text>%</S.Text>
            </S.WrapLevelRow>
          </BaseCol>
          <BaseCol sm={24} lg={12}>
            <S.WrapLevelRow>
              <InputTitle color={colors.yellow} title="수거 시간" width={88} />
              <S.Input
                value={weightRange[3] - weightRange[2]}
                onChange={(e) => onChangeWeightInput(e, 3)}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
              />
              <S.Text>%</S.Text>
            </S.WrapLevelRow>
          </BaseCol>

          <BaseCol sm={24} lg={12}>
            <S.WrapLevelRow>
              <InputTitle color={colors.violet} title="도보수거 시간" />
              <S.Input
                value={weightRange[4] - weightRange[3]}
                onChange={(e) => onChangeWeightInput(e, 4)}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
              />
              <S.Text>%</S.Text>
            </S.WrapLevelRow>
          </BaseCol>

          <BaseCol sm={24} lg={12}>
            <S.WrapLevelRow>
              <InputTitle color={colors.pink} title="수거량" width={88} />
              <S.Input
                value={100 - weightRange[4]}
                onChange={(e) => onChangeWeightInput(e, 5)}
                onKeyPress={preventSpaceAndLetters}
                onPaste={preventOnPaste}
              />
              <S.Text>%</S.Text>
            </S.WrapLevelRow>
          </BaseCol>
        </BaseRow>
      </S.WrapLevelForm>
      <S.WrapActionButton>
        <S.ActionButton type="primary" onClick={() => onSave()} loading={loading}>
          확인
        </S.ActionButton>
        <S.CancelButton type="default" onClick={onCancel}>
          취소
        </S.CancelButton>
      </S.WrapActionButton>
    </>
  );
};
