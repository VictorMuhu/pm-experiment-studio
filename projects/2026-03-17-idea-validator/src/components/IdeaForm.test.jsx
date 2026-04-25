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

describe('IdeaForm — clear button', () => {
  it('clear button is absent in empty state (no content)', () => {
    render(<IdeaForm {...defaultProps} appState="empty" ideaText="" />);
    expect(screen.queryByLabelText(/clear idea/i)).not.toBeInTheDocument();
  });

  it('clear button is absent in drafting state when textarea is empty', () => {
    render(<IdeaForm {...defaultProps} appState="drafting" ideaText="" />);
    expect(screen.queryByLabelText(/clear idea/i)).not.toBeInTheDocument();
  });

  it('clear button is visible in drafting state when text exists', () => {
    render(<IdeaForm {...defaultProps} appState="drafting" ideaText="My idea." onClear={() => {}} />);
    expect(screen.getByLabelText(/clear idea/i)).toBeInTheDocument();
  });

  it('clear button is absent in done read state (only accessible via Edit)', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." onClear={() => {}} />);
    expect(screen.queryByLabelText(/clear idea/i)).not.toBeInTheDocument();
  });

  it('clear button is absent during streaming', () => {
    render(<IdeaForm {...defaultProps} appState="streaming" ideaText="My idea." onClear={() => {}} />);
    expect(screen.queryByLabelText(/clear idea/i)).not.toBeInTheDocument();
  });

  it('first click enters confirming state (shows sure? text)', () => {
    render(<IdeaForm {...defaultProps} appState="drafting" ideaText="My idea." onClear={() => {}} />);
    fireEvent.click(screen.getByLabelText(/clear idea/i));
    expect(screen.getByLabelText(/confirm clear/i)).toBeInTheDocument();
    expect(screen.getByText(/sure\?/i)).toBeInTheDocument();
  });

  it('second click calls onClear', () => {
    const onClear = vi.fn();
    render(<IdeaForm {...defaultProps} appState="drafting" ideaText="My idea." onClear={onClear} />);
    fireEvent.click(screen.getByLabelText(/clear idea/i));
    fireEvent.click(screen.getByLabelText(/confirm clear/i));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe('IdeaForm — edit / done buttons (post-run card)', () => {
  it('shows Edit button in done state', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('shows Edit button in error state', () => {
    render(<IdeaForm {...defaultProps} appState="error" ideaText="My idea." />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('does not show Edit button during streaming', () => {
    render(<IdeaForm {...defaultProps} appState="streaming" ideaText="My idea." />);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('clicking Edit shows textarea', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByLabelText(/your idea/i)).toBeInTheDocument();
  });

  it('edit mode shows Done button', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });

  it('clicking Done returns to read state (no textarea)', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(screen.queryByLabelText(/your idea/i)).not.toBeInTheDocument();
  });

  it('Clear in edit mode calls onChange with empty string', () => {
    const onChange = vi.fn();
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.click(screen.getByLabelText(/clear idea/i));
    fireEvent.click(screen.getByLabelText(/confirm clear/i));
    expect(onChange).toHaveBeenCalledWith('');
  });
});

describe('IdeaForm — coachmark', () => {
  it('shows coachmark when showCoachmark=true in done state', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." showCoachmark={true} onDismissCoachmark={() => {}} />);
    expect(screen.getByText(/click any sentence/i)).toBeInTheDocument();
  });

  it('does not show coachmark when showCoachmark=false', () => {
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." showCoachmark={false} onDismissCoachmark={() => {}} />);
    expect(screen.queryByText(/click any sentence/i)).not.toBeInTheDocument();
  });

  it('does not show coachmark in non-done states', () => {
    render(<IdeaForm {...defaultProps} appState="error" ideaText="My idea." showCoachmark={true} onDismissCoachmark={() => {}} />);
    expect(screen.queryByText(/click any sentence/i)).not.toBeInTheDocument();
  });

  it('clicking dismiss calls onDismissCoachmark', () => {
    const onDismissCoachmark = vi.fn();
    render(<IdeaForm {...defaultProps} appState="done" ideaText="My idea." showCoachmark={true} onDismissCoachmark={onDismissCoachmark} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismissCoachmark).toHaveBeenCalledOnce();
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
