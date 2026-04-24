export default function Verdict({ verdict, stopped }) {
  if (stopped && !verdict) {
    return (
      <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Stopped — run again for a full verdict.
        </p>
      </div>
    );
  }

  if (!verdict) return null;

  return (
    <div style={{
      borderTop: '2px solid var(--accent)',
      paddingTop: 'var(--sp-4)',
      marginTop: 'var(--sp-4)',
      animation: 'v3fade 400ms ease both',
    }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 var(--sp-2)' }}>
        Verdict
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-4)', marginBottom: 'var(--sp-3)' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '54px', lineHeight: 1, color: 'var(--ink)' }}>
          {verdict.score}
        </span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '28px', lineHeight: 1.2, color: 'var(--ink)' }}>
          {verdict.label}
        </span>
      </div>
      <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
        {verdict.reason}
      </p>
    </div>
  );
}
