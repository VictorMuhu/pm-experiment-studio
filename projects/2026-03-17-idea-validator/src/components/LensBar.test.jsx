import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LensBar from './LensBar';

const LENSES = ['skeptic', 'builder', 'buyer', 'competitor'];

describe('LensBar', () => {
  it('renders all four lens labels', () => {
    render(<LensBar lenses={LENSES} activeLens="skeptic" onChange={() => {}} appState="drafting" />);
    expect(screen.getByText(/skeptic/i)).toBeInTheDocument();
    expect(screen.getByText(/builder/i)).toBeInTheDocument();
    expect(screen.getByText(/buyer/i)).toBeInTheDocument();
    expect(screen.getByText(/competitor/i)).toBeInTheDocument();
  });

  it('marks the active lens with aria-pressed true', () => {
    render(<LensBar lenses={LENSES} activeLens="buyer" onChange={() => {}} appState="done" />);
    expect(screen.getByText(/buyer/i).closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/skeptic/i).closest('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the clicked lens', () => {
    const onChange = vi.fn();
    render(<LensBar lenses={LENSES} activeLens="skeptic" onChange={onChange} appState="done" />);
    fireEvent.click(screen.getByText(/builder/i));
    expect(onChange).toHaveBeenCalledWith('builder');
  });

  it('disables all buttons while streaming', () => {
    render(<LensBar lenses={LENSES} activeLens="skeptic" onChange={() => {}} appState="streaming" />);
    LENSES.forEach(lens => {
      expect(screen.getByText(new RegExp(lens, 'i')).closest('button')).toBeDisabled();
    });
  });
});
