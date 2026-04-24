import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

it('renders invitation copy', () => {
  render(<EmptyState />);
  expect(screen.getByText(/pick a lens/i)).toBeInTheDocument();
});
