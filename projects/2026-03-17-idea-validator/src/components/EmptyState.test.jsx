import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

it('renders the idle illustration placeholder', () => {
  render(<EmptyState />);
  expect(screen.getByText('?')).toBeInTheDocument();
});

it('renders the invitation copy', () => {
  render(<EmptyState />);
  expect(screen.getByText(/thoughts, questions, and concerns/i)).toBeInTheDocument();
});
