import { useState } from 'react';

const DELETED = '__deleted__';

function usePersistedImage(key, defaultSrc) {
  const [src, setSrc] = useState(() => {
    const saved = localStorage.getItem(`img_${key}`);
    if (saved === DELETED) return null;
    return saved || defaultSrc;
  });

  const updateSrc = (newUrl) => {
    localStorage.setItem(`img_${key}`, newUrl);
    setSrc(newUrl);
  };

  const deleteSrc = () => {
    localStorage.setItem(`img_${key}`, DELETED);
    setSrc(null);
  };

  const resetSrc = () => {
    localStorage.removeItem(`img_${key}`);
    setSrc(defaultSrc);
  };

  return [src, updateSrc, deleteSrc, resetSrc];
}

export default usePersistedImage;
