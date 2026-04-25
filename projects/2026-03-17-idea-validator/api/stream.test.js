import { buildSystemPrompt, buildUserPrompt } from './stream.js';

describe('buildSystemPrompt', () => {
  it("includes skeptic persona", () => {
    const prompt = buildSystemPrompt('skeptic');
    expect(prompt).toMatch(/devil's advocate/i);
  });

  it('includes builder persona', () => {
    const prompt = buildSystemPrompt('builder');
    expect(prompt).toMatch(/staff engineer/i);
  });

  it('includes buyer persona', () => {
    const prompt = buildSystemPrompt('buyer');
    expect(prompt).toMatch(/economic buyer/i);
  });

  it('includes competitor persona', () => {
    const prompt = buildSystemPrompt('competitor');
    expect(prompt).toMatch(/closest substitute/i);
  });

  it('falls back to skeptic for unknown lens', () => {
    const prompt = buildSystemPrompt('unknown-lens');
    expect(prompt).toMatch(/devil's advocate/i);
  });

  it('includes NDJSON instruction', () => {
    const prompt = buildSystemPrompt('skeptic');
    expect(prompt).toMatch(/one JSON object per line/i);
  });
});

describe('buildUserPrompt', () => {
  it('includes the idea title', () => {
    const prompt = buildUserPrompt({ ideaTitle: 'My AI tool', ideaStage: 'seed', problem: '', target: '', valueProp: '', solution: '', differentiation: '', competitors: '', channels: '', successMetric: '', constraints: '' });
    expect(prompt).toContain('My AI tool');
  });

  it('truncates very long problem text', () => {
    const longText = 'x'.repeat(600);
    const prompt = buildUserPrompt({ ideaTitle: 'T', ideaStage: 'seed', problem: longText, target: '', valueProp: '', solution: '', differentiation: '', competitors: '', channels: '', successMetric: '', constraints: '' });
    expect(prompt.length).toBeLessThan(3000);
  });
});
