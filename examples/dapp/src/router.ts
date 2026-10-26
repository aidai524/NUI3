import { useEffect, useState } from 'react';

// Minimal hash router: "#/tx/abc" -> ["tx", "abc"]. No server config needed.
const read = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);

export function useRoute(): string[] {
  const [segments, setSegments] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setSegments(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return segments;
}

export const to = (...parts: string[]) => `#/${parts.join('/')}`;
