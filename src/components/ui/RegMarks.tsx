export function RegMarks() {
  return (
    <>
      <div aria-hidden="true" className="reg-mark tl" />
      <div aria-hidden="true" className="reg-mark tr" />
      <div aria-hidden="true" className="reg-mark bl" />
      <div aria-hidden="true" className="reg-mark br" />
      <style>{`
        .reg-mark {
          position: fixed;
          width: 16px;
          height: 16px;
          z-index: 30;
          pointer-events: none;
        }
        .reg-mark::before, .reg-mark::after {
          content: "";
          position: absolute;
          background: var(--red);
        }
        .reg-mark::before { left: 50%; top: 0; bottom: 0; width: 2px; transform: translateX(-50%); }
        .reg-mark::after { top: 50%; left: 0; right: 0; height: 2px; transform: translateY(-50%); }
        .reg-mark.tl { top: 20px; left: 20px; }
        .reg-mark.tr { top: 20px; right: 20px; }
        .reg-mark.bl { bottom: 20px; left: 20px; }
        .reg-mark.br { bottom: 20px; right: 20px; }
        @media (max-width: 960px) { .reg-mark { display: none; } }
      `}</style>
    </>
  );
}
