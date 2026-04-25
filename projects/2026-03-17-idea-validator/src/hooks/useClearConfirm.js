import { useState, useRef, useEffect } from 'react';

export function useClearConfirm(onClear) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function handle() {
    if (confirming) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setConfirming(false);
      onClear();
    } else {
      setConfirming(true);
      timerRef.current = setTimeout(() => {
        setConfirming(false);
        timerRef.current = null;
      }, 2400);
    }
  }

  return { confirming, handle };
}
