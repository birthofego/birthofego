type Props = {
  title: string;
  status: string;
  children: React.ReactNode;
};

export function TerminalWindow({ title, status, children }: Props) {
  return (
    <div
      style={{
        background: 'var(--bg-alt)',
        border: '2px solid var(--ink)',
        borderRadius: '10px',
        padding: 0,
        fontFamily: 'var(--font-terminal), monospace',
        fontSize: '20px',
        boxShadow: '6px 6px 0 var(--ink)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'var(--ink)',
          color: 'var(--bg-alt)',
          fontFamily: 'var(--font-pixel), monospace',
          fontSize: '10px',
          letterSpacing: '2px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <span
            aria-hidden="true"
            style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#333', display: 'inline-block' }}
          />
          <span
            aria-hidden="true"
            style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#333', display: 'inline-block' }}
          />
          <span
            aria-hidden="true"
            style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }}
          />
        </div>
        <span>{title}</span>
        <span style={{ color: 'var(--red)' }}>{status}</span>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  );
}
