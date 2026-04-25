import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useClearConfirm } from './useClearConfirm';

describe('useClearConfirm', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('starts in non-confirming state', () => {
    const { result } = renderHook(() => useClearConfirm(() => {}));
    expect(result.current.confirming).toBe(false);
  });

  it('first call to handle sets confirming to true', () => {
    const { result } = renderHook(() => useClearConfirm(() => {}));
    act(() => { result.current.handle(); });
    expect(result.current.confirming).toBe(true);
  });

  it('second call within window invokes onClear and resets confirming', () => {
    const onClear = vi.fn();
    const { result } = renderHook(() => useClearConfirm(onClear));
    act(() => { result.current.handle(); });
    act(() => { result.current.handle(); });
    expect(onClear).toHaveBeenCalledOnce();
    expect(result.current.confirming).toBe(false);
  });

  it('auto-resets after 2400ms without calling onClear', () => {
    const onClear = vi.fn();
    const { result } = renderHook(() => useClearConfirm(onClear));
    act(() => { result.current.handle(); });
    expect(result.current.confirming).toBe(true);
    act(() => { vi.advanceTimersByTime(2400); });
    expect(result.current.confirming).toBe(false);
    expect(onClear).not.toHaveBeenCalled();
  });

  it('cleans up the timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { result, unmount } = renderHook(() => useClearConfirm(() => {}));
    act(() => { result.current.handle(); });
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
