/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { formatUGX } from '@/lib/format';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

const AnimatedNumber = ({ value, duration = 1000, className }: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{formatUGX(display)}</span>;
};

export default AnimatedNumber;
