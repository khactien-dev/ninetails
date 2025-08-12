import Img1112n from '@/assets/images/common/1112n.png';
import s from '@/components/home/index.module.css';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

const HomeSection9 = () => {
  return (
    <div className={`section ${s.homeSection5}`}>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
        viewport={{ once: true }}
        className={s.centerWrap}
      >
        <div className={`${s.hs5Col2} ${s.hs5Col2TypeA} ${s.show600b}`}>
          <img src={Img1112n.src} className={`${s.imgHs5} fadeUp`} alt="" />
        </div>
        <div className={s.hs5Col1}>
          <div className={`${s.subTitleBig2} fadeUp`}>
            Experience innovative tools of <span className={s.sp3}></span>
          </div>
          <div className={`${s.subTitle2} fadeUp`}>
            청소행정 업무를 위한 혁신 기술을 경험해 보세요
          </div>

          <div className={`${s.hs5Row} fadeUp`}>
            <Link href="/request" className={s.buttonGotoDemo}>
              데모신청
            </Link>
            <Link href="/auth/register" className={s.buttonGotoJoin}>
              회원가입
            </Link>
          </div>
        </div>
        <div className={`${s.hs5Col2} ${s.hide600}`}>
          <img src={Img1112n.src} className={`${s.imgHs5} fadeUp`} alt="" />
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSection9;
