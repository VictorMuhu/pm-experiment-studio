import EmptyState from './EmptyState';
import ThoughtItem from './ThoughtItem';
import Verdict from './Verdict';

function thoughtMatchesSentence(thought, activeSentenceText) {
  if (!activeSentenceText || !thought.quote) return false;
  const words = thought.quote.toLowerCase().split(' ').filter(w => w.length > 4);
  const sentence = activeSentenceText.toLowerCase();
  return words.some(word => sentence.includes(word));
}

function getStatusInfo(appState, thoughtCount, stopped) {
  switch (appState) {
    case 'streaming': return [null, `Streaming · ${thoughtCount}`];
    case 'done':      return ['oklch(0.65 0.12 145)', stopped ? 'Stopped' : `Done · ${thoughtCount}`];
    case 'error':     return ['oklch(0.62 0.17 30)', 'Interrupted'];
    case 'nothing':   return ['oklch(0.72 0.08 75)', 'Done · 0 concerns'];
    case 'drafting':  return ['var(--ink-faint)', 'Waiting'];
    default:          return ['var(--ink-faint)', 'Idle'];
  }
}

function PanelHeader({ appState, thoughtCount, stopped, activeLens }) {
  const [dotColor, statusText] = getStatusInfo(appState, thoughtCount, stopped);
  const isStreaming = appState === 'streaming';
  const lensLabel = activeLens ? ` · ${activeLens}` : '';

  return (
    <div style={{
      padding: '14px 24px',
      borderBottom: '1px solid var(--rule)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <h3 style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 500, margin: 0 }}>
        Thinking out loud{lensLabel}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {isStreaming ? (
          <span
            data-testid="streaming-dot"
            style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              animation: 'v3pulse 1.4s ease-out infinite',
            }}
          />
        ) : (
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        )}
        {statusText}
      </div>
    </div>
  );
}

export default function StreamPane({ thoughts, verdict, appState, activeSentenceId, activeSentenceText, onClearFocus, stopped, activeLens }) {
  const isFiltering = !!activeSentenceId;
  const concernCount = thoughts.filter(t => t.category === 'concern').length;

  const showEmpty = appState === 'empty';
  const showDrafting = appState === 'drafting';
  const showStream = !showEmpty && !showDrafting;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)', minHeight: 0 }}>
      {/* Focus bar (shown when a sentence is active) */}
      {isFiltering && activeSentenceText && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 24px',
          background: 'oklch(0.95 0.03 260)',
          borderBottom: '1px solid oklch(0.88 0.05 260)',
          fontSize: 12,
          color: 'var(--ink)',
          flexShrink: 0,
        }}>
          <span style={{
            background: 'var(--accent)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 10,
            fontSize: 11,
            fontFamily: 'var(--mono)',
          }}>
            Focus
          </span>
          <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            "{activeSentenceText.length > 70 ? activeSentenceText.slice(0, 70) + '…' : activeSentenceText}"
          </span>
          <button
            onClick={onClearFocus}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--ink-soft)' }}
          >
            Clear ✕
          </button>
        </div>
      )}

      <PanelHeader appState={appState} thoughtCount={thoughts.length} stopped={stopped} activeLens={activeLens} />

      {/* Empty state body */}
      {showEmpty && <EmptyState />}

      {/* Drafting state: waiting message */}
      {showDrafting && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-mute)', maxWidth: 260, lineHeight: 1.55, textAlign: 'center', margin: 0 }}>
            Press <strong style={{ fontStyle: 'normal', color: 'var(--ink)' }}>Pressure-test</strong> when you're ready.
          </p>
        </div>
      )}

      {/* Stream body: streaming / done / error / nothing */}
      {showStream && (
        <div style={{ padding: '16px 24px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Thoughts */}
          {thoughts.map((thought, i) => {
            const matches = isFiltering ? thoughtMatchesSentence(thought, activeSentenceText) : true;
            return (
              <div key={i} data-testid="thought-wrapper" style={{ opacity: !isFiltering || matches ? 1 : 0.2, transition: 'opacity 160ms ease' }}>
                <ThoughtItem thought={thought} dimmed={false} />
              </div>
            );
          })}

          {/* Streaming: blinking cursor */}
          {appState === 'streaming' && (
            <div style={{ paddingLeft: 'var(--sp-3)' }}>
              <span style={{
                display: 'inline-block',
                width: 6,
                height: 14,
                background: 'var(--ink)',
                verticalAlign: 'text-bottom',
                animation: 'v3pulse 0.8s infinite',
              }} />
            </div>
          )}

          {/* Nothing card */}
          {appState === 'nothing' && (
            <div style={{
              padding: 18,
              border: '1px solid var(--rule)',
              background: 'var(--paper-warm)',
              borderRadius: 6,
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--ink-mute)', marginBottom: 6 }}>
                Specificity gap
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink)' }}>
                Zero concerns usually means the idea is under-specified, not bulletproof. Tighten it until it commits to something falsifiable, then re-run.
              </div>
              <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ink-mute)', lineHeight: 1.5, fontStyle: 'italic' }}>
                Common specificity gaps: who exactly, when, and at what cost of being wrong.
              </div>
            </div>
          )}

          {/* Error card */}
          {appState === 'error' && (
            <div style={{
              padding: '16px 18px',
              border: '1px solid oklch(0.85 0.09 30)',
              background: 'oklch(0.98 0.03 30)',
              borderRadius: 6,
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'oklch(0.55 0.16 30)', marginBottom: 4 }}>
                Stream interrupted
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, marginBottom: 6, fontWeight: 500 }}>
                The critic lost its train of thought.
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
                A network issue cut the stream short. The thoughts above are saved. Click "Try again" to start a new run.
              </div>
            </div>
          )}

          {/* Verdict (done state or stopped) */}
          {(appState === 'done' || (stopped && !verdict)) && (
            <Verdict verdict={verdict} stopped={stopped} />
          )}
        </div>
      )}
    </div>
  );
}
