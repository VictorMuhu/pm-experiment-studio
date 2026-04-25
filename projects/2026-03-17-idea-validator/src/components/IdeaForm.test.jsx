import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IdeaForm from './IdeaForm';

const defaultProps = {
  ideaText: '',
  onChange: () => {},
  onReset: () => {},
  activeLens: 'skeptic',
  onLensChange: () => {},
  onRun: () => {},
  onStop: () => {},
  appState: 'empty',
  activeSentenceId: null,
  onSentenceClick: () => {},
  concernCount: 0,
  lenses: ['skeptic', 'builder', 'buyer'],
};

describe('IdeaForm — empty state', () => {
  it('renders the hero heading', () => {
    render(<IdeaForm {...defaultProps} />);
    expect(screen.getByText(/What idea do you want/i)).toBeInTheDocument();
  });

  it('renders the textarea with aria-label', () => {
    render(<IdeaForm {...defaultProps} />);
    expect(screen.getByLabelText(/your idea/i)).toBeInTheDocument();
  });

  it('renders example chips', () => {
    render(<IdeaForm {...defaultProps} />);
    expect(screen.getByText(/Slack bot for meeting decisions/i)).toBeInTheDocument();
  });

  it('CTA is disabled in empty state', () => {
    render(<IdeaForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /pressure-test/i })).toBeDisabled();
  });

  it('clicking an example chip calls onChange with that text', () => {
    const onChange = vi.fn();
    render(<IdeaForm {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText(/Slack bot for meeting decisions/i));
    expect(onChange).toHaveBeenCalledWith('Slack bot for meeting decisions');
  });

  it('renders lens buttons', () => {
    render(<IdeaForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /skeptic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /builder/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buyer/i })).toBeInTheDocument();
  });
});

describe('IdeaForm — drafting state', () => {
  it('shows drafting heading', () => {
    render(<IdeaForm {...defaultProps} appState="drafting" ideaText="My idea." />);
    expect(screen.getByText(/Draft the idea in plain language/i)).toBeInTheDocument();
  });

  it('CTA is enabled when ideaText is non-empty', () => {
    render(<IdeaForm {...defaultProps} appState="drafting" ideaText="My idea." />);
    expect(screen.getByRole('button', { name: /pressure-test/i })).not.toBeDisabled();
  });

  it('calls onRun when CTA clicked', () => {
    const onRun = vi.fn();
    render(<IdeaForm {...defaultProps} appState="drafting" ideaText="My idea." onRun={onRun} />);
    fireEvent.click(screen.getByRole('button', { name: /pressure-test/i }));
    expect(onRun).toHaveBeenCalled();
  });

  it('shows writing tip', () => {
    render(<IdeaForm {...defaultProps} appState="drafting" ideaText="My idea." />);
    expect(screen.getByText(/writing tip/i)).toBeInTheDocument();
  });

  it('calls onChange when textarea is edited', () => {
    const onChange = vi.fn();
    render(<IdeaForm {...defaultProps} appState="drafting" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/your idea/i), { target: { value: 'New text' } });
    expect(onChange).toHaveBeenCalledWith('New text');
  });
});

describe('IdeaForm — streaming state', () => {
  it('shows running heading', () => {
    render(<IdeaForm {...defaultProps} appState="streaming" ideaText="My idea." />);
    expect(screen.getByText(/Pressure-test · running/i)).toBeInTheDocument();
  });

  it('CTA button reads "Stop"', () => {
    render(<IdeaForm {...defaultProps} appState="streaming" ideaText="My idea." />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('calls onStop when Stop is clicked', () => {
    const onStop = vi.fn();
    render(<IdeaForm {...defaultProps} appState="streaming" ideaText="My idea." onStop={onStop} />);
    fireEvent.click(screen.getByRole('button', { name: /stop/i }));
    expect(onStop).toHaveBeenCalled();
  });
});

describe('IdeaForm — done state', () => {
  it('shows concern count heading', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." concernCount={2} />);
    expect(screen.getByText(/two concerns are load-bearing/i)).toBeInTheDocument();
  });

  it('CTA button reads "Re-run"', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." />);
    expect(screen.getByRole('button', { name: /re-run/i })).toBeInTheDocument();
  });

  it('shows next step tip', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." />);
    expect(screen.getByText(/next step/i)).toBeInTheDocument();
  });

  it('renders sentences as spans and calls onSentenceClick on click', () => {
    const onSentenceClick = vi.fn();
    render(<IdeaForm {...defaultProps} appState="done" ideaText="Users lose time. They get frustrated." onSentenceClick={onSentenceClick} />);
    const span = screen.getByText(/users lose time/i);
    fireEvent.click(span);
    expect(onSentenceClick).toHaveBeenCalledWith('s0', 'Users lose time.');
  });
});

describe('IdeaForm — error state', () => {
  it('shows error heading', () => {
    render(<IdeaForm {...defaultProps} appState="error" ideaText="My idea." />);
    expect(screen.getByText(/the critic got stuck/i)).toBeInTheDocument();
  });

  it('CTA button reads "Try again"', () => {
    render(<IdeaForm {...defaultProps} appState="error" ideaText="My idea." />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});

describe('IdeaForm — nothing state', () => {
  it('shows nothing heading', () => {
    render(<IdeaForm {...defaultProps} appState="nothing" ideaText="My idea." />);
    expect(screen.getByText(/can't find a concern/i)).toBeInTheDocument();
  });

  it('shows why this happens note', () => {
    render(<IdeaForm {...defaultProps} appState="nothing" ideaText="My idea." />);
    expect(screen.getByText(/why this happens/i)).toBeInTheDocument();
  });
});
