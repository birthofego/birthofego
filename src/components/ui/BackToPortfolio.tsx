'use client';

export default function BackToPortfolio() {
  return (
    <>
      <a href="/" className="back-to-portfolio">
        &larr; BACK TO PORTFOLIO
      </a>
      <style>{`
        .back-to-portfolio {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 9999;
          font-family: 'JetBrains Mono', 'SF Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #6a6a6a;
          text-decoration: none;
          padding: 8px 14px;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .back-to-portfolio:hover {
          color: #e8e8e8;
          border-color: #4a4a4a;
          background: rgba(26, 26, 26, 0.95);
        }
      `}</style>
    </>
  );
}
