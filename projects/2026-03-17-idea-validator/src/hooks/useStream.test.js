import { renderHook, act } from '@testing-library/react';
import { useStream } from './useStream';

function makeStream(lines) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line + '\n'));
      }
      controller.close();
    },
  });
}

function mockFetch(lines) {
  global.fetch = vi.fn().mockResolvedValue({
    body: makeStream(lines),
    ok: true,
  });
}

describe('useStream', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('starts in idle status with empty thoughts', () => {
    const { result } = renderHook(() => useStream());
    expect(result.current.status).toBe('idle');
    expect(result.current.thoughts).toEqual([]);
    expect(result.current.verdict).toBeNull();
  });

  it('parses thought events and sets done on verdict', async () => {
    mockFetch([
      'data: {"type":"thought","category":"concern","text":"Weak differentiation","quote":"easier to use"}',
      'data: {"type":"verdict","label":"Refine","score":60,"reason":"Solid problem, weak moat."}',
      'data: [DONE]',
    ]);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Test Idea' }, 'skeptic');
    });
    expect(result.current.thoughts).toHaveLength(1);
    expect(result.current.thoughts[0].category).toBe('concern');
    expect(result.current.thoughts[0].quote).toBe('easier to use');
    expect(result.current.verdict.label).toBe('Refine');
    expect(result.current.verdict.score).toBe(60);
    expect(result.current.status).toBe('done');
  });

  it('handles nothing event', async () => {
    mockFetch(['data: {"type":"nothing"}']);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Vague idea' }, 'skeptic');
    });
    expect(result.current.status).toBe('nothing');
    expect(result.current.thoughts).toHaveLength(0);
  });

  it('handles error event', async () => {
    mockFetch(['data: {"type":"error","message":"Stream interrupted"}']);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Test' }, 'skeptic');
    });
    expect(result.current.status).toBe('error');
  });

  it('skips malformed JSON lines without crashing', async () => {
    mockFetch([
      'data: not-valid-json',
      'data: {"type":"thought","category":"strength","text":"Clear problem","quote":"users abandon checkout"}',
      'data: [DONE]',
    ]);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Test' }, 'skeptic');
    });
    expect(result.current.thoughts).toHaveLength(1);
  });

  it('stop() aborts the stream and sets status to done', async () => {
    let streamController;
    const stream = new ReadableStream({ start(c) { streamController = c; } });
    global.fetch = vi.fn().mockResolvedValue({ body: stream, ok: true });

    const { result } = renderHook(() => useStream());
    act(() => { result.current.startStream({ ideaTitle: 'Test' }, 'skeptic'); });

    await act(async () => { result.current.stop(); });
    expect(result.current.status).toBe('done');
  });

  it('sets error status when server returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, body: null });
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Test' }, 'skeptic');
    });
    expect(result.current.status).toBe('error');
  });

  it('resets thoughts and verdict on a new startStream call', async () => {
    mockFetch([
      'data: {"type":"thought","category":"concern","text":"Gap 1","quote":"q1"}',
      'data: {"type":"verdict","label":"Pass","score":40,"reason":"Too weak."}',
    ]);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Run 1' }, 'skeptic');
    });
    expect(result.current.thoughts).toHaveLength(1);

    mockFetch(['data: {"type":"nothing"}']);
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Run 2' }, 'buyer');
    });
    expect(result.current.thoughts).toHaveLength(0);
    expect(result.current.verdict).toBeNull();
  });
});
