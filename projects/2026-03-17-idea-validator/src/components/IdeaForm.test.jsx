// src/components/IdeaForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IdeaForm from './IdeaForm';

const emptyDraft = {
  ideaTitle: '', ideaStage: 'seed', problem: '', target: '',
  valueProp: '', solution: '', differentiation: '', competitors: '',
  channels: '', successMetric: '', constraints: '',
};

describe('IdeaForm', () => {
  it('renders the idea title field', () => {
    render(<IdeaForm draft={emptyDraft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="empty" activeSentenceId={null} onSentenceClick={() => {}} />);
    expect(screen.getByLabelText(/idea title/i)).toBeInTheDocument();
  });

  it('CTA button reads "Pressure-test" in drafting state', () => {
    render(<IdeaForm draft={emptyDraft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="drafting" activeSentenceId={null} onSentenceClick={() => {}} />);
    expect(screen.getByRole('button', { name: /pressure-test/i })).toBeInTheDocument();
  });

  it('CTA button reads "Stop" in streaming state', () => {
    render(<IdeaForm draft={emptyDraft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="streaming" activeSentenceId={null} onSentenceClick={() => {}} />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('CTA button is disabled in empty state', () => {
    render(<IdeaForm draft={emptyDraft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="empty" activeSentenceId={null} onSentenceClick={() => {}} />);
    expect(screen.getByRole('button', { name: /pressure-test/i })).toBeDisabled();
  });

  it('calls onRun when Pressure-test is clicked', () => {
    const onRun = vi.fn();
    const draftWithTitle = { ...emptyDraft, ideaTitle: 'My idea' };
    render(<IdeaForm draft={draftWithTitle} onChange={() => {}} onRun={onRun} onStop={() => {}} appState="drafting" activeSentenceId={null} onSentenceClick={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /pressure-test/i }));
    expect(onRun).toHaveBeenCalled();
  });

  it('calls onChange when a field is edited', () => {
    const onChange = vi.fn();
    render(<IdeaForm draft={emptyDraft} onChange={onChange} onRun={() => {}} onStop={() => {}} appState="empty" activeSentenceId={null} onSentenceClick={() => {}} />);
    fireEvent.change(screen.getByLabelText(/idea title/i), { target: { value: 'A new idea' } });
    expect(onChange).toHaveBeenCalledWith('ideaTitle', 'A new idea');
  });

  it('shows sentence chips in done state', () => {
    const draft = { ...emptyDraft, problem: 'Users lose time. They get frustrated.' };
    render(<IdeaForm draft={draft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="done" activeSentenceId={null} onSentenceClick={() => {}} />);
    expect(screen.getByText(/users lose time/i)).toBeInTheDocument();
  });
});
