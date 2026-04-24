import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Verdict from './Verdict';

const verdict = { label: 'Refine', score: 64, reason: 'Strong problem. Weak moat.' };

describe('Verdict', () => {
  it('renders the verdict label', () => {
    render(<Verdict verdict={verdict} stopped={false} />);
    expect(screen.getByText('Refine')).toBeInTheDocument();
  });

  it('renders the score', () => {
    render(<Verdict verdict={verdict} stopped={false} />);
    expect(screen.getByText('64')).toBeInTheDocument();
  });

  it('renders the reason', () => {
    render(<Verdict verdict={verdict} stopped={false} />);
    expect(screen.getByText(/strong problem/i)).toBeInTheDocument();
  });

  it('renders stopped notice when stopped=true and no verdict', () => {
    render(<Verdict verdict={null} stopped={true} />);
    expect(screen.getByText(/stopped/i)).toBeInTheDocument();
  });
});
