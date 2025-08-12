import ImgS4 from '@/assets/images/common/s4.png';
import { motion } from 'framer-motion';
import React from 'react';

import s from '../index.module.css';

const HomeSection7 = () => {
  return (
    <div
      className={`section ${s['homeSection4-4']} parallax-window`}
      data-parallax="scroll"
      id="homeSection4d"
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
        viewport={{ once: true }}
        className={s.centerWrap}
      >
        <div className={s.functionWrap}>
          <div className={s.col1}>
            <div className={`${s.fTitleRow} fadeUp`}>
              <div className={s.noWrap}>
                <div className={s.no}>4</div>
              </div>
              <div className={s.titleTxt}>수거량 분석</div>
            </div>
            <div className={`${s.fLine} fadeUp`}></div>
            <div className={`${s.fTxt} fadeUp`}>
              종량제봉투의 수거 작업 데이터를 실시간 분석해서 <br />
              정밀한 기간별 통계를 제공합니다. 지자체가 규정한 <br />
              종량제봉투의 크기 및 용도 별 수량과 부피를 차트로 <br />
              시각화합니다
            </div>
          </div>
          <div className={`${s.col2} fadeUp`}>
            <img src={ImgS4.src} alt="" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSection7;
