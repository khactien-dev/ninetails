import Img1111n2 from '@/assets/images/common/1111n2.png';
import Img1111n from '@/assets/images/common/1111n.png';
import { motion } from 'framer-motion';
import React from 'react';

import s from '../index.module.css';

const HomeSection3 = () => {
  return (
    <div className={`section ${s.homeSection3}`} id="homeSection3">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
        viewport={{ once: true }}
        className={s.centerWrap}
      >
        <div className={`${s.subTitle} fadeUp`}>
          <span className={s.sp1}></span>은 종량제봉투 수거차량에{' '}
          <span className={s.s1}>엣지컴퓨팅</span>과 <span className={s.s1}>딥러닝</span>
          <br className={s.hide560} />
          기술을 결합함으로써, 수거업무 현황을 실시간 수집합니다. <br />
          <br />
          수거동선 최적화, 수거 업무 데이터 시각화 및 <span className="s1">
            청소행정 업무
          </span>를 <br className={s.hide560} />
          자동화하는 혁신적인 도구를 제공합니다.
        </div>

        <img src={Img1111n.src} className={`${s.imgHs3} fadeUp`} alt="" />
        <img src={Img1111n2.src} className={`${s.imgHs3mo} fadeUp`} alt="" />
      </motion.div>
    </div>
  );
};

export default HomeSection3;
