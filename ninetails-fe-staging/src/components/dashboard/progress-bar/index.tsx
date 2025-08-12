import React, { useEffect, useRef } from 'react';

import * as S from './../index.styles';

interface Props {
  value_progress?: number;
  unit?: string;
}

const ProgressBar = ({ value_progress, unit }: Props) => {
  const elementPane = useRef<any>();
  const convertValue = value_progress ? value_progress.toFixed(2) : 0;

  useEffect(() => {
    if (!elementPane.current) return;

    const path = elementPane.current;

    let length = path.getTotalLength();
    let value = path.parentNode.getAttribute('data-value');
    let to = length * ((100 - value) / 100);
    path.getBoundingClientRect();
    path.style.strokeDashoffset = Math.max(0, to);
    path.nextElementSibling.textContent = `${value == 0 ? '--' : value + unit}`;
  }, [elementPane, convertValue, unit]);

  return (
    <S.Svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      data-value={convertValue}
    >
      <defs>
        <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#57BA0070" />
        </filter>
      </defs>
      <S.Circle r="45" cx="50" cy="50" />
      <S.Meter
        d="M5,50a45,45 0 1,0 90,0a45,45 0 1,0 -90,0"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDashoffset="282.78302001953125"
        strokeDasharray="282.78302001953125"
        ref={elementPane}
        filter="url(#drop-shadow)"
      />
      <S.SvgText
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
      ></S.SvgText>
    </S.Svg>
  );
};

export default ProgressBar;
