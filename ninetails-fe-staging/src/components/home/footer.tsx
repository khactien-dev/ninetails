import ImgSbLogo2 from '@/assets/images/common/sb-logo2.png';
import { scrollTo } from '@/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

import s from './index.module.css';

interface FooterProps {
  isScrolled: boolean;
  toggleOpenNewLetter: () => void;
  toggleOpenContactUs: () => void;
  toggleOpenPolicy: (key?: string) => void;
}
const Footer: React.FC<FooterProps> = ({
  isScrolled,
  toggleOpenNewLetter,
  toggleOpenContactUs,
  toggleOpenPolicy,
}) => {
  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className={s.introFooter}>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
        viewport={{ once: true }}
        className={s.centerWrap}
      >
        <div className={`${s.row1} ${s.row}`}>
          <div className={`${s.fLogo} fadeUp`}>
            <Link href="/" className={s.fLogoImg}>
              <img src={ImgSbLogo2.src} alt="Super Bucket" />
            </Link>
            <div className={s.txtFn}>Edge Vision Analytics</div>
            <div className={s.buttonSnsGroup}>
              <button
                type="button"
                className={`${s.buttonSns} fadeUp ${s.instagram}  ${s.footerButton}`}
                onClick={() => openLink('https://www.instagram.com')}
              ></button>
              <button
                type="button"
                className={`${s.buttonSns} ${s.youtube} ${s.footerButton}`}
                onClick={() => openLink('https://www.youtube.com')}
              ></button>
              <button
                type="button"
                className={`${s.buttonSns} ${s.facebook} ${s.footerButton}`}
                onClick={() => openLink('https://www.facebook.com')}
              ></button>
            </div>
          </div>

          <div className={s.fNav}>
            <div className={`${s.fNavOne} fadeUp`}>
              <div className={s.fnTitle}>기술개요</div>
              <div className={s.fnMenuWrap}>
                <div className={s.row}>
                  <button
                    onClick={() => scrollTo('homeSection3')}
                    type="button"
                    className={`${s.fnMenu} buttonLink1 home ${s.homepageHeaderButton}`}
                  >
                    <span>EVA 아키텍처</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`${s.fNavOne} fadeUp`}>
              <div className={s.fnTitle}>주요기능</div>
              <div className={s.fnMenuWrap}>
                <div className={s.row}>
                  <button
                    onClick={() => scrollTo('homeSection4a')}
                    type="button"
                    className={`${s.fnMenu} buttonLink2 home ${s.homepageHeaderButton}`}
                  >
                    <span>대시보드</span>
                  </button>
                </div>
                <div className={s.row}>
                  <button
                    onClick={() => scrollTo('homeSection4b')}
                    type="button"
                    className={`${s.fnMenu} buttonLink2b ${s.homepageHeaderButton}`}
                  >
                    <span>배차현황</span>
                  </button>
                </div>
                <div className={s.row}>
                  <button
                    onClick={() => scrollTo('homeSection4c')}
                    type="button"
                    className={`${s.fnMenu} buttonLink2c ${s.homepageHeaderButton}`}
                  >
                    <span>실시간운행</span>
                  </button>
                </div>
                <div className={s.row}>
                  <button
                    onClick={() => scrollTo('homeSection4d')}
                    type="button"
                    className={`${s.fnMenu} buttonLink2d ${s.homepageHeaderButton}`}
                  >
                    <span>수거량분석</span>
                  </button>
                </div>
                <div className={s.row}>
                  <button
                    onClick={() => scrollTo('homeSection4e')}
                    type="button"
                    className={`${s.fnMenu} buttonLink2e ${s.homepageHeaderButton}`}
                  >
                    <span>차량운행일지</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`${s.fNavOne} fadeUp`}>
              <div className={s.fnTitle}>문의</div>
              <div className={s.fnMenuWrap}>
                <div className={s.row}>
                  <button
                    type="button"
                    className={`${s.fnMenu} openCs ${s.homepageHeaderButton}`}
                    onClick={toggleOpenContactUs}
                  >
                    <span>웹 문의</span>
                  </button>
                </div>
                <div className={s.row}>
                  <a href="mailto:support@superbucket.kr" className={s.fnMenu}>
                    <span>이메일 문의&nbsp;&nbsp;&nbsp;support@superbucket.kr</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`${s.fRow2} ${s.row}`}>
          <div className={`${s.fnTxt1} fadeUp up`}>
            2024 Ninetaill AI, inc. :: all rights reserved
          </div>
          <div className={`${s.floatRight} ${s.fnTxt2Wrap} fadeUp`}>
            <button
              type="button"
              className={`${s.fnTxt2Link} ${s.fnTxt2Link1} fadeUp ${s.homepageHeaderButton}`}
              onClick={() => toggleOpenPolicy('1')}
            >
              <span>윤리규범</span>
            </button>
            <button
              type="button"
              className={`${s.fnTxt2Link} ${s.fnTxt2Link2} ${s.homepageHeaderButton}`}
              onClick={() => toggleOpenPolicy('2')}
            >
              <span>서비스 약관</span>
            </button>
            <button
              type="button"
              className={`${s.fnTxt2Link} ${s.fnTxt2Link3} ${s.homepageHeaderButton}`}
              onClick={() => toggleOpenPolicy('3')}
            >
              <span>개인정보 처리방침</span>
            </button>
          </div>
        </div>
      </motion.div>
      {isScrolled && (
        <button
          className={`${s.buttonGotoTop} ${s.footerButton}`}
          id="gotoTop"
          title="위로가기"
          onClick={() => window.scrollTo(0, 0)}
        ></button>
      )}
      <button
        className={`${s.buttonFb1} ${s.footerButton}`}
        title="문의하기"
        onClick={() => toggleOpenNewLetter()}
      ></button>
    </div>
  );
};

export default Footer;
