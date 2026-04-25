import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from './App';

function mockStreamFetch(events) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      events.forEach(e => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n`)));
      controller.enqueue(encoder.encode('data: [DONE]\n'));
      controller.close();
    },
  });
  global.fetch = vi.fn().mockResolvedValue({ body: stream, ok: true });
}

describe('App', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders in empty state on load', () => {
    render(<App />);
    expect(screen.getByText(/What idea do you want/i)).toBeInTheDocument();
  });

  it('transitions to drafting when idea text is entered', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/your idea/i), { target: { value: 'My idea' } });
    expect(screen.getByRole('button', { name: /pressure-test/i })).not.toBeDisabled();
  });

  it('transitions to done after stream completes with verdict', async () => {
    mockStreamFetch([
      { type: 'thought', category: 'concern', text: 'Weak moat', quote: 'easier to use' },
      { type: 'verdict', label: 'Refine', score: 60, reason: 'Solid problem, weak moat.' },
    ]);
    render(<App />);
    fireEvent.change(screen.getByLabelText(/your idea/i), { target: { value: 'Test idea' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /pressure-test/i }));
    });
    expect(screen.getByText('Refine')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('switching lens from done state triggers a new stream', async () => {
    mockStreamFetch([
      { type: 'verdict', label: 'Pursue', score: 80, reason: 'Strong signals.' },
    ]);
    render(<App />);
    fireEvent.change(screen.getByLabelText(/your idea/i), { target: { value: 'Test idea' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /pressure-test/i }));
    });
    expect(screen.getByText('Pursue')).toBeInTheDocument();

    mockStreamFetch([
      { type: 'verdict', label: 'Pass', score: 35, reason: 'Too costly.' },
    ]);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /buyer/i }));
    });
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });
});
