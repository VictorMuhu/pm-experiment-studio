export default function Verdict({ verdict, stopped }) {
  if (stopped && !verdict) {
    return (
      <div style={{
        margin: '6px 0',
        padding: '14px 18px',
        border: '1px solid var(--rule)',
        borderRadius: 6,
        background: 'var(--paper-warm)',
        animation: 'v3fade 400ms ease both',
      }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--ink-mute)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
        }}>
          Stopped — run again for a full verdict.
        </p>
      </div>
    );
  }

  if (!verdict) return null;

  return (
    <div style={{
      margin: '6px 0',
      padding: '16px 18px',
      border: '1px solid var(--rule)',
      borderRadius: 6,
      background: 'var(--paper-warm)',
      animation: 'v3fade 400ms ease both',
    }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        color: 'var(--ink-mute)',
        marginBottom: 8,
      }}>
        Verdict · <span>{verdict.label}</span> · <span>{verdict.score}</span>
      </div>
      <div style={{
        fontFamily: 'var(--serif)',
        fontSize: '15px',
        lineHeight: 1.5,
        color: 'var(--ink)',
      }}>
        {verdict.reason}
      </div>
    </div>
  );
}
