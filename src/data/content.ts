export type Content = {
  brand: { name: string; handle: string; nickname: string };
  nav: { label: string; href: string }[];
  hero: {
    promptUser: string;
    promptHost: string;
    typingPhrases: string[];
    handle: string;
    title: string;
    tagline: string;
    subtagline: { before: string; red1: string; mid: string; red2: string; after: string };
    ctas: { label: string; href: string; variant: 'solid' | 'ghost' }[];
  };
  about: {
    label: string;
    title: string;
    prose: {
      lead: { prefix: string; accent: string; suffix: string };
      p2: { before: string; em: string; mid: string; highlight: string; after: string };
      p3: { before: string; highlight: string; after: string };
      p4: string;
      p5: string;
    };
    signoff: string;
  };
  profile: {
    terminalTitle: string;
    terminalStatus: string;
    entries: { key: string; value: string; accent?: boolean }[];
  };
  projects: { label: string; title: string };
  stack: { label: string; title: string; items: string[] };
  contact: {
    label: string;
    title: string;
    terminalTitle: string;
    terminalStatus: string;
    email: string;
    github: string;
  };
  footer: { year: number; subline: string };
};

export const content: Content = {
  brand: {
    name: 'BIRTHOFEGO',
    handle: '@birthofego',
    nickname: 'Ego',
  },
  nav: [
    { label: 'about', href: '#about' },
    { label: 'projects', href: '#projects' },
    { label: 'stack', href: '#stack' },
    { label: 'contact', href: '#contact' },
  ],
  hero: {
    promptUser: 'user',
    promptHost: 'birthofego',
    typingPhrases: ['whoami', 'ls ./projects', 'cat about.md', 'npm run hire-me'],
    handle: '// @BIRTHOFEGO',
    title: 'EGO',
    tagline: 'Full-stack developer. Motivated, eager, and ready to show the world what I can build.',
    subtagline: {
      before: 'Ego just means ',
      red1: 'self',
      mid: ' \u2014 and the ',
      red2: 'confidence',
      after: ' to back it up.',
    },
    ctas: [
      { label: 'VIEW PROJECTS \u2192', href: '#projects', variant: 'solid' },
      { label: 'WHO IS EGO?', href: '#about', variant: 'ghost' },
    ],
  },
  about: {
    label: '// 01 \u2014 ABOUT',
    title: 'whoami',
    prose: {
      lead: { prefix: 'I go by ', accent: 'Ego', suffix: '. I know how it lands at first.' },
      p2: {
        before: 'Most people hear \u201cego\u201d and think arrogance. But ego just means ',
        em: 'self',
        mid: '. It means me. And it also means ',
        highlight: 'confidence',
        after: ' \u2014 the quiet kind you build when you stop shrinking yourself to make other people comfortable.',
      },
      p3: {
        before: '',
        highlight: 'birthofego',
        after: ' is exactly what it sounds like. This is the birth of who I am.',
      },
      p4: "I\u2019m motivated and eager. When a goal shows up in front of me, I don\u2019t step around it \u2014 I figure it out and move through it. But I\u2019m just as eager about something else: finding out who I actually want to be, and doing it by surrounding myself with people who care about me for being me.",
      p5: 'I want to show the world what I can accomplish. This is where I start proving it.',
    },
    signoff: '\u2014 EGO_',
  },
  profile: {
    terminalTitle: 'PROFILE.JSON',
    terminalStatus: '\u25cf LIVE',
    entries: [
      { key: 'name', value: '"Ego"' },
      { key: 'alias', value: '"@birthofego"' },
      { key: 'role', value: '"Full-Stack Dev"' },
      { key: 'drive', value: '"maxed"' },
      { key: 'status', value: '"Open to work"', accent: true },
      { key: 'mantra', value: '"show, don\'t tell"' },
    ],
  },
  projects: {
    label: '// 02 \u2014 PROJECTS',
    title: 'ls ./builds',
  },
  stack: {
    label: '// 03 \u2014 STACK',
    title: 'tech --list',
    items: ['NEXT.JS', 'TYPESCRIPT', 'REACT', 'NODE.JS', 'POSTGRES', 'TAILWIND', 'GIT', 'VERCEL', 'PYTHON', 'C#', 'SWIFT', 'DOCKER', 'REDIS', 'MONGODB', 'REST', 'AWS (BEGINNER)'],
  },
  contact: {
    label: '// 04 \u2014 CONTACT',
    title: 'ping me',
    terminalTitle: 'CONTACT.SH',
    terminalStatus: '\u25cf OPEN',
    email: 'spartlow10@gmail.com',
    github: 'github.com/birthofego',
  },
  footer: {
    year: 2026,
    subline: 'Built from scratch. Deployed on Vercel. No templates.',
  },
};
