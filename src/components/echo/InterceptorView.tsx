'use client';

interface InterceptorViewProps {
  rawMessages: { ciphertext: string; iv: string; sender: string }[];
}

export default function InterceptorView({ rawMessages }: InterceptorViewProps) {
  return (
    <div className="echo-interceptor">
      <div className="echo-interceptor-header">
        <span className="echo-interceptor-icon">MITM</span>
        <span className="echo-interceptor-title">INTERCEPTOR VIEW</span>
      </div>
      <div className="echo-interceptor-desc">
        What an eavesdropper sees. No keys. No plaintext. Just noise.
      </div>

      <div className="echo-interceptor-feed">
        {rawMessages.length === 0 && (
          <div className="echo-interceptor-empty">
            No intercepted traffic yet.
          </div>
        )}
        {rawMessages.map((msg, i) => (
          <div key={i} className="echo-interceptor-packet">
            <div className="echo-interceptor-packet-head">
              <span className="echo-interceptor-sender">{msg.sender}</span>
              <span className="echo-interceptor-label">ENCRYPTED</span>
            </div>
            <div className="echo-interceptor-field">
              <span className="echo-interceptor-field-label">IV</span>
              <span className="echo-interceptor-field-value">{msg.iv}</span>
            </div>
            <div className="echo-interceptor-field">
              <span className="echo-interceptor-field-label">PAYLOAD</span>
              <span className="echo-interceptor-field-value">{msg.ciphertext}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
