export default function ThoughtItem({ thought, dimmed }) {
  const borderColor =
    thought.category === 'concern'  ? 'var(--concern)'  :
    thought.category === 'strength' ? 'var(--strength)' :
    'var(--rule)';

  return (
    <div
      style={{
        borderLeft: `3px solid ${borderColor}`,
        paddingLeft: 'var(--sp-3)',
        marginBottom: 'var(--sp-4)',
        opacity: dimmed ? 0.2 : 1,
        animation: 'v3fade 400ms ease both',
        transition: 'opacity var(--t)',
      }}
    >
      <p style={{
        fontFamily: 'var(--serif)',
        fontSize: '17px',
        lineHeight: 1.55,
        color: 'var(--ink)',
        margin: '0 0 var(--sp-1)',
      }}>
        {thought.text}
      </p>
      {thought.quote && (
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--ink-mute)',
          fontStyle: 'italic',
          display: 'block',
        }}>
          "{thought.quote}"
        </span>
      )}
    </div>
  );
}
