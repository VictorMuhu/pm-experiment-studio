import EmptyState from './EmptyState';
import ThoughtItem from './ThoughtItem';
import Verdict from './Verdict';

function thoughtMatchesSentence(thought, activeSentenceText) {
  if (!activeSentenceText || !thought.quote) return false;
  const words = thought.quote.toLowerCase().split(' ').filter(w => w.length > 4);
  const sentence = activeSentenceText.toLowerCase();
  return words.some(word => sentence.includes(word));
}

export default function StreamPane({ thoughts, verdict, appState, activeSentenceId, activeSentenceText, stopped }) {
  if (appState === 'empty') return <EmptyState />;

  if (appState === 'nothing') {
    return (
      <div style={{ padding: 'var(--sp-6) var(--sp-5)' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--sp-3)', margin: '0 0 var(--sp-3)' }}>
          Specificity gap
        </p>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink-soft)', maxWidth: '40ch', margin: 0 }}>
          No concerns found — not because the idea is perfect, but because it isn't specific enough to critique. Sharpen the problem, target user, or differentiation and run again.
        </p>
      </div>
    );
  }

  const isFiltering = !!activeSentenceId;

  return (
    <div style={{ padding: 'var(--sp-5)', overflowY: 'auto', height: '100%' }}>
      {appState === 'streaming' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
          <span
            data-testid="streaming-dot"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              animation: 'v3pulse 1.4s ease-out infinite',
            }}
          />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Thinking…
          </span>
        </div>
      )}

      {thoughts.map((thought, i) => {
        const matches = isFiltering ? thoughtMatchesSentence(thought, activeSentenceText) : true;
        return (
          <div key={i} data-testid="thought-wrapper" style={{ opacity: !isFiltering || matches ? 1 : 0.2, transition: 'opacity 160ms ease' }}>
            <ThoughtItem thought={thought} dimmed={false} />
          </div>
        );
      })}

      {(appState === 'done' || appState === 'error') && (
        <Verdict verdict={verdict} stopped={stopped} />
      )}
    </div>
  );
}
