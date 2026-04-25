function tagSentences(text) {
  if (!text) return [];
  const parts = [];
  const regex = /[^.!?]*[.!?]+(?:\s|$)|[^.!?]+$/g;
  let id = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const sentence = match[0].trim();
    if (sentence) parts.push({ id: `s${id++}`, text: sentence });
  }
  return parts;
}

function Field({ label, htmlFor, children }) {
  return (
    <div style={{ marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--rule)', paddingBottom: 'var(--sp-3)' }}>
      <label htmlFor={htmlFor} style={{ display: 'block', fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--ink-mute)', marginBottom: 'var(--sp-1)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 2px', border: 'none',
  borderBottom: '1px solid var(--rule)', background: 'transparent',
  color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: '15px',
  outline: 'none', borderRadius: 0,
};

const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '72px' };

function SentenceChips({ text, activeSentenceId, onSentenceClick }) {
  const sentences = tagSentences(text);
  if (sentences.length === 0) return null;
  return (
    <div style={{ marginTop: 'var(--sp-2)', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-1)' }}>
      {sentences.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSentenceClick(activeSentenceId === s.id ? null : s.id, s.text)}
          style={{
            fontFamily: 'var(--sans)', fontSize: '12px',
            padding: '3px 8px', border: '1px solid',
            borderColor: activeSentenceId === s.id ? 'var(--accent)' : 'var(--rule)',
            borderRadius: 'var(--radius)',
            background: activeSentenceId === s.id ? 'oklch(0.55 0.15 250 / 0.08)' : 'transparent',
            color: activeSentenceId === s.id ? 'var(--accent)' : 'var(--ink-mute)',
            cursor: 'pointer', maxWidth: '240px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {s.text}
        </button>
      ))}
    </div>
  );
}

export default function IdeaForm({ draft, onChange, onRun, onStop, appState, activeSentenceId, onSentenceClick }) {
  const isStreaming = appState === 'streaming';
  const isDone = appState === 'done';
  const isEmpty = appState === 'empty';
  const hasContent = draft.ideaTitle.trim().length > 0;

  function handleCTA() {
    if (isStreaming) onStop();
    else onRun();
  }

  return (
    <div style={{ padding: 'var(--sp-5)', overflowY: 'auto', height: '100%' }}>
      <Field label="Idea title" htmlFor="ideaTitle">
        <input id="ideaTitle" style={inputStyle} value={draft.ideaTitle} onChange={e => onChange('ideaTitle', e.target.value)} placeholder="e.g., Cancel-proof schedule suggestions for clinics" autoComplete="off" />
      </Field>

      <Field label="Company stage" htmlFor="ideaStage">
        <select id="ideaStage" style={inputStyle} value={draft.ideaStage} onChange={e => onChange('ideaStage', e.target.value)}>
          <option value="seed">Seed / pre-PMF</option>
          <option value="series-a">Series A / early growth</option>
          <option value="scale-up">Scale-up</option>
          <option value="enterprise">Enterprise product org</option>
        </select>
      </Field>

      <Field label="Problem (who, when, what breaks)" htmlFor="problem">
        <textarea id="problem" style={textareaStyle} value={isDone ? '' : draft.problem} onChange={e => onChange('problem', e.target.value)} placeholder="Describe the moment and consequence." rows={3} readOnly={isDone} />
        {isDone && <SentenceChips text={draft.problem} activeSentenceId={activeSentenceId} onSentenceClick={onSentenceClick} />}
      </Field>

      <Field label="Target user" htmlFor="target">
        <input id="target" style={inputStyle} value={draft.target} onChange={e => onChange('target', e.target.value)} placeholder="Role + context" autoComplete="off" />
      </Field>

      <Field label="Value proposition" htmlFor="valueProp">
        <textarea id="valueProp" style={textareaStyle} value={draft.valueProp} onChange={e => onChange('valueProp', e.target.value)} placeholder="What changes for the user?" rows={2} />
        {isDone && <SentenceChips text={draft.valueProp} activeSentenceId={activeSentenceId} onSentenceClick={onSentenceClick} />}
      </Field>

      <Field label="Solution sketch" htmlFor="solution">
        <textarea id="solution" style={textareaStyle} value={draft.solution} onChange={e => onChange('solution', e.target.value)} placeholder="What would the user experience?" rows={2} />
        {isDone && <SentenceChips text={draft.solution} activeSentenceId={activeSentenceId} onSentenceClick={onSentenceClick} />}
      </Field>

      <Field label="Differentiation" htmlFor="differentiation">
        <textarea id="differentiation" style={textareaStyle} value={draft.differentiation} onChange={e => onChange('differentiation', e.target.value)} placeholder="vs. the default option (status quo, spreadsheets, etc.)" rows={2} />
        {isDone && <SentenceChips text={draft.differentiation} activeSentenceId={activeSentenceId} onSentenceClick={onSentenceClick} />}
      </Field>

      <Field label="Known competitors / substitutes" htmlFor="competitors">
        <input id="competitors" style={inputStyle} value={draft.competitors} onChange={e => onChange('competitors', e.target.value)} placeholder="e.g., Notion, Excel, in-house scripts" autoComplete="off" />
      </Field>

      <Field label="Distribution channel" htmlFor="channels">
        <textarea id="channels" style={textareaStyle} value={draft.channels} onChange={e => onChange('channels', e.target.value)} placeholder="How does it reach users?" rows={2} />
      </Field>

      <Field label="Success metric (first measurable win)" htmlFor="successMetric">
        <input id="successMetric" style={inputStyle} value={draft.successMetric} onChange={e => onChange('successMetric', e.target.value)} placeholder="e.g., reduce no-show rate by 10% in 8 weeks" autoComplete="off" />
      </Field>

      <Field label="Constraints & risks (optional)" htmlFor="constraints">
        <textarea id="constraints" style={{ ...textareaStyle, borderBottom: 'none' }} value={draft.constraints} onChange={e => onChange('constraints', e.target.value)} placeholder="Regulatory, data, integration…" rows={2} />
      </Field>

      <div style={{ paddingTop: 'var(--sp-4)' }}>
        <button
          type="button"
          onClick={handleCTA}
          disabled={isEmpty || (!isStreaming && !hasContent)}
          style={{
            fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '10px 20px', border: '1px solid',
            borderColor: isStreaming ? 'var(--concern)' : 'var(--accent)',
            borderRadius: 'var(--radius)',
            background: isStreaming ? 'oklch(0.58 0.15 30 / 0.08)' : 'oklch(0.55 0.15 250 / 0.08)',
            color: isStreaming ? 'var(--concern)' : 'var(--accent)',
            cursor: (isEmpty || (!isStreaming && !hasContent)) ? 'not-allowed' : 'pointer',
            opacity: (isEmpty || (!isStreaming && !hasContent)) ? 0.4 : 1,
            transition: 'all var(--t)',
          }}
        >
          {isStreaming ? 'Stop' : 'Pressure-test'}
        </button>
      </div>
    </div>
  );
}
