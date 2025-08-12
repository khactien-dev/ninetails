import ImgS1 from '@/assets/images/common/s1.png';
import { motion } from 'framer-motion';
import React from 'react';

import s from '../index.module.css';

const HomeSection4 = () => {
  return (
    <div className={`section ${s['homeSection4-1']}`} id="homeSection4a">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
        viewport={{ once: true }}
        className={s.centerWrap}
      >
        <div className={`${s.subTitleBig} fadeUp`}>
          종량제봉투 수거 업무의 <br className={s.show500} />
          생산성 UP!
        </div>
        <div className={`${s.subTitle} fadeUp`}>
          <span className={s.sp1}>SuperBucket</span>의 현대화된 청소행정 업무 도구들을 경험해
          보세요.
        </div>

        <div className={s.functionWrap}>
          <div className={s.col1}>
            <div className={`${s.fTitleRow} fadeUp`}>
              <div className={s.noWrap}>
                <div className={s.no}>1</div>
              </div>
              <div className={s.titleTxt}>대시보드</div>
            </div>
            <div className={`${s.fLine} fadeUp`}></div>
            <div className={`${s.fTxt} fadeUp`}>
              등록된 차량 전체의 운행 및 수거작업 현황을 한 눈에 <br />
              확인할 수 있습니다. 당일 실시간으로 누적 되는, 차 <br />
              량 전체의 운행 관련 지표 외에, 종량제 봉투 수거량, <br />
              수거 무게, 수거 시간, 수거 거리 통계(평균 및 합계) <br />를 간결하게 제공합니다.
            </div>
          </div>
          <div className={`${s.col2} fadeUp`}>
            <img src={ImgS1.src} alt="" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSection4;
