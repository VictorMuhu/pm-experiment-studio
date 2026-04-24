export default function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 'var(--sp-6)',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--serif)',
        fontSize: '18px',
        color: 'var(--ink-mute)',
        maxWidth: '36ch',
        lineHeight: 1.5,
        margin: 0,
      }}>
        Pick a lens and describe your idea. Run a check to see what's driving the result.
      </p>
    </div>
  );
}
