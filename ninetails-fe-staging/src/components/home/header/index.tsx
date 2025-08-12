import Logo from '@/assets/images/common/sb_logo3.png';
import { BaseImage } from '@/components/common/base-image';
import { HomePageLogin } from '@/components/home/login';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import s from '../index.module.css';

interface HomePageHeaderProps {
  toggleOpen: () => void;
  isScrolled: boolean;
  isOpenLoginForm: boolean;
}

export const HomeHeader: React.FC<HomePageHeaderProps> = ({
  isOpenLoginForm,
  isScrolled,
  toggleOpen,
}) => {
  const router = useRouter();
  const scrollToOtherRouter = (path: string, id: string) => {
    router.push({
      pathname: path,
      query: { id },
    });
  };
  const user = useAppSelector(selectCurrentUser);

  return (
    <>
      <header className={`${s.normalHeader} ${isScrolled ? s.active : ''}`}>
        <div className={s.centerWrap}>
          <Link href="/" className={s.logo}>
            <BaseImage src={Logo.src} preview={false} />
          </Link>
          <div className={s.floatRight}>
            <div className={s.normalMenuWrap}>
              <button
                type="button"
                className={`${s.normalMenu} ${s.homepageHeaderButton} home buttonLink1`}
                onClick={() => scrollToOtherRouter('/', 'homeSection3')}
              >
                기술개요
              </button>
              <button
                type="button"
                className={`${s.normalMenu} ${s.homepageHeaderButton} home buttonLink2`}
                onClick={() => scrollToOtherRouter('/', 'homeSection4a')}
              >
                주요기능
              </button>
              <Link href="/contact" className={s.normalMenu}>
                문의
              </Link>
              <Link href="/request" className={s.normalMenu}>
                데모신청
              </Link>
            </div>
            <button
              className={`${s.headerLogin}`}
              type="button"
              onClick={() => {
                if (user) return router.push('/admin/dashboard');
                toggleOpen();
              }}
            >
              <span>{user ? user.username : '로그인'}</span>
            </button>
            {user ? (
              <button
                className={`${s.loggedHeaderMenu}`}
                type="button"
                onClick={() => {
                  if (user) return router.push('/admin/dashboard');
                  toggleOpen();
                }}
              >
                <span>{user ? user.username : '로그인'}</span>
              </button>
            ) : (
              <button className={`${s.headerMenu}`} type="button" onClick={() => toggleOpen()}>
                <span>메뉴</span>
              </button>
            )}
          </div>
        </div>
      </header>
      {isOpenLoginForm && !user && <HomePageLogin toggleOpen={toggleOpen} />}
    </>
  );
};
