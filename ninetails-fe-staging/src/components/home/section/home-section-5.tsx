import ImgS2 from '@/assets/images/common/s2.png';
import { motion } from 'framer-motion';
import React from 'react';

import s from '../index.module.css';

const HomeSection5 = () => {
  return (
    <div
      className={`section ${s['homeSection4-2']} parallax-window`}
      data-parallax="scroll"
      id="homeSection4b"
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
                <div className={s.no}>2</div>
              </div>
              <div className={s.titleTxt}>배차현황</div>
            </div>
            <div className={`${s.fLine} fadeUp`}></div>
            <div className={`${s.fTxt} fadeUp`}>
              기존 엑셀 또는 PC 프로그램을 이용하던 배차 작업을 <br />
              클라우드에서 쉽게 진행할 수 있습니다. 전일 배차 내용 <br />
              중 변경 부분만 간단히 수정해서 입력할 수 있으며, <br />
              기간 통계와 EXCEL, PDF 파일 출력을 지원합니다
            </div>
          </div>
          <div className={`${s.col2} fadeUp`}>
            <img src={ImgS2.src} alt="" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSection5;
