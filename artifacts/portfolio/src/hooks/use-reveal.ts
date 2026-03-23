import { useEffect, useRef, useState } from 'react';

export function useReveal(threshold = 0.1, triggerOnce = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, triggerOnce]);

  return { ref, isVisible };
}
