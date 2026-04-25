export default function LensBar({ lenses = ['skeptic', 'builder', 'buyer', 'competitor'], activeLens, onChange, appState }) {
  const disabled = appState === 'streaming';

  return (
    <nav aria-label="Critic lens" style={{
      display: 'flex',
      gap: 'var(--sp-2)',
      padding: 'var(--sp-3) var(--sp-5)',
      borderBottom: '1px solid var(--rule)',
      background: 'var(--paper)',
    }}>
      {lenses.map(lens => (
        <button
          key={lens}
          type="button"
          aria-pressed={activeLens === lens ? 'true' : 'false'}
          disabled={disabled}
          onClick={() => onChange(lens)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            border: '1px solid',
            borderColor: activeLens === lens ? 'var(--accent)' : 'var(--rule)',
            borderRadius: 'var(--radius)',
            background: activeLens === lens ? 'oklch(0.55 0.15 250 / 0.08)' : 'transparent',
            color: activeLens === lens ? 'var(--accent)' : 'var(--ink-mute)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'border-color var(--t), color var(--t), background var(--t)',
          }}
        >
          {lens}
        </button>
      ))}
    </nav>
  );
}
