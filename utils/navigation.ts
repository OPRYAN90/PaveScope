import { useRouter } from 'next/navigation';
import { useCallback, RefObject } from 'react';

export function useNavigateOrScrollTop(targetPath: string, contentRef: RefObject<HTMLElement>) {
  const router = useRouter();

  const handleNavigation = useCallback(() => {
    if (window.location.pathname === targetPath) {
      // If already on the target page, scroll the main content to top
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // If on a different page, navigate to the target page
      router.push(targetPath);
    }
  }, [router, targetPath, contentRef]);

  return handleNavigation;
}