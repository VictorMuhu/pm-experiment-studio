import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThoughtItem from './ThoughtItem';

const concern = {
  type: 'thought',
  category: 'concern',
  text: 'Differentiation is not falsifiable.',
  quote: 'easier to use than existing tools',
};

const strength = {
  type: 'thought',
  category: 'strength',
  text: 'Problem has a specific trigger.',
  quote: 'users abandon checkout on mobile',
};

describe('ThoughtItem', () => {
  it('renders thought text', () => {
    render(<ThoughtItem thought={concern} dimmed={false} />);
    expect(screen.getByText(/differentiation is not falsifiable/i)).toBeInTheDocument();
  });

  it('renders the quote chip', () => {
    render(<ThoughtItem thought={concern} dimmed={false} />);
    expect(screen.getByText(/easier to use than existing tools/i)).toBeInTheDocument();
  });

  it('applies dimmed opacity when dimmed=true', () => {
    const { container } = render(<ThoughtItem thought={concern} dimmed={true} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle({ opacity: '0.2' });
  });

  it('uses concern border color for concern category', () => {
    const { container } = render(<ThoughtItem thought={concern} dimmed={false} />);
    expect(container.firstChild).toHaveStyle({ borderLeftColor: 'var(--concern)' });
  });

  it('uses strength border color for strength category', () => {
    const { container } = render(<ThoughtItem thought={strength} dimmed={false} />);
    expect(container.firstChild).toHaveStyle({ borderLeftColor: 'var(--strength)' });
  });
});
