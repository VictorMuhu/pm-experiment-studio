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

const leftStyle = {
  padding: '28px 32px',
  borderRight: '1px solid var(--rule)',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  overflowY: 'auto',
  height: '100%',
};

const monoLabelStyle = {
  display: 'block',
  fontFamily: 'var(--mono)',
  fontSize: 11,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: 'var(--ink-mute)',
  marginBottom: 8,
};

const h2Style = {
  fontFamily: 'var(--serif)',
  fontSize: 28,
  fontWeight: 400,
  letterSpacing: '-0.01em',
  lineHeight: 1.15,
  margin: 0,
};

const cardBase = {
  background: 'var(--paper-warm)',
  borderRadius: 6,
  padding: 18,
  position: 'relative',
};

const taStyle = {
  width: '100%',
  minHeight: 140,
  background: 'transparent',
  border: 'none',
  resize: 'none',
  fontFamily: 'var(--serif)',
  fontSize: 15,
  lineHeight: 1.6,
  color: 'var(--ink)',
  outline: 'none',
};

const runBtnBase = {
  border: 'none',
  padding: '9px 18px',
  borderRadius: 5,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'var(--sans)',
};

const tipBoxStyle = {
  padding: '12px 14px',
  background: 'var(--paper-warm)',
  border: '1px solid var(--rule)',
  borderRadius: 6,
  fontSize: 12.5,
  color: 'var(--ink-soft)',
  lineHeight: 1.5,
};

const EXAMPLES = [
  'Slack bot for meeting decisions',
  'AI-powered daily standup summary',
  'Paywall analytics for indie SaaS',
  'Replace Notion with voice notes',
];

function numToWord(n) {
  return ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'][n] ?? String(n);
}

function LensPills({ lenses, activeLens, onLensChange, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {lenses.map(lens => (
        <button
          key={lens}
          type="button"
          aria-pressed={activeLens === lens ? 'true' : 'false'}
          disabled={disabled}
          onClick={() => !disabled && onLensChange(lens)}
          style={{
            border: `1px solid ${activeLens === lens ? 'var(--ink)' : 'var(--rule)'}`,
            background: activeLens === lens ? 'var(--ink)' : 'var(--paper)',
            color: activeLens === lens ? 'var(--paper)' : 'var(--ink-soft)',
            padding: '6px 10px',
            borderRadius: 14,
            fontSize: 11,
            fontFamily: 'var(--sans)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        >
          {lens.charAt(0).toUpperCase() + lens.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default function IdeaForm({
  ideaText, onChange, onReset,
  activeLens, onLensChange, onRun, onStop,
  appState, activeSentenceId, onSentenceClick,
  concernCount, lenses,
}) {
  const isStreaming = appState === 'streaming';
  const isDone = appState === 'done';
  const isError = appState === 'error';
  const isNothing = appState === 'nothing';
  const isEmpty = appState === 'empty';
  const isDrafting = appState === 'drafting';

  const sentences = tagSentences(ideaText);
  const wordCount = ideaText.trim() ? ideaText.trim().split(/\s+/).length : 0;

  const doneHeading =
    concernCount === 0 ? 'No load-bearing concerns.' :
    concernCount === 1 ? 'One concern is load-bearing.' :
    `${numToWord(concernCount)} concerns are load-bearing.`;

  // ── Empty + Drafting: textarea input view ───────────────────
  if (isEmpty || isDrafting) {
    const isBorderAccent = isDrafting;
    return (
      <div style={leftStyle}>
        {isEmpty && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
            <span style={monoLabelStyle}>New session</span>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.08, margin: 0 }}>
              What idea do you want to{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>pressure-test</em>?
            </h1>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0 }}>
              Paste it in plain language. A critic will read it sentence by sentence, think out loud, and cite the exact lines that worry it.
            </p>
          </div>
        )}

        {isDrafting && (
          <>
            <h2 style={h2Style}>Draft the idea in plain language.</h2>
            <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', fontFamily: 'var(--sans)' }}>
              {sentences.length} sentence{sentences.length !== 1 ? 's' : ''} · {wordCount} word{wordCount !== 1 ? 's' : ''}
              {' '}·{' '}
              <span style={{ color: 'var(--accent)' }}>ready to test</span>
            </div>
          </>
        )}

        <div style={{
          ...cardBase,
          border: `1px ${isEmpty ? 'dashed' : 'solid'} ${isBorderAccent ? 'var(--accent)' : 'var(--ink-faint)'}`,
          background: isEmpty ? 'transparent' : 'var(--paper-warm)',
        }}>
          <span style={monoLabelStyle}>
            {isDrafting ? `Your idea · ${sentences.length} sentences` : 'Your idea'}
          </span>
          <textarea
            aria-label="Your idea"
            style={{
              ...taStyle,
              fontStyle: isEmpty && !ideaText ? 'italic' : 'normal',
              color: isEmpty && !ideaText ? 'var(--ink-mute)' : 'var(--ink)',
            }}
            placeholder="A Slack bot that turns meeting transcripts into…"
            value={ideaText}
            onChange={e => onChange(e.target.value)}
          />
        </div>

        {isEmpty && (
          <div>
            <span style={monoLabelStyle}>Or start from an example</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EXAMPLES.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => onChange(e)}
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--rule)',
                    padding: '6px 11px',
                    borderRadius: 20,
                    fontSize: 12,
                    color: 'var(--ink-soft)',
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)',
                    transition: 'all 0.15s',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
          <LensPills lenses={lenses} activeLens={activeLens} onLensChange={onLensChange} disabled={false} />
          <button
            type="button"
            disabled={isEmpty || !ideaText.trim()}
            onClick={onRun}
            style={{
              ...runBtnBase,
              background: 'var(--accent)',
              color: 'white',
              opacity: isEmpty || !ideaText.trim() ? 0.4 : 1,
              cursor: isEmpty || !ideaText.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            Pressure-test ⌘↵
          </button>
        </div>

        {isDrafting && (
          <div style={tipBoxStyle}>
            <span style={monoLabelStyle}>Writing tip</span>
            Shorter idea = sharper critique. Aim for 2–5 sentences that a colleague could repeat back.
          </div>
        )}
      </div>
    );
  }

  // ── Post-run states: streaming / done / error / nothing ─────
  function getCTALabel() {
    if (isStreaming) return 'Stop ⎋';
    if (isError) return 'Try again ⌘↵';
    if (isNothing) return 'Turn up the pressure ↑';
    return 'Re-run ⌘↵';
  }

  function handleCTA() {
    if (isStreaming) onStop();
    else onRun();
  }

  return (
    <div style={leftStyle}>
      <h2 style={h2Style}>
        {isStreaming && 'Pressure-test · running.'}
        {isDone && doneHeading}
        {isError && 'The critic got stuck.'}
        {isNothing && <>The critic <em style={{ fontStyle: 'italic' }}>can't find a concern</em>.</>}
      </h2>

      <div style={{ ...cardBase, border: '1px solid var(--rule)' }}>
        <span style={monoLabelStyle}>Your idea · {sentences.length} sentences</span>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.7 }}>
          {sentences.map((s, i) => {
            const isActive = activeSentenceId === s.id;
            const canClick = isDone || isNothing;
            return (
              <span
                key={s.id}
                onClick={() => canClick && onSentenceClick(
                  isActive ? null : s.id,
                  isActive ? null : s.text,
                )}
                style={{
                  borderBottom: `1.5px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  background: isActive ? 'oklch(0.92 0.06 260)' : 'transparent',
                  padding: '1px 2px',
                  borderRadius: 2,
                  cursor: canClick ? 'pointer' : 'default',
                  transition: 'background 0.2s, border-color 0.2s',
                  display: 'inline',
                }}
              >
                {s.text}{i < sentences.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
        {!isStreaming && onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'transparent',
              border: '1px solid var(--rule)',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--ink-mute)',
              cursor: 'pointer',
              padding: '2px 8px',
              borderRadius: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Edit
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
        <LensPills lenses={lenses} activeLens={activeLens} onLensChange={onLensChange} disabled={isStreaming} />
        <button
          type="button"
          onClick={handleCTA}
          style={{
            ...runBtnBase,
            background: isStreaming ? 'oklch(0.5 0.01 250)' : 'var(--accent)',
            color: 'white',
          }}
        >
          {getCTALabel()}
        </button>
      </div>

      {isDone && (
        <div style={tipBoxStyle}>
          <span style={monoLabelStyle}>Next step</span>
          Edit any sentence to see how the critique shifts. Or switch lens to get the builder or buyer view.
        </div>
      )}

      {isNothing && (
        <div style={{
          ...tipBoxStyle,
          background: 'oklch(0.97 0.03 75)',
          border: '1px solid oklch(0.88 0.06 75)',
          color: 'var(--ink)',
        }}>
          <span style={{ ...monoLabelStyle, color: 'oklch(0.5 0.13 75)' }}>Why this happens</span>
          A clean critique isn't a compliment — it means the idea is written vaguely enough to be unfalsifiable. Add specifics (who, when, how) to make the critic bite.
        </div>
      )}
    </div>
  );
}
