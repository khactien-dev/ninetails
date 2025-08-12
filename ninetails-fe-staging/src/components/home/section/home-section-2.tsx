import Image1g from '@/assets/images/common/icon1g.png';
import Image2g from '@/assets/images/common/icon2g.png';
import Image3g from '@/assets/images/common/icon3g.png';
import Image4g from '@/assets/images/common/icon4g.png';
import Image5g from '@/assets/images/common/icon5g.png';
import Image6g from '@/assets/images/common/icon6g.png';
import Image7g from '@/assets/images/common/icon7g.png';
import Image8g from '@/assets/images/common/icon8g.png';
import { motion } from 'framer-motion';
import React from 'react';

import s from '../index.module.css';

const HomeSection2 = () => {
  const dataMapping = [
    {
      src: Image1g.src,
      text: '광주과학기술원',
    },
    {
      src: Image2g.src,
      text: '울산테크노파크',
    },
    {
      src: Image3g.src,
      text: '광주시 광산구청',
    },
    {
      src: Image4g.src,
      text: '에이엠특장',
    },
    {
      src: Image5g.src,
      text: '넷비전텔레콤',
    },
    {
      src: Image6g.src,
      text: '나인테일AI',
    },
    {
      src: Image7g.src,
      text: '소타텍코리아',
    },
    {
      src: Image8g.src,
      text: '네이버클라우드',
    },
  ];
  return (
    <div className={`section ${s.homeSection2}`} id="homeSection2">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
        className={s.centerWrap}
      >
        <div className={`${s.subTitle} fadeUp`}>
          청소행정 업무의 기술 혁신을 위해, <br className={`${s.show560} ${s.hide300}`} />
          신뢰받는 파트너들과 함께 합니다
        </div>
        <div className={s.partners}>
          {dataMapping.map((v, i) => {
            return (
              <div className={`${s.partner} fadeUp`} key={i}>
                <div className={s.imgWrap}>
                  <img src={v.src} alt="" />
                </div>
                <div className={s.txt}>{v.text}</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
export default HomeSection2;
