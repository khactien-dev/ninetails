import React from 'react';

import s from '../../index.module.css';
import { EthicsData } from '../index.utils';

interface Props {
  data: EthicsData[];
}

const CodeEthics: React.FC<Props> = ({ data }) => {
  return (
    <div className={s.tabContent}>
      <div className={s.pH1}>윤리 규범</div>

      {data?.map((item: EthicsData, index: number) => (
        <div key={index}>
          <div className={s.pH2}>{item.title}</div>

          {item.content?.map((item: any, index: number) => (
            <div key={index} className={s.pDot}>
              <div className={s.t1}></div>
              <div className={s.t2}>{item}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CodeEthics;
