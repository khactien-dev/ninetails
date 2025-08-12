import React from 'react';

import s from '../../index.module.css';
import { TermsData } from '../index.utils';

interface Props {
  data: TermsData[];
  isFreeHeightTabContent?: boolean;
}

const TermsService: React.FC<Props> = ({ data, isFreeHeightTabContent }) => {
  return (
    <div className={isFreeHeightTabContent ? s.freeHeightTabContent : s.tabContent}>
      <div className={s.pH1}>서비스 이용약관</div>

      {data?.map((item: TermsData, index: number) => (
        <div key={index}>
          <div className={s.pH2}>{item.title}</div>

          {item.title2 && <div className={s.pH3}>{item.title2}</div>}

          {item.content?.map((itemcontent: any, index: number) => (
            <div key={index} className={s.pNum1}>
              <div className={s.t1}>{itemcontent.t1}</div>
              <div className={s.t2}>{itemcontent.t2}</div>

              {itemcontent.content2?.map((itemcontent2: any, index: number) => (
                <div key={index} className={s.pNum2}>
                  <div className={s.t1}>{itemcontent2.t1}</div>
                  <div className={s.t2}>{itemcontent2.t2}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TermsService;
