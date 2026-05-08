const cache = new Map<string, Promise<void>>();

export function loadScript(url: string, attrs: Record<string, string> = {}): Promise<void> {
  const key = url + '|' + JSON.stringify(attrs);
  const cached = cache.get(key);
  if (cached) return cached;
  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    s.onload = () => resolve();
    s.onerror = () => {
      cache.delete(key);
      reject(new Error(`Failed to load ${url}`));
    };
    document.head.appendChild(s);
  });
  cache.set(key, p);
  return p;
}
