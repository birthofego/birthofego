import { Nav } from '@/components/portfolio/Nav';
import { Hero } from '@/components/portfolio/Hero';
import { About } from '@/components/portfolio/About';
import { ProjectShowcase } from '@/components/portfolio/ProjectShowcase';
import { Stack } from '@/components/portfolio/Stack';
import { Contact } from '@/components/portfolio/Contact';
import { Footer } from '@/components/portfolio/Footer';
import { AsciiDivider } from '@/components/ui/AsciiDivider';
import { RegMarks } from '@/components/ui/RegMarks';
import PasswordGate from '@/components/PasswordGate';

export default function Page() {
  return (
    <PasswordGate>
      <RegMarks />
      <Nav />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}>
        <Hero />
        <AsciiDivider />
        <About />
        <AsciiDivider />
        <ProjectShowcase />
        <AsciiDivider />
        <Stack />
        <AsciiDivider />
        <Contact />
      </main>
      <Footer />
    </PasswordGate>
  );
}
