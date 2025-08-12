import ContactUs from '@/components/home/contact-us';
import Footer from '@/components/home/footer';
import NewLetter from '@/components/home/new-letter';
import HomeSection1 from '@/components/home/section/home-section-1';
import HomeSection2 from '@/components/home/section/home-section-2';
import HomeSection3 from '@/components/home/section/home-section-3';
import HomeSection4 from '@/components/home/section/home-section-4';
import HomeSection5 from '@/components/home/section/home-section-5';
import HomeSection6 from '@/components/home/section/home-section-6';
import HomeSection7 from '@/components/home/section/home-section-7';
import HomeSection8 from '@/components/home/section/home-section-8';
import HomeSection9 from '@/components/home/section/home-section-9';
import StaticTab from '@/components/home/static-tab';
import { HomeHeader } from '@/layouts/main-layout/header-layout';
import { scrollTo } from '@/utils';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import s from './index.module.css';

const Home = () => {
  const params = useSearchParams();
  const [isOpenLoginForm, setIsOpenLoginForm] = useState(false);
  const [isOpenNewLetter, setIsOpenNewLetter] = useState(false);
  const [isOpenContactUs, setIsOpenContactUs] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpenPolicy, setIsOpenPolicy] = useState(false);
  const [activeKey, setActiveKey] = useState('1');

  const toggleOpen = () => {
    setIsOpenLoginForm(!isOpenLoginForm);
  };

  const toggleOpenNewLetter = () => {
    setIsOpenNewLetter(!isOpenNewLetter);
  };

  const toggleOpenContactUs = () => {
    setIsOpenContactUs(!isOpenContactUs);
  };

  const toggleOpenPolicy = (key: string = '1') => {
    setIsOpenPolicy(!isOpenPolicy);
    setActiveKey(key);
  };

  const handleScroll = () => {
    if (window.scrollY > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const id = params.get('id');
    if (id) {
      scrollTo(id);
    }

    const isOpenLogin = params.get('isOpenLogin');
    if (isOpenLogin === 'true') {
      setIsOpenLoginForm(true);
    }
  }, [params]);

  return (
    <div className={s.scroll}>
      <HomeHeader
        isOpenLoginForm={isOpenLoginForm}
        isScrolled={isScrolled}
        toggleOpen={toggleOpen}
      />
      <HomeSection1 />
      <HomeSection2 />
      <HomeSection3 />
      <HomeSection4 />
      <HomeSection5 />
      <HomeSection6 />
      <HomeSection7 />
      <HomeSection8 />
      <HomeSection9 />
      <Footer
        toggleOpenNewLetter={toggleOpenNewLetter}
        toggleOpenContactUs={toggleOpenContactUs}
        toggleOpenPolicy={toggleOpenPolicy}
        isScrolled={isScrolled}
      />
      {isOpenNewLetter && (
        <NewLetter isOpenNewLetter={isOpenNewLetter} toggleOpenNewLetter={toggleOpenNewLetter} />
      )}
      {isOpenContactUs && <ContactUs toggleOpenContactUs={toggleOpenContactUs} />}
      {isOpenPolicy && <StaticTab toggleOpenPolicy={toggleOpenPolicy} activeKey={activeKey} />}
    </div>
  );
};

export default Home;
