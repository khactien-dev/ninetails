import ImgS5 from '@/assets/images/common/s5.png';
import s from '@/components/home/index.module.css';
import { motion } from 'framer-motion';
import React from 'react';

const HomeSection8 = () => {
  return (
    <div className={`section ${s['homeSection4-5']}`} id="homeSection4e">
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
                <div className={s.no}>5</div>
              </div>
              <div className={s.titleTxt}>차량운행일지</div>
            </div>
            <div className={`${s.fLine} fadeUp`}></div>
            <div className={`${s.fTxt} fadeUp`}>
              기존 종이양식 혹은 엑셀로 작성하던 차량운행일지를 자동 <br />
              생성합니다. 배차지역 내 운행 구간별 수거량이 자동 <br />
              입력되며, 일일 매립량 및 주유량을 동시에 관리합니다
            </div>
          </div>
          <div className={`${s.col2} fadeUp`}>
            <img src={ImgS5.src} alt="" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSection8;
