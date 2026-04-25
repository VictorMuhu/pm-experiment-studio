export default function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64,
        border: '1px dashed var(--ink-faint)',
        borderRadius: 12,
        marginBottom: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-faint)',
        fontFamily: 'var(--serif)',
        fontSize: 28,
        fontStyle: 'italic',
      }}>
        ?
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-soft)', maxWidth: 280, lineHeight: 1.5 }}>
        Thoughts, questions, and concerns will appear here. Each one cites the sentence that triggered it.
      </div>
    </div>
  );
}
