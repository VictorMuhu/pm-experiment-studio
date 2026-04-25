import { render, screen } from '@testing-library/react';
import StreamPane from './StreamPane';

const thoughts = [
  { type: 'thought', category: 'concern', text: 'Weak moat', quote: 'easier to use' },
  { type: 'thought', category: 'strength', text: 'Clear problem', quote: 'users abandon checkout' },
];
const verdict = { label: 'Refine', score: 60, reason: 'Good problem, weak moat.' };

it('shows EmptyState when appState is empty', () => {
  render(<StreamPane thoughts={[]} verdict={null} appState="empty" activeSentenceId={null} activeSentenceText={null} stopped={false} />);
  expect(screen.getByText(/pick a lens/i)).toBeInTheDocument();
});

it('renders all thoughts', () => {
  render(<StreamPane thoughts={thoughts} verdict={null} appState="streaming" activeSentenceId={null} activeSentenceText={null} stopped={false} />);
  expect(screen.getByText('Weak moat')).toBeInTheDocument();
  expect(screen.getByText('Clear problem')).toBeInTheDocument();
});

it('shows pulsing indicator during streaming', () => {
  const { container } = render(<StreamPane thoughts={[]} verdict={null} appState="streaming" activeSentenceId={null} activeSentenceText={null} stopped={false} />);
  expect(container.querySelector('[data-testid="streaming-dot"]')).toBeInTheDocument();
});

it('does not show pulsing indicator when done', () => {
  const { container } = render(<StreamPane thoughts={thoughts} verdict={verdict} appState="done" activeSentenceId={null} activeSentenceText={null} stopped={false} />);
  expect(container.querySelector('[data-testid="streaming-dot"]')).not.toBeInTheDocument();
});

it('renders Verdict in done state', () => {
  render(<StreamPane thoughts={thoughts} verdict={verdict} appState="done" activeSentenceId={null} activeSentenceText={null} stopped={false} />);
  expect(screen.getByText('Refine')).toBeInTheDocument();
  expect(screen.getByText('60')).toBeInTheDocument();
});

it('dims thoughts that do not match activeSentenceText', () => {
  const thoughtsWithQuotes = [
    { type: 'thought', category: 'concern', text: 'Thought A', quote: 'abandon checkout' },
    { type: 'thought', category: 'strength', text: 'Thought B', quote: 'unrelated words here' },
  ];
  render(
    <StreamPane
      thoughts={thoughtsWithQuotes}
      verdict={null}
      appState="done"
      activeSentenceId="s0"
      activeSentenceText="users abandon checkout on mobile"
      stopped={false}
    />
  );
  const wrapperA = screen.getByText('Thought A').closest('[data-testid="thought-wrapper"]');
  const wrapperB = screen.getByText('Thought B').closest('[data-testid="thought-wrapper"]');
  expect(wrapperA).toHaveStyle({ opacity: '1' });
  expect(wrapperB).toHaveStyle({ opacity: '0.2' });
});

it('shows specificity gap message in nothing state', () => {
  render(<StreamPane thoughts={[]} verdict={null} appState="nothing" activeSentenceId={null} activeSentenceText={null} stopped={false} />);
  expect(screen.getByText(/specificity gap/i)).toBeInTheDocument();
});
