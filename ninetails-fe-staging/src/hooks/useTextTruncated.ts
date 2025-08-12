import { useEffect, useState } from 'react';

const useIsTextTruncated = (element: Element) => {
  const [isTruncated, setIsTruncated] = useState<boolean>(false);

  useEffect(() => {
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { clientWidth, scrollWidth } = entry.target;
        setIsTruncated(scrollWidth - clientWidth > 1);
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [element]);

  return isTruncated;
};

export default useIsTextTruncated;
