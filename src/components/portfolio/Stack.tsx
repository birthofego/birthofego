import { content } from '@/data/content';
import { StackChip } from '@/components/portfolio/StackChip';

export function Stack() {
  return (
    <>
      <section id="stack" aria-labelledby="stack-title" className="stack-section">
        <div className="section-label">{content.stack.label}</div>
        <h2 id="stack-title" className="section-title">{content.stack.title}</h2>
        <div className="stack-grid">
          {content.stack.items.map((item) => (
            <StackChip key={item} label={item} />
          ))}
        </div>
      </section>
      <style>{`
        .stack-section { padding: 96px 0; scroll-margin-top: 100px; }
        .stack-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 960px) {
          .stack-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
