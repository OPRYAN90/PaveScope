import { useState, useEffect, useRef } from 'react';

export function useFollowScroll() {
  const [style, setStyle] = useState({});
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const { top } = ref.current.getBoundingClientRect();
        if (top <= 0) {
          setStyle({
            position: 'fixed',
            top: '0px',
            left: '0px',
            bottom: '0px',
            overflowY: 'auto'
          });
        } else {
          setStyle({});
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, style };
}