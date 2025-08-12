import React from 'react';

import s from '../../index.module.css';
import { PolicyData } from '../index.utils';

interface Props {
  data: PolicyData[];
  isFreeHeightTabContent?: boolean;
}

const PrivacyPolicy: React.FC<Props> = ({ data, isFreeHeightTabContent }) => {
  return (
    <div
      className={`${isFreeHeightTabContent ? s.freeHeightTabContent : s.tabContent} ${
        s.tabTypeBArea3
      }`}
    >
      <div className={s.pH1}>개인정보 처리방침</div>
      <br></br>

      {data?.map((item: PolicyData, index: number) => (
        <div key={index}>
          {item.title2 && <div className={`${s.pH3}`}>{item.title2}</div>}
          {item.title && <div className={s.pH2}>{item.title}</div>}

          {item.content?.map((itemcontent: any, index: number) => (
            <div key={index} className={s.pNum3}>
              <div className={s.t1}>{itemcontent.t1}</div>
              <div className={s.t2}>{itemcontent.t2}</div>

              {itemcontent.content2?.map((itemcontent2: any, index: number) => (
                <div key={index} className={s.pNum5}>
                  <div className={s.t1}>{itemcontent2.t1}</div>
                  <div className={s.t2}>{itemcontent2.t2}</div>
                </div>
              ))}

              {itemcontent.content3?.map((itemcontent3: any, index: number) => (
                <div key={index} className={s.pNum1}>
                  <div className={s.t1}>{itemcontent3.t1}</div>
                  <div className={s.t2}>{itemcontent3.t2}</div>
                </div>
              ))}
            </div>
          ))}

          {item.table && <div className={s.pH3}>{item.table}</div>}
        </div>
      ))}
    </div>
  );
};

export default PrivacyPolicy;
