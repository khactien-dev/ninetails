'use client';

import ImageH1 from '@/assets/images/common/h1.jpg';
import ImageH2 from '@/assets/images/common/h2.jpg';
import ImageH3 from '@/assets/images/common/h3.jpg';
import { SwiperWrapper } from '@/components/home/section/section.styles';
import { scrollTo } from '@/utils';
import React, { useEffect, useRef, useState } from 'react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { SwiperSlide } from 'swiper/react';
import { PaginationOptions } from 'swiper/types';

import s from '../index.module.css';

const HomeSection1 = () => {
  const imageSlider = [ImageH1.src, ImageH2.src, ImageH3.src];
  const pagination: PaginationOptions = {
    el: '.swiper-pagination2a',
    clickable: true,
  };

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const txtWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fadeClass, setFadeClass] = useState(s.fadeIn);

  useEffect(() => {
    txtWrapRefs.current.forEach((el, index) => {
      if (el) {
        if (index === activeSlideIndex) {
          el.classList.add(s.active, s.fadeIn);
          el.classList.remove(s.fadeOut);
        } else {
          el.classList.remove(s.active, s.fadeIn);
          el.classList.add(s.fadeOut);
        }
      }
    });
  }, [activeSlideIndex]);

  useEffect(() => {
    if (txtWrapRefs.current[0]) {
      txtWrapRefs.current[0].classList.add(s.active, s.fadeIn);
    }
  }, []);

  return (
    <div className={`section ${s.homeSection1}`}>
      <SwiperWrapper
        pagination={pagination}
        modules={[Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        loop={true}
        speed={400}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        onSlideChange={(swiper) => {
          setFadeClass(s.fadeOut);
          setTimeout(() => {
            setActiveSlideIndex(swiper.realIndex);
            setFadeClass(s.fadeIn);
          }, 300);
        }}
        className={s.homeSwiper1}
      >
        {imageSlider.map((v, i) => (
          <SwiperSlide key={i} className="swiper-slide">
            <div className={`${s.allBg} `} style={{ background: `url(${v}) center no-repeat` }}>
              <div className={s.centerWrap}>
                <div
                  className={`${s.txtWrap} ${i === activeSlideIndex ? s.active : ''} ${fadeClass}`}
                  ref={(el) => (txtWrapRefs.current[i] = el)}
                >
                  <div className={s.txt1}>환경을 지키는 선한 AI</div>
                  <div className={s.txt2}>Edge Vision Analytics</div>
                  <div className={s.txt3}>
                    SuperBucket은 종량제봉투 수거 업무를 혁신하는 <br className="hide340" />
                    딥러닝과 엣지컴퓨팅 기술 기반의 청소행정 데이터 포털입니다.
                  </div>
                  <a onClick={() => scrollTo('homeSection2')} className={s.buttonHome1}>
                    <span>DISCOVER</span>
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination2a"></div>
      </SwiperWrapper>
    </div>
  );
};

export default HomeSection1;
