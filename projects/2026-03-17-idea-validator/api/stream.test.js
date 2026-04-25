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
  it('includes the idea text', () => {
    const prompt = buildUserPrompt('My AI tool for clinics');
    expect(prompt).toContain('My AI tool for clinics');
  });

  it('truncates very long idea text to 2000 chars', () => {
    const longText = 'x'.repeat(3000);
    const prompt = buildUserPrompt(longText);
    expect(prompt.length).toBeLessThan(2100);
  });
});
