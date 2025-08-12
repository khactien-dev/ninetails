import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function useMainLayout() {
  const router = useRouter();
  const [isOpenLoginForm, setIsOpenLoginForm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const toggleOpen = () => {
    setIsOpenLoginForm(!isOpenLoginForm);
  };

  const scrollToOtherRouter = (path: string, id: string) => {
    router.push({
      pathname: path,
      query: { id },
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsOpenLoginForm(false);
  }, [router]);

  return {
    toggleOpen,
    isScrolled,
    isOpenLoginForm,
    scrollToOtherRouter,
  };
}
