import React from 'react';

import s from './../index.module.css';
import * as S from './../index.style';
import m from './../modal.module.css';
import useStaticTab from './index.utils';

interface IProps {
  toggleOpenPolicy: (key?: string) => void;
  activeKey: string;
}
const StaticTab: React.FC<IProps> = ({ toggleOpenPolicy, activeKey }) => {
  const { items } = useStaticTab();

  return (
    <div className={`${s.active}`}>
      <div className={`${m.modalNormal} ${m.modalSize3} intro-modal1 ${s.active}`}>
        <button
          type="button"
          onClick={() => toggleOpenPolicy()}
          className={`${m.buttonCloseModal} ${s.footerButton}`}
          title="close modal"
        ></button>

        <S.Tabs defaultActiveKey={activeKey ? activeKey : '1'} items={items} />
      </div>

      <button
        onClick={() => toggleOpenPolicy()}
        type="button"
        className={`${m.dimm} ${s.footerButton}`}
        title="close modal"
      ></button>
    </div>
  );
};

export default StaticTab;
