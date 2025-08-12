import ImgS3 from '@/assets/images/common/s3.png';
import { motion } from 'framer-motion';
import React from 'react';

import s from '../index.module.css';

const HomeSection6 = () => {
  return (
    <div className={`section ${s['homeSection4-3']}`} id="homeSection4c">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
        viewport={{ once: true }}
        className={s.centerWrap}
      >
        <div className={s.functionWrap}>
          <div className={`${s.col1} fadeUp`}>
            <div className={s.fTitleRow}>
              <div className={s.noWrap}>
                <div className={s.no}>3</div>
              </div>
              <div className={s.titleTxt}>실시간 운행</div>
            </div>
            <div className={`${s.fLine} fadeUp`}></div>
            <div className={`${s.fTxt} fadeUp`}>
              실시간으로 배차구역 내 수거차량의 위치 및 운행종료, <br />
              운행, 수거, 매립, 입차, 출차 등 작업 상태를 한 눈에 <br />
              제공합니다. 또한 전체 및 개별 차량의 실시간 수거 통 <br />
              계를 간략히 확인할 수 있습니다
            </div>
          </div>
          <div className={`${s.col2} fadeUp`}>
            <img src={ImgS3.src} alt="" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSection6;
