import { useEffect, useState } from 'react';

/** Detects compact viewports and coarse-pointer devices for mobile-specific UX. */
export function useIsMobile(): boolean {
  const checkMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 ||
      window.innerHeight < 540 ||
      window.matchMedia('(pointer: coarse)').matches;
  };

  const [isMobile, setIsMobile] = useState(checkMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
