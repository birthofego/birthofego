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
      p5b: string;
    };
    signoff: string;
  };
  about2: {
    p6: string;
    p6b: string;
    p7: string;
    p7b: string;
    p7c: string;
    p8: string;
    p9: string;
    p10: string;
    closing: string;
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
    title: "SHA'NON PARTLOW",
    tagline: 'Full-stack developer. Motivated and eager. 9 years of experience. Mostly self taught.',
    subtagline: {
      before: 'Ego just means ',
      red1: 'self',
      mid: '',
      red2: '',
      after: '',
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
      lead: { prefix: 'My name is Sha’Non Partlow. But online I go by ', accent: 'Ego', suffix: ', and yes I know how it sounds at first.' },
      p2: {
        before: 'I wanted to put something here that\u2019s a little more detailed than "Hey I\u2019m Sha\u2019Non Partlow and I have cats, love gaming, love coding, and love art." I understand how the word ego can be associated with arrogance and cockiness. But in actuality, the word simply means ',
        em: 'self',
        mid: '. I chose the alias \u201cbirthofego\u201d because a couple of years ago, I realized I honestly didn\u2019t know who I was as a person. I\u2019m someone with a lot of friends \u2014 always surrounded despite being a homebody. But I started noticing I was changing who I was to fit into every circle, losing my ',
        highlight: 'core values',
        after: ' by prioritizing what others might value. It left me searching for who I am at my core. The journey of growing into the person I dream of being is what \u201cbirthofego\u201d means.',
      },
      p3: {
        before: 'After my interest in ',
        highlight: 'cybersecurity',
        after: ' was sparked four years ago, and practicing a good bit of it, I became a little paranoid honestly. The online space is unique and growing up in Gen Z it\u2019s more important than ever. I try to not put my name online super often, and have always been one to use an alias. Since it is the online space, that sort of thing is very accepted \u2014 even in the developer world.',
      },
      p4: "I began coding at age 14. My parents grounded me for getting a C in math \u2014 I was a huge math nerd, so they knew I was only slacking because of video games. Once grounded, I figured: if I can\u2019t play games, why not try making one? I downloaded Unity, followed C++ guides step by step until I had a little model that could walk, sprint, and jump. My parents were so shocked they ungrounded me.",
      p5: "By 16, a good friend got me into Python, and I branched into SQL, Java, Ruby, and Swift. He even bought me a MacBook so I could learn Swift and start using Xcode \u2014 we had dreams of being game developers.",
      p5b: "At 18, I landed a web developer apprenticeship. It lasted three months, and my project was solid \u2014 but I couldn\u2019t proceed to the next step. Conversations afterwards revealed it wasn\u2019t about my skills, but about my life situation. I thought it was unfair, but it didn\u2019t stop me. I didn\u2019t dwell on it. I had so much fun just being part of the program that it led me to a rash decision: \u201cSchool is expensive and it\u2019s just core classes right during the first two years. I\u2019m self-taught anyway \u2014 can\u2019t I just do it on my own?\u201d As someone who grew up as an artist, the visual side of front-end development clicked instantly, and I knew I wanted to go full-stack.",
    },
    signoff: '\u2014 EGO_',
  },
  about2: {
    p6: "I took the IT help desk path after working with Geek Squad, where I made a huge impression selling tech solutions \u2014 highest metrics in the micromarket across all Best Buys in NC. My boss and shift lead worked hard to give me the best recommendations they could, and for that I\u2019m forever grateful. I kept climbing the ladder while coding on the side, and at 20 my friend and I started our own business building websites and offering tech support.",
    p6b: "By age 22 we slowed down heavy, mental health took a toll on both me and my good friend. We dropped the company, and focused on life and our main jobs. I\u2019ve been working with TABS (Toshiba America Business Solutions) for the past 2 years. Longest I\u2019ve remained in a position \u2014 previous ones I either hit the ceiling or the contractors were a bit shady so I stepped away, until I found a great fit for myself with Toshiba. Since it is remote and being skilled at the job means you have a handful of free time, This allowed me to hone my developer skills in the meantime.",
    p7: "I understand the effect AI has in the developer space. But as someone who grew up sitting through those crazy long 12 hour, 6 hour videos... Chopping up those 24 hour videos across days just to learn things, and put them into projects and gamified examples to make sure it stuck. As someone who purchased Codecademy yearly subscriptions just to assist in my learning self taught as I balanced work \u2014 I assure you AI is merely seen as a tool, and never a substitute for skill. You will never see work published from me that I do not understand, or had no hand in creating. I grew up using any tool I could to learn as quickly as possible and I still do. But don\u2019t only take my word, have a conversation with me. You\u2019ll see the passion :)",
    p7c: "All of that to say \u2014 here I am age 24, and I\u2019ve decided while I do love IT, I know I can do a good job as a software developer. Challenges aren\u2019t roadblocks for me, it\u2019s more like a locked door. I never see a task as too tall, my goal is always to overcome it. I\u2019m never discouraged by those more intelligent, I\u2019m a sponge. I love to learn, I love competition, and I love to grow. I take a lot of pride in my work and I always aim to do my best for my employer.",
    p7b: "My entire journey was self taught, with the assistance of the apprenticeship getting me into front end development. As someone who grew up as an artist, I fell in love with front end development and decided I wanted to be fullstack. Due to the nature of my learning and my impulsive tendencies that ADHD only adds to \u2014 I often deleted projects, made new GitHub accounts and lost them, and overall didn\u2019t even see the importance of having one.",
    p8: "So mine is pretty barebones as of 2026. One of the many cons of factory resetting my PC every 3 months just because I randomly wanted a fresh start haha. The proof is in my work.",
    p9: "I love to have fun and love to smile, and I love making others smile. I\u2019ve always been credited for my creativity and ability to find unique solutions and fit into team environments well. I\u2019d like to believe those are my best strengths.",
    p10: "Below you\u2019ll see some of my projects. I tried showing a mix of my personality in the projects as well as a more professional approach. I\u2019m a silly guy that grew up loving cartoons like Regular Show, and Adventure Time. You\u2019ll see that a lot in the project titled \u201cGoose.\u201d It is 100% inspired by Regular Show and how nonsensical and random the show is. Anyways,",
    closing: "Thank you for reading. I do hope you consider me.",
  },
  profile: {
    terminalTitle: 'PROFILE.JSON',
    terminalStatus: '\u25cf LIVE',
    entries: [
      { key: 'name', value: '"Sha\u2019Non Partlow"' },
      { key: 'pronouns', value: '"He/Him"' },
      { key: 'alias', value: '"@birthofego" | "ego"' },
      { key: 'role', value: '"Full-Stack Dev"' },
      { key: 'location', value: '"Born & raised in North Carolina"' },
      { key: 'drive', value: '"maxed"' },
      { key: 'status', value: '"Open to work"', accent: true },
      { key: 'pets', value: '"2 cats \u2014 Odin & Loki"' },
      { key: 'favorite_game', value: '"God of War Ragnar\u00f6k"' },
      { key: 'words_I_live_by', value: '"Never give up."' },
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
    subline: 'Built from scratch. Deployed on Netlify. No templates.',
  },
};
