import { ICoreDataSetConfig } from '@/interfaces';
import React, { useEffect, useMemo, useState } from 'react';

import * as S from './index.style';

const blurColors = {
  pink: 'rgba(250, 12, 117, 0.5)',
  yellow: 'rgba(251, 177, 11, 0.5)',
  green: 'rgba(14, 128, 1, 0.5)',

  orange: 'rgba(244, 88, 0, 0.5)',
  blue: 'rgba(20, 159, 236, 0.5)',
  violet: 'rgba(232, 27, 236, 0.5)',
};

const colors = {
  pink: 'rgba(250, 12, 117, 1)',
  yellow: 'rgba(251, 177, 11, 1)',
  green: 'rgba(14, 128, 1, 1)',

  orange: 'rgba(244, 88, 0, 1)',
  blue: 'rgba(20, 159, 236, 1)',
  violet: 'rgba(232, 27, 236, 1)',
};

const WEIGHT_INPUTS_NUMBER = 6;
const MAX_VALUE = 100;
const HALF_VALUE = 50;
const MARK_NUMBER = 10;

export type WeightRangeType = [number, number, number, number, number];
export type LevelRangeType = [number, number, number, number];

interface IProps {
  significantLevelRangeSaved: LevelRangeType;
  weightRangeSaved: WeightRangeType;
  onChangeConfigWeight: (v: ICoreDataSetConfig) => void;
  onCancel: () => void;
}

export const useRankingModal = (props: IProps) => {
  const { significantLevelRangeSaved, weightRangeSaved, onChangeConfigWeight } = props;

  const [significantLevelRange, setSignificantLevelRange] = useState<LevelRangeType>(
    significantLevelRangeSaved
  );
  const [weightRange, setWeightRange] = useState<WeightRangeType>(weightRangeSaved);
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    setSignificantLevelRange(significantLevelRangeSaved);
    setWeightRange(weightRangeSaved);
  }, [significantLevelRangeSaved, weightRangeSaved]);

  const renderIndications = () => {
    const elements: React.ReactElement[] = [];
    for (let i = 0; i <= HALF_VALUE; i++) {
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

  const renderWeightTracks = () => {
    const first = weightRange[0];
    const second = weightRange[1];
    const third = weightRange[2];
    const fourth = weightRange[3];
    const last = weightRange[4];
    if (first >= 0 && second >= 0 && third >= 0 && last >= 0) {
      return (
        <>
          <S.WeightTrack trackWidth={first} trackLeft={0} color={blurColors.orange} />
          <S.WeightTrack trackWidth={second - first} trackLeft={first} color={blurColors.green} />
          <S.WeightTrack trackWidth={third - second} trackLeft={second} color={blurColors.blue} />
          <S.WeightTrack trackWidth={fourth - third} trackLeft={third} color={blurColors.yellow} />
          <S.WeightTrack trackWidth={last - fourth} trackLeft={fourth} color={blurColors.violet} />
          <S.WeightTrack trackWidth={MAX_VALUE - last} trackLeft={last} color={blurColors.pink} />
        </>
      );
    }
    return null;
  };

  const levelAnE = useMemo(() => significantLevelRange[0], [significantLevelRange]);
  const levelBnD = useMemo(
    () =>
      (significantLevelRange[1] > significantLevelRange[2]
        ? significantLevelRange[2]
        : significantLevelRange[1]) - significantLevelRange[0],
    [significantLevelRange]
  );
  const levelC = useMemo(
    () => Math.abs(significantLevelRange[2] - significantLevelRange[1]),
    [significantLevelRange]
  );

  const renderLevelTracks = () => {
    const first = significantLevelRange[0];
    const second =
      significantLevelRange[1] > significantLevelRange[2]
        ? significantLevelRange[2]
        : significantLevelRange[1];
    const third =
      significantLevelRange[1] > significantLevelRange[2]
        ? significantLevelRange[1]
        : significantLevelRange[2];
    const last = significantLevelRange[3];
    if (first >= 0 && second >= 0 && third && last) {
      return (
        <>
          <S.LevelTrack trackWidth={first} trackLeft={0} color={blurColors.pink} />
          <S.LevelTrack trackWidth={second - first} trackLeft={first} color={blurColors.yellow} />
          <S.LevelTrack trackWidth={third - second} trackLeft={second} color={blurColors.green} />
          <S.LevelTrack trackWidth={last - third} trackLeft={third} color={blurColors.yellow} />
          <S.LevelTrack trackWidth={MAX_VALUE - last} trackLeft={last} color={blurColors.pink} />
        </>
      );
    }
  };

  const onChangeSignificantLevel = (v: LevelRangeType) => {
    setSignificantLevelRange(() => {
      const first = v[0];
      const second = v[1];
      return [first, second, MAX_VALUE - second, MAX_VALUE - first];
    });
  };

  const onChangeWeightRange = (v: WeightRangeType) => {
    const first = v[0];
    const second = v[1];
    const third = v[2];
    const last = v[3];
    if (first <= second && second <= third && third <= last) {
      setWeightRange(v);
    }
  };

  const getLevelRange = () => {
    const first = significantLevelRange[0];
    const second =
      significantLevelRange[1] > significantLevelRange[2]
        ? significantLevelRange[2]
        : significantLevelRange[1];
    const third =
      significantLevelRange[1] > significantLevelRange[2]
        ? significantLevelRange[1]
        : significantLevelRange[2];

    return {
      AERange: first,
      BDRange: Math.abs(second - first),
      CRange: Math.abs(third - second),
    };
  };

  const onChangeAE = (e: any) => {
    if (!e.target.value) {
      return setSignificantLevelRange((prev) => [0, prev[1], prev[2], MAX_VALUE]);
    }
    const num = parseInt(e.target.value);
    setErrors(null);
    if (num > HALF_VALUE) {
      return;
    }
    const { AERange, BDRange } = getLevelRange();
    if (num >= AERange + BDRange) {
      return setSignificantLevelRange([num, num, MAX_VALUE - num, MAX_VALUE - num]);
    }
    return setSignificantLevelRange((prev) => [num, prev[1], prev[2], MAX_VALUE - num]);
  };

  const onChangeBD = (e: any) => {
    if (!e.target.value) {
      return setSignificantLevelRange((prev) => [prev[0], prev[0], prev[3], prev[3]]);
    }
    const num = parseInt(e.target.value);
    setErrors(null);
    if (num > HALF_VALUE) {
      return;
    }
    const { AERange } = getLevelRange();
    if (AERange + num >= HALF_VALUE) {
      return setSignificantLevelRange([HALF_VALUE - num, HALF_VALUE, HALF_VALUE, HALF_VALUE + num]);
    }
    return setSignificantLevelRange((prev) => [
      prev[0],
      num + prev[0],
      MAX_VALUE - (num + prev[0]),
      prev[3],
    ]);
  };

  const onChangeC = (e: any) => {
    if (!e.target.value) {
      return setSignificantLevelRange((prev) => [prev[0], HALF_VALUE, HALF_VALUE, prev[3]]);
    }
    const num = parseInt(e.target.value) / 2;
    setErrors(null);
    if (num > HALF_VALUE) {
      return;
    }

    const { AERange } = getLevelRange();
    if (num + AERange >= HALF_VALUE) {
      return setSignificantLevelRange([
        HALF_VALUE - num,
        HALF_VALUE - num,
        HALF_VALUE + num,
        HALF_VALUE + num,
      ]);
    }
    return setSignificantLevelRange((prev) => [
      prev[0],
      HALF_VALUE - num,
      HALF_VALUE + num,
      prev[3],
    ]);
  };

  const findNextEnchroachment = (
    num: number,
    firstHandle: number | null,
    secondHandle: number | null
  ) => {
    const cloneWeightRange: WeightRangeType = [...weightRange];
    const firstHandleValue = firstHandle === null ? 0 : cloneWeightRange[firstHandle];
    const secondHandleValue = secondHandle === null ? MAX_VALUE : cloneWeightRange[secondHandle];

    if (num <= secondHandleValue - firstHandleValue) {
      // squizzing
      if (firstHandle === null) {
        cloneWeightRange[0] = num;
      } else if (secondHandle === null) {
        cloneWeightRange[WEIGHT_INPUTS_NUMBER - 2] = MAX_VALUE - num;
      } else {
        cloneWeightRange[secondHandle] = firstHandleValue + num;
      }
      return setWeightRange(cloneWeightRange);
    } else {
      // expand
      // expand to right
      const newWeightRangeRightTraverse = cloneWeightRange.map((item, index) =>
        secondHandle !== null && index >= secondHandle && item < secondHandleValue + num
          ? firstHandleValue + num > MAX_VALUE
            ? MAX_VALUE
            : firstHandleValue + num
          : item
      );

      // expand to left
      if (firstHandleValue + num > MAX_VALUE) {
        const newWeightRangeLeftTraverse = newWeightRangeRightTraverse.map((item, index) => {
          if (item >= MAX_VALUE - num && firstHandle !== null && index <= firstHandle) {
            return MAX_VALUE - num;
          }
          return item;
        });
        return setWeightRange(newWeightRangeLeftTraverse as WeightRangeType);
      }
      return setWeightRange(newWeightRangeRightTraverse as WeightRangeType);
    }
  };

  const onChangeWeightInput = (e: any, index: number) => {
    const num = e.target.value ? parseInt(e.target.value) : 0;

    if (num > MAX_VALUE) {
      e.preventDefault();
      return;
    }

    const firstHandleIndex = index === 0 ? null : index - 1;
    const secondHandleIndex = index === WEIGHT_INPUTS_NUMBER - 1 ? null : index;

    findNextEnchroachment(num, firstHandleIndex, secondHandleIndex);
  };

  const onSave = () => {
    if ((significantLevelRange[1] * 2) % 2 === 1) {
      setErrors('백분율은 정수여야 합니다!');
      return;
    }
    const percentageAE = significantLevelRange[0];
    const percentageBD =
      (significantLevelRange[1] > significantLevelRange[2]
        ? significantLevelRange[2]
        : significantLevelRange[1]) - significantLevelRange[0];
    const percentageC = Math.abs(significantLevelRange[2] - significantLevelRange[1]);
    const distanceRatioRate = weightRange[0];
    const collectDistanceRate = weightRange[1] - weightRange[0];
    const durationRatioRate = weightRange[2] - weightRange[1];
    const collectDurationRate = weightRange[3] - weightRange[2];
    const manualCollectTimeRate = weightRange[4] - weightRange[3];
    const collectCountRate = 100 - weightRange[4];
    onChangeConfigWeight({
      percentageAE,
      percentageBD,
      percentageC,
      distanceRatioRate,
      collectDistanceRate,
      durationRatioRate,
      collectDurationRate,
      manualCollectTimeRate,
      collectCountRate,
    });
  };

  const preventOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    let paste = (e.clipboardData || (window as any).clipboardData).getData('text');
    if (Number.isNaN(Number(paste))) {
      e.preventDefault();
    }
  };

  return {
    colors,
    significantLevelRange,
    errors,
    setSignificantLevelRange,
    weightRange,
    levelAnE,
    levelBnD,
    levelC,
    setErrors,
    setWeightRange,
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
    onSave,
    preventOnPaste,
  };
};
