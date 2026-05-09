export function AsciiDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        fontFamily: 'var(--font-terminal), monospace',
        fontSize: '16px',
        color: 'var(--muted)',
        letterSpacing: '1px',
        textAlign: 'center',
        margin: '32px 0',
        userSelect: 'none',
      }}
    >
      &mdash;&mdash;&mdash;{' '}
      <span style={{ color: 'var(--red)' }}>&lsaquo;/&rsaquo;</span>
      {' '}&mdash;&mdash;&mdash;
    </div>
  );
}
