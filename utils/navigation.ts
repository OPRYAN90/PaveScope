import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

let scrollableElement: Window | null = null;

export function useNavigateOrScrollTop(targetPath: string) {
  const router = useRouter();

  const handleNavigation = useCallback(() => {
    if (window.location.pathname === targetPath) {
      if (scrollableElement) {
        scrollableElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      router.push(targetPath);
    }
  }, [router, targetPath]);

  return handleNavigation;
}

useNavigateOrScrollTop.setScrollableElement = (element: Window) => {
  scrollableElement = element;
};
