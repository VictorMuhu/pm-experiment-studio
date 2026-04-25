export default function ThoughtItem({ thought, dimmed, sentenceIndex }) {
  const isConcern = thought.category === 'concern';
  const isStrength = thought.category === 'strength';
  const borderColor = isConcern ? 'var(--concern)' : isStrength ? 'var(--strength)' : 'var(--rule)';

  return (
    <div
      style={{
        borderLeft: `3px solid ${borderColor}`,
        paddingLeft: 'var(--sp-3)',
        marginBottom: 'var(--sp-4)',
        opacity: dimmed ? 0.2 : 1,
        animation: 'v3fade 400ms ease both',
        transition: 'opacity var(--t)',
        ...(isConcern ? {
          padding: '10px 14px 10px 14px',
          borderLeft: `3px solid ${borderColor}`,
          background: 'oklch(0.97 0.02 30)',
          borderRadius: '0 6px 6px 0',
        } : {}),
      }}
    >
      <p style={{
        fontFamily: 'var(--serif)',
        fontSize: '15px',
        lineHeight: 1.55,
        color: 'var(--ink)',
        margin: '0 0 var(--sp-1)',
      }}>
        {thought.text}
      </p>
      {thought.quote && (
        <span
          {...(sentenceIndex !== null && sentenceIndex !== undefined ? { 'data-ref': sentenceIndex } : {})}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: borderColor === 'var(--rule)' ? 'var(--ink-mute)' : borderColor,
            fontStyle: 'italic',
            display: 'block',
            background: isConcern ? 'oklch(0.93 0.04 30)' : isStrength ? 'oklch(0.93 0.04 145)' : 'transparent',
            padding: isConcern || isStrength ? '1px 5px' : 0,
            borderRadius: 3,
            width: 'fit-content',
          }}
        >
          "{thought.quote}"
        </span>
      )}
    </div>
  );
}
