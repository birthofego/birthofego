'use client';

import { useState, useEffect, useRef, useMemo, useCallback, FormEvent } from 'react';

const MOTIVATIONS = [
  "Make it a good day, Adventurer.",
  "Small steps still defeat big monsters.",
  "One quest at a time, Adventurer.",
  "The bravest thing is starting.",
  "You've got the party, and the party is you.",
  "Momentum is your best weapon.",
  "Every task checked is XP earned.",
  "Today's slime is tomorrow's story.",
  "Be kind to the Adventurer in the mirror.",
  "Progress > perfection, always.",
  "Roll initiative on your morning.",
  "Tiny victories stack into epic days.",
  "The to-do list fears no Adventurer.",
  "Breathe. Choose one. Begin.",
  "Even a short quest counts.",
  "Adventurers rest, too. That's allowed.",
  "What's one thing you can finish now?",
  "Slow is smooth. Smooth is fast.",
  "You don't have to feel ready to start.",
  "Courage is built in checkboxes.",
  "Aim for done, not perfect.",
  "Leave the world one task better.",
  "New day, new hit points.",
  "The dungeon's smaller than it looks.",
  "You're further than you were yesterday.",
  "Keep going, Adventurer. The world's watching.",
  "Your effort is the spell.",
  "Great heroes take breaks.",
  "One more quest won't hurt.",
  "Go gently, move steadily, finish bravely.",
];

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const DAYS: { key: DayKey; label: string; long: string; color: string }[] = [
  { key: 'mon', label: 'Mon', long: 'Monday',    color: 'var(--mon-mon)' },
  { key: 'tue', label: 'Tue', long: 'Tuesday',   color: 'var(--mon-tue)' },
  { key: 'wed', label: 'Wed', long: 'Wednesday', color: 'var(--mon-wed)' },
  { key: 'thu', label: 'Thu', long: 'Thursday',  color: 'var(--mon-thu)' },
  { key: 'fri', label: 'Fri', long: 'Friday',    color: 'var(--mon-fri)' },
  { key: 'sat', label: 'Sat', long: 'Saturday',  color: 'var(--mon-sat)' },
  { key: 'sun', label: 'Sun', long: 'Sunday',    color: 'var(--mon-sun)' },
];

const dayIndexFromJs = (jsDay: number) => (jsDay + 6) % 7;

type TaskStatus = 'todo' | 'doing' | 'done';
type Task = { id: string; title: string; status: TaskStatus; due: string | null };
type DailyItem = { id: string; text: string; done: boolean };
type Store = { tasks: Task[]; daily: Record<string, DailyItem[]> };

const STORE_KEY = 'adventurer.v1';

const loadStore = (): Store | null => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveStore = (s: Store) => localStorage.setItem(STORE_KEY, JSON.stringify(s));

const uid = () => Math.random().toString(36).slice(2, 10);

const seedStore = (): Store => {
  const now = new Date();
  const plusH = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();
  const minusH = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  return {
    tasks: [
      { id: uid(), title: "Design the onboarding flow",   status: "todo",  due: plusH(26) },
      { id: uid(), title: "Review PR from Naomi",         status: "todo",  due: plusH(3) },
      { id: uid(), title: "Draft Q2 roadmap",             status: "todo",  due: null },
      { id: uid(), title: "Interview prep — senior role", status: "doing", due: plusH(6) },
      { id: uid(), title: "Rework settings empty state",  status: "doing", due: null },
      { id: uid(), title: "Ship dark mode toggle",        status: "done",  due: minusH(2) },
      { id: uid(), title: "Write changelog for 1.4",      status: "done",  due: minusH(20) },
    ],
    daily: {
      mon: [{ id: uid(), text: "Morning stretch", done: false }, { id: uid(), text: "Inbox zero", done: false }, { id: uid(), text: "20 min reading", done: false }],
      tue: [{ id: uid(), text: "Gym — legs day", done: false }, { id: uid(), text: "Sketch icon set", done: false }],
      wed: [{ id: uid(), text: "Team standup", done: false }, { id: uid(), text: "Dentist @ 3pm", done: false }, { id: uid(), text: "Pay electric bill", done: false }, { id: uid(), text: "Call mom", done: false }],
      thu: [{ id: uid(), text: "Deep work block", done: false }, { id: uid(), text: "Prep weekly demo", done: false }],
      fri: [{ id: uid(), text: "Retrospective notes", done: false }, { id: uid(), text: "Groceries run", done: false }, { id: uid(), text: "Pick up laundry", done: false }],
      sat: [{ id: uid(), text: "Long walk", done: false }, { id: uid(), text: "Cook something new", done: false }],
      sun: [{ id: uid(), text: "Meal prep", done: false }, { id: uid(), text: "Plan the week", done: false }, { id: uid(), text: "Tidy desk", done: false }],
    },
  };
};

const fmtDue = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = diffMs / 3600000;
  const sameDay = d.toDateString() === now.toDateString();
  const tom = new Date(now);
  tom.setDate(now.getDate() + 1);
  const isTom = d.toDateString() === tom.toDateString();
  const timePart = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '');

  let label: string;
  if (sameDay) label = `Today ${timePart}`;
  else if (isTom) label = `Tomorrow ${timePart}`;
  else if (diffH > -24 && diffH < 0) label = `Yesterday ${timePart}`;
  else label = `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timePart}`;

  let tone: 'normal' | 'overdue' | 'soon' = 'normal';
  if (diffH < 0) tone = 'overdue';
  else if (diffH < 6) tone = 'soon';
  return { label, tone };
};

const toLocalInput = (iso: string | null) => {
  if (!iso) return { d: '', t: '' };
  const dt = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    d: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
    t: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
  };
};

const fromLocalInput = (dStr: string, tStr: string) => {
  if (!dStr) return null;
  const [y, m, da] = dStr.split('-').map(Number);
  const [h, mi] = (tStr || '09:00').split(':').map(Number);
  return new Date(y, m - 1, da, h, mi).toISOString();
};

/* ============ Motivation ============ */
function Motivation({ show, name }: { show: boolean; name: string }) {
  const [i, setI] = useState(() => Math.floor(Math.random() * MOTIVATIONS.length));
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (!show) return;
    const t1 = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setI(prev => (prev + 1) % MOTIVATIONS.length);
        setPhase('in');
      }, 520);
    }, 6500);
    return () => clearInterval(t1);
  }, [show]);

  if (!show) return <div style={{ height: 18 }} />;
  const msg = MOTIVATIONS[i].replace(/Adventurer/g, name);
  return (
    <div className={`adv-motivation fade-${phase === 'in' ? 'in' : 'out'}`}>
      <div className="adv-motivation-inner">{msg}</div>
    </div>
  );
}

/* ============ Slime ============ */
function Slime({ color, hpPct, defeated, hitKey }: { color: string; hpPct: number; defeated: boolean; hitKey: number }) {
  const [hit, setHit] = useState(false);
  const [hitNums, setHitNums] = useState<{ id: number; x: number }[]>([]);
  const prevKey = useRef(hitKey);

  useEffect(() => {
    if (hitKey !== prevKey.current && hitKey > 0) {
      setHit(true);
      const id = Date.now();
      const x = 40 + Math.random() * 80;
      setHitNums(n => [...n, { id, x }]);
      setTimeout(() => setHit(false), 450);
      setTimeout(() => setHitNums(n => n.filter(h => h.id !== id)), 900);
    }
    prevKey.current = hitKey;
  }, [hitKey]);

  const low = hpPct < 35 && hpPct > 0;

  return (
    <div className="adv-monster-wrap">
      <div className="adv-monster-shadow" />
      <div
        className={`adv-slime ${hit ? 'hit' : ''} ${defeated ? 'defeated' : ''} ${low ? 'low' : ''}`}
        style={{ '--slime-color': color } as React.CSSProperties}
      >
        <div className="adv-slime-body" style={{ background: color }} />
        <div className="adv-slime-shine" />
        <div className="adv-slime-cheek left" />
        <div className="adv-slime-cheek right" />
        <div className="adv-slime-eye left" />
        <div className="adv-slime-eye right" />
        <div className="adv-slime-mouth" />
      </div>
      {hitNums.map(n => (
        <div key={n.id} className="adv-hit-num" style={{ left: n.x, top: 20 }}>-1</div>
      ))}
    </div>
  );
}

/* ============ HP Bar ============ */
function HPBar({ current, max, defeated }: { current: number; max: number; defeated: boolean }) {
  const pct = max === 0 ? 0 : (current / max) * 100;
  const cls = defeated ? 'empty' : pct < 35 ? 'low' : pct < 70 ? 'mid' : '';
  return (
    <div className="adv-hp-wrap">
      <div className="adv-hp-top">
        <span>HP</span>
        <span><b>{current}</b> / {max}</span>
      </div>
      <div className="adv-hp-bar">
        <div className={`adv-hp-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
      {defeated && max > 0 && <div className="adv-hp-defeated">&#9670; MONSTER DEFEATED &#9670;</div>}
      {max === 0 && <div className="adv-hp-defeated" style={{ color: 'var(--adv-ink-3)' }}>Sleeping &middot; add a task to wake it</div>}
    </div>
  );
}

/* ============ Task Card ============ */
function TaskCard({ task, onToggle, onEdit, onDelete, onSetDue, onDragStart, onDragEnd, density }: {
  task: Task;
  onToggle: () => void;
  onEdit: (v: string) => void;
  onDelete: () => void;
  onSetDue: (iso: string | null) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  density: string;
}) {
  const [dateOpen, setDateOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const due = fmtDue(task.due);
  const init = toLocalInput(task.due);
  const [dVal, setDVal] = useState(init.d);
  const [tVal, setTVal] = useState(init.t || '09:00');

  useEffect(() => {
    const { d, t } = toLocalInput(task.due);
    setDVal(d);
    setTVal(t || '09:00');
  }, [task.due]);

  useEffect(() => {
    if (!dateOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setDateOpen(false);
    };
    setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [dateOpen]);

  return (
    <div
      className={`adv-task ${task.status === 'done' ? 'done' : ''}`}
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      style={{ padding: density === 'compact' ? '9px 11px 8px' : undefined }}
    >
      <div className="adv-task-row">
        <div
          className={`adv-checkbox ${task.status === 'done' ? 'checked' : ''}`}
          onClick={e => { e.stopPropagation(); onToggle(); }}
          role="checkbox"
          aria-checked={task.status === 'done'}
        />
        <div className="adv-task-body">
          <div
            className="adv-task-title"
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              const v = e.currentTarget.textContent?.trim() ?? '';
              if (v && v !== task.title) onEdit(v);
              else e.currentTarget.textContent = task.title;
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
              if (e.key === 'Escape') { e.currentTarget.textContent = task.title; e.currentTarget.blur(); }
            }}
          >{task.title}</div>
          <div className="adv-task-meta">
            {due ? (
              <button
                className={`adv-chip svg ${due.tone}`}
                onClick={e => { e.stopPropagation(); setDateOpen(v => !v); }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="3.5" width="12" height="10" rx="2" />
                  <path d="M2 6.5h12M6 2v3M10 2v3" />
                </svg>
                {due.label}
              </button>
            ) : (
              <button
                className="adv-chip"
                style={{ background: 'transparent', border: '1px dashed var(--adv-line-2)', color: 'var(--adv-ink-3)' }}
                onClick={e => { e.stopPropagation(); setDateOpen(v => !v); }}
              >+ due</button>
            )}
          </div>
        </div>
      </div>
      <button className="adv-task-del" onClick={e => { e.stopPropagation(); onDelete(); }} aria-label="Delete task">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
      {dateOpen && (
        <div className="adv-date-popover" ref={popRef} style={{ top: 'calc(100% + 6px)', right: 8 }}>
          <label>Due date</label>
          <div className="row">
            <input type="date" value={dVal} onChange={e => setDVal(e.target.value)} />
            <input type="time" value={tVal} onChange={e => setTVal(e.target.value)} style={{ maxWidth: 88 }} />
          </div>
          <div className="actions">
            <button className="adv-btn ghost" onClick={() => { onSetDue(null); setDateOpen(false); }}>Clear</button>
            <button className="adv-btn primary" onClick={() => { onSetDue(fromLocalInput(dVal, tVal)); setDateOpen(false); }}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Column ============ */
function Column({ status, label, tasks, onDrop, onAdd, density, children }: {
  status: string;
  label: string;
  tasks: Task[];
  onDrop: (id: string, status: TaskStatus) => void;
  onAdd: () => void;
  density: string;
  children: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`adv-col ${over ? 'drag-over' : ''}`}
      data-status={status}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) onDrop(id, status as TaskStatus);
      }}
    >
      <div className="adv-col-head">
        <div className="adv-col-head-left">
          <span className="adv-col-dot" />
          <span>{label}</span>
        </div>
        <span className="adv-col-count">{tasks.length}</span>
      </div>
      <div className="adv-card-list">{children}</div>
      <button className="adv-col-add" onClick={onAdd}>+ Add task</button>
    </div>
  );
}

/* ============ Daily Panel ============ */
function DailyPanel({ dayKey, setDayKey, todayKey, items, onAdd, onToggle, onEdit, onDelete }: {
  dayKey: DayKey;
  setDayKey: (k: DayKey) => void;
  todayKey: DayKey;
  items: DailyItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [val, setVal] = useState('');
  const day = DAYS.find(d => d.key === dayKey)!;
  const total = items.length;
  const remaining = items.filter(i => !i.done).length;
  const defeated = total > 0 && remaining === 0;
  const [hitCount, setHitCount] = useState(0);

  const handleToggle = (id: string, wasDone: boolean) => {
    onToggle(id);
    if (!wasDone) setHitCount(c => c + 1);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = val.trim();
    if (!v) return;
    onAdd(v);
    setVal('');
  };

  return (
    <div className="adv-daily">
      <div className="adv-daily-head">
        <div className="adv-daily-title">Daily Quests</div>
        <div className="adv-daily-day">{day.long.toUpperCase()}</div>
      </div>

      <div className="adv-days">
        {DAYS.map(d => (
          <button
            key={d.key}
            className={`adv-day-btn ${dayKey === d.key ? 'active' : ''} ${todayKey === d.key ? 'today' : ''}`}
            onClick={() => setDayKey(d.key)}
          >{d.label.toUpperCase()}</button>
        ))}
      </div>

      <div className="adv-monster-stage">
        <Slime
          color={day.color}
          hpPct={total === 0 ? 100 : (remaining / total) * 100}
          defeated={defeated}
          hitKey={hitCount}
        />
        <HPBar current={remaining} max={total} defeated={defeated} />
      </div>

      <div className="adv-daily-list-wrap">
        <div className="adv-daily-list">
          {items.map(it => (
            <div key={it.id} className={`adv-daily-item ${it.done ? 'done' : ''}`}>
              <div
                className={`adv-checkbox ${it.done ? 'checked' : ''}`}
                onClick={() => handleToggle(it.id, it.done)}
              />
              <div
                className="adv-daily-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                  const v = e.currentTarget.textContent?.trim() ?? '';
                  if (v && v !== it.text) onEdit(it.id, v);
                  else e.currentTarget.textContent = it.text;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
                }}
              >{it.text}</div>
              <button className="adv-daily-del" onClick={() => onDelete(it.id)} aria-label="Delete">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '14px 0', color: 'var(--adv-ink-3)', fontSize: 12.5 }}>
              No quests today. A peaceful day for the slime.
            </div>
          )}
        </div>
        <form className="adv-daily-add" onSubmit={submit}>
          <div className="adv-daily-add-plus">+</div>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Add a quest…"
          />
        </form>
      </div>
    </div>
  );
}

/* ============ Main App ============ */
export default function AdventurerApp() {
  const [store, setStore] = useState<Store | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [dragging, setDragging] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = loadStore();
    setStore(saved?.tasks ? saved : seedStore());
    const savedTheme = localStorage.getItem('adventurer-theme');
    if (savedTheme === 'dark') setDark(true);
  }, []);

  useEffect(() => {
    if (store) saveStore(store);
  }, [store]);

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(i);
  }, []);

  const todayKey = DAYS[dayIndexFromJs(now.getDay())].key;
  const [dayKey, setDayKey] = useState<DayKey>(todayKey);

  if (!store) return (
    <div className="adventurer-page">
      <div className="adv-app" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'var(--adv-ink-3)', fontSize: 14 }}>Loading quests...</div>
      </div>
    </div>
  );

  const addTask = (status: TaskStatus) => {
    const t: Task = { id: uid(), title: "New quest", status, due: null };
    setStore(s => s ? { ...s, tasks: [...s.tasks, t] } : s);
  };
  const updateTask = (id: string, patch: Partial<Task>) => {
    setStore(s => s ? { ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t) } : s);
  };
  const deleteTask = (id: string) => {
    setStore(s => s ? { ...s, tasks: s.tasks.filter(t => t.id !== id) } : s);
  };
  const toggleTask = (t: Task) => {
    updateTask(t.id, { status: t.status === 'done' ? 'todo' : 'done' });
  };
  const moveTask = (id: string, status: TaskStatus) => updateTask(id, { status });

  const tasksByStatus = {
    todo:  store.tasks.filter(t => t.status === 'todo'),
    doing: store.tasks.filter(t => t.status === 'doing'),
    done:  store.tasks.filter(t => t.status === 'done'),
  };

  const daily = store.daily || {};
  const dailyItems = daily[dayKey] || [];

  const addDaily = (text: string) => setStore(s => s ? {
    ...s,
    daily: { ...s.daily, [dayKey]: [...(s.daily[dayKey] || []), { id: uid(), text, done: false }] },
  } : s);
  const toggleDaily = (id: string) => setStore(s => s ? {
    ...s,
    daily: { ...s.daily, [dayKey]: s.daily[dayKey].map(i => i.id === id ? { ...i, done: !i.done } : i) },
  } : s);
  const editDaily = (id: string, text: string) => setStore(s => s ? {
    ...s,
    daily: { ...s.daily, [dayKey]: s.daily[dayKey].map(i => i.id === id ? { ...i, text } : i) },
  } : s);
  const deleteDaily = (id: string) => setStore(s => s ? {
    ...s,
    daily: { ...s.daily, [dayKey]: s.daily[dayKey].filter(i => i.id !== id) },
  } : s);

  const hour = now.getHours();
  const greet = hour < 5 ? "Up late"
    : hour < 12 ? "Good morning"
    : hour < 17 ? "Good afternoon"
    : hour < 21 ? "Good evening"
    : "Late night";
  const dateLabel = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const timeLabel = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();

  const name = 'Adventurer';

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('adventurer-theme', next ? 'dark' : 'light');
  };

  return (
    <div className={`adventurer-page ${dark ? 'dark' : ''}`}>
      <div className="adv-app">
        <div className="adv-topbar">
          <div className="adv-brand">
            <div className="adv-brand-mark">A</div>
            Adventurer
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="adv-date-pill">
              <span>{dateLabel}</span>
              <span style={{ color: 'var(--adv-ink-3)' }}>&middot;</span>
              <span className="adv-clock">{timeLabel}</span>
            </div>
            <button className="adv-dark-toggle" onClick={toggleDark} aria-label={dark ? 'Light mode' : 'Dark mode'}>
              {dark ? '☀' : '☾'}
            </button>
          </div>
        </div>

        <Motivation show={true} name={name} />

        <div className="adv-greeting">
          <h1>
            {greet}, <span className="soft">{name}.</span>
          </h1>
          <div className="adv-greeting-meta">
            <span>{tasksByStatus.todo.length} to start</span>
            <span className="dot" />
            <span>{tasksByStatus.doing.length} in progress</span>
            <span className="dot" />
            <span>{tasksByStatus.done.length} completed</span>
          </div>
        </div>

        <div className="adv-layout">
          <div>
            <div className="adv-board-header">
              <div className="adv-board-title">Quest Board</div>
              <button className="adv-board-add" onClick={() => addTask('todo')}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                New quest
              </button>
            </div>
            <div className="adv-columns">
              {([
                { key: 'todo' as const, label: 'Not started' },
                { key: 'doing' as const, label: 'In progress' },
                { key: 'done' as const, label: 'Completed' },
              ]).map(col => (
                <Column
                  key={col.key}
                  status={col.key}
                  label={col.label}
                  tasks={tasksByStatus[col.key]}
                  onDrop={moveTask}
                  onAdd={() => addTask(col.key)}
                  density="cozy"
                >
                  {tasksByStatus[col.key].map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggle={() => toggleTask(t)}
                      onEdit={v => updateTask(t.id, { title: v })}
                      onDelete={() => deleteTask(t.id)}
                      onSetDue={iso => updateTask(t.id, { due: iso })}
                      onDragStart={id => setDragging(id)}
                      onDragEnd={() => setDragging(null)}
                      density="cozy"
                    />
                  ))}
                </Column>
              ))}
            </div>
          </div>

          <DailyPanel
            dayKey={dayKey}
            setDayKey={setDayKey}
            todayKey={todayKey}
            items={dailyItems}
            onAdd={addDaily}
            onToggle={toggleDaily}
            onEdit={editDaily}
            onDelete={deleteDaily}
          />
        </div>
      </div>
    </div>
  );
}
