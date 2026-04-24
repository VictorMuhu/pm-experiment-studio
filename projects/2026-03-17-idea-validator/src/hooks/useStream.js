import { useState, useRef, useEffect } from 'react';

export function useStream() {
  const [thoughts, setThoughts] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [status, setStatus] = useState('idle');
  const abortRef = useRef(null);

  useEffect(() => {
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, []);

  async function startStream(draft, lens) {
    if (abortRef.current) abortRef.current.abort();

    setThoughts([]);
    setVerdict(null);
    setStatus('streaming');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, lens }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setStatus('error');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') { setStatus('done'); return; }
          try {
            const event = JSON.parse(raw);
            if (event.type === 'thought') {
              setThoughts(prev => [...prev, event]);
            } else if (event.type === 'verdict') {
              setVerdict(event);
              setStatus('done');
              return;
            } else if (event.type === 'nothing') {
              setStatus('nothing');
              return;
            } else if (event.type === 'error') {
              setStatus('error');
              return;
            }
          } catch {
            // skip malformed line
          }
        }
      }
      setStatus('done');
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('done');
      } else {
        setStatus('error');
      }
    }
  }

  function stop() {
    if (abortRef.current) abortRef.current.abort();
    setStatus('done');
  }

  return { thoughts, verdict, status, startStream, stop };
}
