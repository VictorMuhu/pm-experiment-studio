# Idea Validator V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Idea Validator from a form→verdict scorecard into a real-time reasoning stream where GPT-4o thinks through the idea sentence by sentence, with four critic lenses (Skeptic / Builder / Buyer / Competitor), each thought grounded back to the exact input text that triggered it.

**Architecture:** Vite + React SPA (static build) + Vercel serverless functions for the streaming backend. The existing `analyze.js` is untouched. A new `stream.js` adds SSE streaming. All state management lives in `App.jsx` via a `useStream` hook.

**Tech Stack:** React 18, Vite 5, Vitest + @testing-library/react (tests), OpenAI Node SDK (streaming), Supabase (save/share), Vercel (deploy)

**Reference:** Design spec at `docs/superpowers/specs/2026-04-24-idea-validator-v3-design.md`. The Claude Design prototype (`reasoning-stream-scenarios-standalone.html`) is the visual reference — do not deviate without discussion.

---

## File Map

```
projects/2026-03-17-idea-validator/
├── src/
│   ├── main.jsx                          CREATE
│   ├── App.jsx                           CREATE
│   ├── tokens.css                        CREATE
│   ├── test-setup.js                     CREATE
│   ├── App.test.jsx                      CREATE
│   ├── hooks/
│   │   ├── useStream.js                  CREATE
│   │   └── useStream.test.js             CREATE
│   └── components/
│       ├── EmptyState.jsx                CREATE
│       ├── EmptyState.test.jsx           CREATE
│       ├── LensBar.jsx                   CREATE
│       ├── LensBar.test.jsx              CREATE
│       ├── ThoughtItem.jsx               CREATE
│       ├── ThoughtItem.test.jsx          CREATE
│       ├── Verdict.jsx                   CREATE
│       ├── Verdict.test.jsx              CREATE
│       ├── StreamPane.jsx                CREATE
│       ├── StreamPane.test.jsx           CREATE
│       ├── IdeaForm.jsx                  CREATE
│       └── IdeaForm.test.jsx             CREATE
├── api/
│   ├── stream.js                         CREATE
│   ├── stream.test.js                    CREATE
│   ├── save.js                           MODIFY (new schema)
│   └── analyze.js                        DO NOT TOUCH
├── index.html                            REPLACE (Vite entry)
├── package.json                          REPLACE (add React/Vite/Vitest)
├── vite.config.js                        CREATE
└── vercel.json                           REPLACE
```

**Archive before replacing:** `app.js` → `source/app-v2.js`, `styles.css` → `source/styles-v2.css`

---

## Task 1: Archive old files + scaffold Vite + React project

**Files:**
- Modify: `projects/2026-03-17-idea-validator/package.json`
- Create: `projects/2026-03-17-idea-validator/vite.config.js`
- Create: `projects/2026-03-17-idea-validator/src/test-setup.js`
- Replace: `projects/2026-03-17-idea-validator/index.html`

- [ ] **Step 1: Archive the v2 flat files**

```bash
cd projects/2026-03-17-idea-validator
cp app.js source/app-v2.js
cp styles.css source/styles-v2.css
```

- [ ] **Step 2: Replace `package.json`**

```json
{
  "name": "idea-validator",
  "private": true,
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.0",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 4: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
});
```

- [ ] **Step 5: Create `src/test-setup.js`**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Replace `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Idea Validator</title>
    <meta name="description" content="Pressure-test your product idea through four critic lenses: Skeptic, Builder, Buyer, Competitor." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300;1,8..60,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './tokens.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 8: Replace `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/eval/:id", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server at `http://localhost:5173`. Page shows blank (root div, no components yet). No console errors about missing files.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: scaffold Vite + React project for idea validator v3"
```

---

## Task 2: Design tokens

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/tokens.css`

- [ ] **Step 1: Create `src/tokens.css`**

```css
/* ── V3 Design Tokens ──────────────────────────────────────── */

@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300;1,8..60,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Color */
  --ink:        oklch(0.22 0.01 75);
  --ink-soft:   oklch(0.42 0.01 75);
  --ink-mute:   oklch(0.62 0.01 75);
  --ink-faint:  oklch(0.82 0.008 75);
  --paper:      oklch(0.985 0.004 85);
  --paper-warm: oklch(0.97 0.008 80);
  --paper-edge: oklch(0.92 0.008 80);
  --rule:       oklch(0.88 0.008 80);
  --accent:     oklch(0.55 0.15 250);
  --concern:    oklch(0.58 0.15 30);
  --strength:   oklch(0.5 0.14 150);

  /* Typography */
  --serif: "Source Serif 4", Georgia, serif;
  --sans:  "Inter", system-ui, -apple-system, sans-serif;
  --mono:  "JetBrains Mono", ui-monospace, monospace;

  /* Spacing */
  --sp-1: 8px;
  --sp-2: 12px;
  --sp-3: 16px;
  --sp-4: 24px;
  --sp-5: 32px;
  --sp-6: 48px;
  --sp-7: 64px;
  --sp-8: 96px;

  /* Misc */
  --radius: 2px;
  --t: 160ms ease;
}

/* ── Reset ──────────────────────────────────────────────────── */

*, *::before, *::after { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ── Animations ─────────────────────────────────────────────── */

@keyframes v3fade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes v3pulse {
  0%, 100% { box-shadow: 0 0 0 0 oklch(0.55 0.15 250 / 0.4); }
  50%       { box-shadow: 0 0 0 6px oklch(0.55 0.15 250 / 0); }
}
```

- [ ] **Step 2: Verify tokens load**

In `src/main.jsx` the `tokens.css` import is already present from Task 1. Start dev server and confirm page background is `oklch(0.985 0.004 85)` (off-white warm). No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/tokens.css
git commit -m "feat: add V3 design tokens (OKLCH, typography, spacing, animations)"
```

---

## Task 3: `useStream` hook

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/hooks/useStream.js`
- Create: `projects/2026-03-17-idea-validator/src/hooks/useStream.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/hooks/useStream.test.js
import { renderHook, act } from '@testing-library/react';
import { useStream } from './useStream';

function makeStream(lines) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line + '\n'));
      }
      controller.close();
    },
  });
}

function mockFetch(lines) {
  global.fetch = vi.fn().mockResolvedValue({
    body: makeStream(lines),
    ok: true,
  });
}

describe('useStream', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('starts in idle status with empty thoughts', () => {
    const { result } = renderHook(() => useStream());
    expect(result.current.status).toBe('idle');
    expect(result.current.thoughts).toEqual([]);
    expect(result.current.verdict).toBeNull();
  });

  it('parses thought events and sets done on verdict', async () => {
    mockFetch([
      'data: {"type":"thought","category":"concern","text":"Weak differentiation","quote":"easier to use"}',
      'data: {"type":"verdict","label":"Refine","score":60,"reason":"Solid problem, weak moat."}',
      'data: [DONE]',
    ]);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Test Idea' }, 'skeptic');
    });
    expect(result.current.thoughts).toHaveLength(1);
    expect(result.current.thoughts[0].category).toBe('concern');
    expect(result.current.thoughts[0].quote).toBe('easier to use');
    expect(result.current.verdict.label).toBe('Refine');
    expect(result.current.verdict.score).toBe(60);
    expect(result.current.status).toBe('done');
  });

  it('handles nothing event', async () => {
    mockFetch(['data: {"type":"nothing"}']);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Vague idea' }, 'skeptic');
    });
    expect(result.current.status).toBe('nothing');
    expect(result.current.thoughts).toHaveLength(0);
  });

  it('handles error event', async () => {
    mockFetch(['data: {"type":"error","message":"Stream interrupted"}']);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Test' }, 'skeptic');
    });
    expect(result.current.status).toBe('error');
  });

  it('skips malformed JSON lines without crashing', async () => {
    mockFetch([
      'data: not-valid-json',
      'data: {"type":"thought","category":"strength","text":"Clear problem","quote":"users abandon checkout"}',
      'data: [DONE]',
    ]);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Test' }, 'skeptic');
    });
    expect(result.current.thoughts).toHaveLength(1);
  });

  it('stop() aborts the stream and sets status to done', async () => {
    let streamController;
    const stream = new ReadableStream({ start(c) { streamController = c; } });
    global.fetch = vi.fn().mockResolvedValue({ body: stream, ok: true });

    const { result } = renderHook(() => useStream());
    act(() => { result.current.startStream({ ideaTitle: 'Test' }, 'skeptic'); });

    await act(async () => { result.current.stop(); });
    expect(result.current.status).toBe('done');
  });

  it('resets thoughts and verdict on a new startStream call', async () => {
    mockFetch([
      'data: {"type":"thought","category":"concern","text":"Gap 1","quote":"q1"}',
      'data: {"type":"verdict","label":"Pass","score":40,"reason":"Too weak."}',
    ]);
    const { result } = renderHook(() => useStream());
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Run 1' }, 'skeptic');
    });
    expect(result.current.thoughts).toHaveLength(1);

    mockFetch(['data: {"type":"nothing"}']);
    await act(async () => {
      await result.current.startStream({ ideaTitle: 'Run 2' }, 'buyer');
    });
    expect(result.current.thoughts).toHaveLength(0);
    expect(result.current.verdict).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: 6 failures — `useStream` not found.

- [ ] **Step 3: Implement `src/hooks/useStream.js`**

```js
import { useState, useRef } from 'react';

export function useStream() {
  const [thoughts, setThoughts] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [status, setStatus] = useState('idle');
  const abortRef = useRef(null);

  async function startStream(draft, lens) {
    if (abortRef.current) abortRef.current.abort();

    setThoughts([]);
    setVerdict(null);
    setStatus('streaming');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, lens }),
        signal: controller.signal,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') { setStatus('done'); return; }
          try {
            const event = JSON.parse(raw);
            if (event.type === 'thought') {
              setThoughts(prev => [...prev, event]);
            } else if (event.type === 'verdict') {
              setVerdict(event);
              setStatus('done');
              return;
            } else if (event.type === 'nothing') {
              setStatus('nothing');
              return;
            } else if (event.type === 'error') {
              setStatus('error');
              return;
            }
          } catch {
            // skip malformed line
          }
        }
      }
      setStatus('done');
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('done');
      } else {
        setStatus('error');
      }
    }
  }

  function stop() {
    if (abortRef.current) abortRef.current.abort();
  }

  return { thoughts, verdict, status, startStream, stop };
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: 6 passing.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useStream.js src/hooks/useStream.test.js
git commit -m "feat: add useStream hook with SSE parsing and abort support"
```

---

## Task 4: `EmptyState` component

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/components/EmptyState.jsx`
- Create: `projects/2026-03-17-idea-validator/src/components/EmptyState.test.jsx`

- [ ] **Step 1: Write failing test**

```jsx
// src/components/EmptyState.test.jsx
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

it('renders invitation copy', () => {
  render(<EmptyState />);
  expect(screen.getByText(/pick a lens/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — verify it fails**

```bash
npm test
```

Expected: FAIL — `EmptyState` not found.

- [ ] **Step 3: Implement `src/components/EmptyState.jsx`**

```jsx
export default function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 'var(--sp-6)',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--serif)',
        fontSize: '18px',
        color: 'var(--ink-mute)',
        maxWidth: '36ch',
        lineHeight: 1.5,
        margin: 0,
      }}>
        Pick a lens and describe your idea. Run a check to see what's driving the result.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run — verify pass**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/EmptyState.jsx src/components/EmptyState.test.jsx
git commit -m "feat: add EmptyState component"
```

---

## Task 5: `LensBar` component

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/components/LensBar.jsx`
- Create: `projects/2026-03-17-idea-validator/src/components/LensBar.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// src/components/LensBar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import LensBar from './LensBar';

const LENSES = ['skeptic', 'builder', 'buyer', 'competitor'];

it('renders all four lens labels', () => {
  render(<LensBar lenses={LENSES} activeLens="skeptic" onChange={() => {}} appState="drafting" />);
  expect(screen.getByText(/skeptic/i)).toBeInTheDocument();
  expect(screen.getByText(/builder/i)).toBeInTheDocument();
  expect(screen.getByText(/buyer/i)).toBeInTheDocument();
  expect(screen.getByText(/competitor/i)).toBeInTheDocument();
});

it('marks the active lens with aria-pressed true', () => {
  render(<LensBar lenses={LENSES} activeLens="buyer" onChange={() => {}} appState="done" />);
  expect(screen.getByText(/buyer/i).closest('button')).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText(/skeptic/i).closest('button')).toHaveAttribute('aria-pressed', 'false');
});

it('calls onChange with the clicked lens', () => {
  const onChange = vi.fn();
  render(<LensBar lenses={LENSES} activeLens="skeptic" onChange={onChange} appState="done" />);
  fireEvent.click(screen.getByText(/builder/i));
  expect(onChange).toHaveBeenCalledWith('builder');
});

it('disables all buttons while streaming', () => {
  render(<LensBar lenses={LENSES} activeLens="skeptic" onChange={() => {}} appState="streaming" />);
  LENSES.forEach(lens => {
    expect(screen.getByText(new RegExp(lens, 'i')).closest('button')).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test
```

- [ ] **Step 3: Implement `src/components/LensBar.jsx`**

```jsx
export default function LensBar({ lenses, activeLens, onChange, appState }) {
  const disabled = appState === 'streaming';

  return (
    <nav aria-label="Critic lens" style={{
      display: 'flex',
      gap: 'var(--sp-2)',
      padding: 'var(--sp-3) var(--sp-5)',
      borderBottom: '1px solid var(--rule)',
      background: 'var(--paper)',
    }}>
      {lenses.map(lens => (
        <button
          key={lens}
          type="button"
          aria-pressed={activeLens === lens ? 'true' : 'false'}
          disabled={disabled}
          onClick={() => onChange(lens)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            border: '1px solid',
            borderColor: activeLens === lens ? 'var(--accent)' : 'var(--rule)',
            borderRadius: 'var(--radius)',
            background: activeLens === lens ? 'oklch(0.55 0.15 250 / 0.08)' : 'transparent',
            color: activeLens === lens ? 'var(--accent)' : 'var(--ink-mute)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'border-color var(--t), color var(--t), background var(--t)',
          }}
        >
          {lens}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Run — verify pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/components/LensBar.jsx src/components/LensBar.test.jsx
git commit -m "feat: add LensBar component with disabled state during streaming"
```

---

## Task 6: `ThoughtItem` component

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/components/ThoughtItem.jsx`
- Create: `projects/2026-03-17-idea-validator/src/components/ThoughtItem.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// src/components/ThoughtItem.test.jsx
import { render, screen } from '@testing-library/react';
import ThoughtItem from './ThoughtItem';

const concern = {
  type: 'thought',
  category: 'concern',
  text: 'Differentiation is not falsifiable.',
  quote: 'easier to use than existing tools',
};

const strength = {
  type: 'thought',
  category: 'strength',
  text: 'Problem has a specific trigger.',
  quote: 'users abandon checkout on mobile',
};

it('renders thought text', () => {
  render(<ThoughtItem thought={concern} dimmed={false} />);
  expect(screen.getByText(/differentiation is not falsifiable/i)).toBeInTheDocument();
});

it('renders the quote chip', () => {
  render(<ThoughtItem thought={concern} dimmed={false} />);
  expect(screen.getByText(/easier to use than existing tools/i)).toBeInTheDocument();
});

it('applies dimmed opacity when dimmed=true', () => {
  const { container } = render(<ThoughtItem thought={concern} dimmed={true} />);
  const wrapper = container.firstChild;
  expect(wrapper).toHaveStyle({ opacity: '0.2' });
});

it('uses concern border color for concern category', () => {
  const { container } = render(<ThoughtItem thought={concern} dimmed={false} />);
  expect(container.firstChild).toHaveStyle({ borderLeftColor: 'var(--concern)' });
});

it('uses strength border color for strength category', () => {
  const { container } = render(<ThoughtItem thought={strength} dimmed={false} />);
  expect(container.firstChild).toHaveStyle({ borderLeftColor: 'var(--strength)' });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test
```

- [ ] **Step 3: Implement `src/components/ThoughtItem.jsx`**

```jsx
export default function ThoughtItem({ thought, dimmed }) {
  const borderColor = thought.category === 'concern' ? 'var(--concern)' : 'var(--strength)';

  return (
    <div
      style={{
        borderLeft: `3px solid ${borderColor}`,
        borderLeftColor: borderColor,
        paddingLeft: 'var(--sp-3)',
        marginBottom: 'var(--sp-4)',
        opacity: dimmed ? 0.2 : 1,
        animation: 'v3fade 400ms ease both',
        transition: 'opacity var(--t)',
      }}
    >
      <p style={{
        fontFamily: 'var(--serif)',
        fontSize: '17px',
        lineHeight: 1.55,
        color: 'var(--ink)',
        margin: '0 0 var(--sp-1)',
      }}>
        {thought.text}
      </p>
      {thought.quote && (
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--ink-mute)',
          fontStyle: 'italic',
          display: 'block',
        }}>
          "{thought.quote}"
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run — verify pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ThoughtItem.jsx src/components/ThoughtItem.test.jsx
git commit -m "feat: add ThoughtItem with category border, quote chip, dimmed state"
```

---

## Task 7: `Verdict` component

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/components/Verdict.jsx`
- Create: `projects/2026-03-17-idea-validator/src/components/Verdict.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// src/components/Verdict.test.jsx
import { render, screen } from '@testing-library/react';
import Verdict from './Verdict';

const verdict = { label: 'Refine', score: 64, reason: 'Strong problem. Weak moat.' };

it('renders the verdict label', () => {
  render(<Verdict verdict={verdict} stopped={false} />);
  expect(screen.getByText('Refine')).toBeInTheDocument();
});

it('renders the score', () => {
  render(<Verdict verdict={verdict} stopped={false} />);
  expect(screen.getByText('64')).toBeInTheDocument();
});

it('renders the reason', () => {
  render(<Verdict verdict={verdict} stopped={false} />);
  expect(screen.getByText(/strong problem/i)).toBeInTheDocument();
});

it('renders stopped notice when stopped=true and no verdict', () => {
  render(<Verdict verdict={null} stopped={true} />);
  expect(screen.getByText(/stopped/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test
```

- [ ] **Step 3: Implement `src/components/Verdict.jsx`**

```jsx
export default function Verdict({ verdict, stopped }) {
  if (stopped && !verdict) {
    return (
      <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Stopped — run again for a full verdict.
        </p>
      </div>
    );
  }

  if (!verdict) return null;

  return (
    <div style={{
      borderTop: '2px solid var(--accent)',
      paddingTop: 'var(--sp-4)',
      marginTop: 'var(--sp-4)',
      animation: 'v3fade 400ms ease both',
    }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 var(--sp-2)' }}>
        Verdict
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-4)', marginBottom: 'var(--sp-3)' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '54px', lineHeight: 1, color: 'var(--ink)' }}>
          {verdict.score}
        </span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '28px', lineHeight: 1.2, color: 'var(--ink)' }}>
          {verdict.label}
        </span>
      </div>
      <p style={{ fontFamily: 'var(--sans)', fontSize: '15px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
        {verdict.reason}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run — verify pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Verdict.jsx src/components/Verdict.test.jsx
git commit -m "feat: add Verdict component with score, label, reason, and stopped state"
```

---

## Task 8: `StreamPane` component

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/components/StreamPane.jsx`
- Create: `projects/2026-03-17-idea-validator/src/components/StreamPane.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// src/components/StreamPane.test.jsx
import { render, screen } from '@testing-library/react';
import StreamPane from './StreamPane';

const thoughts = [
  { type: 'thought', category: 'concern', text: 'Weak moat', quote: 'easier to use' },
  { type: 'thought', category: 'strength', text: 'Clear problem', quote: 'users abandon checkout' },
];
const verdict = { label: 'Refine', score: 60, reason: 'Good problem, weak moat.' };

it('shows EmptyState when appState is empty', () => {
  render(<StreamPane thoughts={[]} verdict={null} appState="empty" activeSentenceId={null} stopped={false} />);
  expect(screen.getByText(/pick a lens/i)).toBeInTheDocument();
});

it('renders all thoughts', () => {
  render(<StreamPane thoughts={thoughts} verdict={null} appState="streaming" activeSentenceId={null} stopped={false} />);
  expect(screen.getByText('Weak moat')).toBeInTheDocument();
  expect(screen.getByText('Clear problem')).toBeInTheDocument();
});

it('shows pulsing indicator during streaming', () => {
  const { container } = render(<StreamPane thoughts={[]} verdict={null} appState="streaming" activeSentenceId={null} stopped={false} />);
  expect(container.querySelector('[data-testid="streaming-dot"]')).toBeInTheDocument();
});

it('renders Verdict in done state', () => {
  render(<StreamPane thoughts={thoughts} verdict={verdict} appState="done" activeSentenceId={null} stopped={false} />);
  expect(screen.getByText('Refine')).toBeInTheDocument();
  expect(screen.getByText('60')).toBeInTheDocument();
});

it('dims thoughts that do not match activeSentenceId', () => {
  const thoughtsWithQuotes = [
    { type: 'thought', category: 'concern', text: 'Thought A', quote: 'abandon checkout' },
    { type: 'thought', category: 'strength', text: 'Thought B', quote: 'unrelated text here' },
  ];
  render(
    <StreamPane
      thoughts={thoughtsWithQuotes}
      verdict={null}
      appState="done"
      activeSentenceId="s0"
      activeSentenceText="users abandon checkout on mobile"
      stopped={false}
    />
  );
  expect(screen.getByText('Thought A').closest('[data-testid="thought-item"]')).toHaveStyle({ opacity: '1' });
  expect(screen.getByText('Thought B').closest('[data-testid="thought-item"]')).toHaveStyle({ opacity: '0.2' });
});

it('shows specificity gap message in nothing state', () => {
  render(<StreamPane thoughts={[]} verdict={null} appState="nothing" activeSentenceId={null} stopped={false} />);
  expect(screen.getByText(/specificity gap/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test
```

- [ ] **Step 3: Implement `src/components/StreamPane.jsx`**

```jsx
import EmptyState from './EmptyState';
import ThoughtItem from './ThoughtItem';
import Verdict from './Verdict';

function thoughtMatchesSentence(thought, activeSentenceText) {
  if (!activeSentenceText || !thought.quote) return false;
  const quote = thought.quote.toLowerCase();
  const sentence = activeSentenceText.toLowerCase();
  const words = quote.split(' ').filter(w => w.length > 4);
  return words.some(word => sentence.includes(word));
}

export default function StreamPane({ thoughts, verdict, appState, activeSentenceId, activeSentenceText, stopped }) {
  if (appState === 'empty') return <EmptyState />;

  if (appState === 'nothing') {
    return (
      <div style={{ padding: 'var(--sp-6) var(--sp-5)' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--sp-3)' }}>
          Specificity gap
        </p>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink-soft)', maxWidth: '40ch' }}>
          No concerns found — not because the idea is perfect, but because it isn't specific enough to critique. Sharpen the problem, target user, or differentiation and run again.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--sp-5)', overflowY: 'auto', height: '100%' }}>
      {appState === 'streaming' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
          <span
            data-testid="streaming-dot"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              animation: 'v3pulse 1.4s ease-out infinite',
            }}
          />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Thinking…
          </span>
        </div>
      )}

      {thoughts.map((thought, i) => {
        const isFiltering = !!activeSentenceId;
        const matches = isFiltering ? thoughtMatchesSentence(thought, activeSentenceText) : true;
        return (
          <div key={i} data-testid="thought-item" style={{ opacity: !isFiltering || matches ? 1 : 0.2 }}>
            <ThoughtItem thought={thought} dimmed={false} />
          </div>
        );
      })}

      {(appState === 'done' || appState === 'error') && (
        <Verdict verdict={verdict} stopped={stopped} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run — verify pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/components/StreamPane.jsx src/components/StreamPane.test.jsx
git commit -m "feat: add StreamPane with thought list, streaming indicator, and sentence filtering"
```

---

## Task 9: `IdeaForm` component

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/components/IdeaForm.jsx`
- Create: `projects/2026-03-17-idea-validator/src/components/IdeaForm.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// src/components/IdeaForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import IdeaForm from './IdeaForm';

const emptyDraft = {
  ideaTitle: '', ideaStage: 'seed', problem: '', target: '',
  valueProp: '', solution: '', differentiation: '', competitors: '',
  channels: '', successMetric: '', constraints: '',
};

it('renders the idea title field', () => {
  render(<IdeaForm draft={emptyDraft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="empty" activeSentenceId={null} onSentenceClick={() => {}} />);
  expect(screen.getByLabelText(/idea title/i)).toBeInTheDocument();
});

it('CTA button reads "Pressure-test" in drafting state', () => {
  render(<IdeaForm draft={emptyDraft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="drafting" activeSentenceId={null} onSentenceClick={() => {}} />);
  expect(screen.getByRole('button', { name: /pressure-test/i })).toBeInTheDocument();
});

it('CTA button reads "Stop" in streaming state', () => {
  render(<IdeaForm draft={emptyDraft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="streaming" activeSentenceId={null} onSentenceClick={() => {}} />);
  expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
});

it('CTA button is disabled in empty state', () => {
  render(<IdeaForm draft={emptyDraft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="empty" activeSentenceId={null} onSentenceClick={() => {}} />);
  expect(screen.getByRole('button', { name: /pressure-test/i })).toBeDisabled();
});

it('calls onRun when Pressure-test is clicked', () => {
  const onRun = vi.fn();
  const draftWithTitle = { ...emptyDraft, ideaTitle: 'My idea' };
  render(<IdeaForm draft={draftWithTitle} onChange={() => {}} onRun={onRun} onStop={() => {}} appState="drafting" activeSentenceId={null} onSentenceClick={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /pressure-test/i }));
  expect(onRun).toHaveBeenCalled();
});

it('calls onChange when a field is edited', () => {
  const onChange = vi.fn();
  render(<IdeaForm draft={emptyDraft} onChange={onChange} onRun={() => {}} onStop={() => {}} appState="empty" activeSentenceId={null} onSentenceClick={() => {}} />);
  fireEvent.change(screen.getByLabelText(/idea title/i), { target: { value: 'A new idea' } });
  expect(onChange).toHaveBeenCalledWith('ideaTitle', 'A new idea');
});

it('shows sentence chips in done state', () => {
  const draft = { ...emptyDraft, problem: 'Users lose time. They get frustrated.' };
  render(<IdeaForm draft={draft} onChange={() => {}} onRun={() => {}} onStop={() => {}} appState="done" activeSentenceId={null} onSentenceClick={() => {}} />);
  expect(screen.getByText(/users lose time/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test
```

- [ ] **Step 3: Implement `src/components/IdeaForm.jsx`**

```jsx
function tagSentences(text) {
  if (!text) return [];
  const parts = [];
  const regex = /[^.!?]*[.!?]+(?:\s|$)|[^.!?]+$/g;
  let id = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const sentence = match[0].trim();
    if (sentence) parts.push({ id: `s${id++}`, text: sentence });
  }
  return parts;
}

function Field({ label, htmlFor, children }) {
  return (
    <div style={{ marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--rule)', paddingBottom: 'var(--sp-3)' }}>
      <label htmlFor={htmlFor} style={{ display: 'block', fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--ink-mute)', marginBottom: 'var(--sp-1)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 2px', border: 'none',
  borderBottom: '1px solid var(--rule)', background: 'transparent',
  color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: '15px',
  outline: 'none', borderRadius: 0,
};

const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '72px' };

function SentenceChips({ text, activeSentenceId, onSentenceClick }) {
  const sentences = tagSentences(text);
  if (sentences.length === 0) return null;
  return (
    <div style={{ marginTop: 'var(--sp-2)', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-1)' }}>
      {sentences.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSentenceClick(activeSentenceId === s.id ? null : s.id, s.text)}
          style={{
            fontFamily: 'var(--sans)', fontSize: '12px',
            padding: '3px 8px', border: '1px solid',
            borderColor: activeSentenceId === s.id ? 'var(--accent)' : 'var(--rule)',
            borderRadius: 'var(--radius)',
            background: activeSentenceId === s.id ? 'oklch(0.55 0.15 250 / 0.08)' : 'transparent',
            color: activeSentenceId === s.id ? 'var(--accent)' : 'var(--ink-mute)',
            cursor: 'pointer', maxWidth: '240px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {s.text}
        </button>
      ))}
    </div>
  );
}

export default function IdeaForm({ draft, onChange, onRun, onStop, appState, activeSentenceId, onSentenceClick }) {
  const isStreaming = appState === 'streaming';
  const isDone = appState === 'done';
  const isEmpty = appState === 'empty';
  const hasContent = draft.ideaTitle.trim().length > 0;

  function handleCTA() {
    if (isStreaming) onStop();
    else onRun();
  }

  return (
    <div style={{ padding: 'var(--sp-5)', overflowY: 'auto', height: '100%' }}>
      <Field label="Idea title" htmlFor="ideaTitle">
        <input id="ideaTitle" style={inputStyle} value={draft.ideaTitle} onChange={e => onChange('ideaTitle', e.target.value)} placeholder="e.g., Cancel-proof schedule suggestions for clinics" autoComplete="off" />
      </Field>

      <Field label="Company stage" htmlFor="ideaStage">
        <select id="ideaStage" style={inputStyle} value={draft.ideaStage} onChange={e => onChange('ideaStage', e.target.value)}>
          <option value="seed">Seed / pre-PMF</option>
          <option value="series-a">Series A / early growth</option>
          <option value="scale-up">Scale-up</option>
          <option value="enterprise">Enterprise product org</option>
        </select>
      </Field>

      <Field label="Problem (who, when, what breaks)" htmlFor="problem">
        <textarea id="problem" style={textareaStyle} value={draft.problem} onChange={e => onChange('problem', e.target.value)} placeholder="Describe the moment and consequence." rows={3} />
        {isDone && <SentenceChips text={draft.problem} activeSentenceId={activeSentenceId} onSentenceClick={onSentenceClick} />}
      </Field>

      <Field label="Target user" htmlFor="target">
        <input id="target" style={inputStyle} value={draft.target} onChange={e => onChange('target', e.target.value)} placeholder="Role + context" autoComplete="off" />
      </Field>

      <Field label="Value proposition" htmlFor="valueProp">
        <textarea id="valueProp" style={textareaStyle} value={draft.valueProp} onChange={e => onChange('valueProp', e.target.value)} placeholder="What changes for the user?" rows={2} />
        {isDone && <SentenceChips text={draft.valueProp} activeSentenceId={activeSentenceId} onSentenceClick={onSentenceClick} />}
      </Field>

      <Field label="Solution sketch" htmlFor="solution">
        <textarea id="solution" style={textareaStyle} value={draft.solution} onChange={e => onChange('solution', e.target.value)} placeholder="What would the user experience?" rows={2} />
        {isDone && <SentenceChips text={draft.solution} activeSentenceId={activeSentenceId} onSentenceClick={onSentenceClick} />}
      </Field>

      <Field label="Differentiation" htmlFor="differentiation">
        <textarea id="differentiation" style={textareaStyle} value={draft.differentiation} onChange={e => onChange('differentiation', e.target.value)} placeholder="vs. the default option (status quo, spreadsheets, etc.)" rows={2} />
        {isDone && <SentenceChips text={draft.differentiation} activeSentenceId={activeSentenceId} onSentenceClick={onSentenceClick} />}
      </Field>

      <Field label="Known competitors / substitutes" htmlFor="competitors">
        <input id="competitors" style={inputStyle} value={draft.competitors} onChange={e => onChange('competitors', e.target.value)} placeholder="e.g., Notion, Excel, in-house scripts" autoComplete="off" />
      </Field>

      <Field label="Distribution channel" htmlFor="channels">
        <textarea id="channels" style={textareaStyle} value={draft.channels} onChange={e => onChange('channels', e.target.value)} placeholder="How does it reach users?" rows={2} />
      </Field>

      <Field label="Success metric (first measurable win)" htmlFor="successMetric">
        <input id="successMetric" style={inputStyle} value={draft.successMetric} onChange={e => onChange('successMetric', e.target.value)} placeholder="e.g., reduce no-show rate by 10% in 8 weeks" autoComplete="off" />
      </Field>

      <Field label="Constraints & risks (optional)" htmlFor="constraints">
        <textarea id="constraints" style={{ ...textareaStyle, borderBottom: 'none' }} value={draft.constraints} onChange={e => onChange('constraints', e.target.value)} placeholder="Regulatory, data, integration…" rows={2} />
      </Field>

      <div style={{ paddingTop: 'var(--sp-4)' }}>
        <button
          type="button"
          onClick={handleCTA}
          disabled={isEmpty || (!isStreaming && !hasContent)}
          style={{
            fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '10px 20px', border: '1px solid',
            borderColor: isStreaming ? 'var(--concern)' : 'var(--accent)',
            borderRadius: 'var(--radius)',
            background: isStreaming ? 'oklch(0.58 0.15 30 / 0.08)' : 'oklch(0.55 0.15 250 / 0.08)',
            color: isStreaming ? 'var(--concern)' : 'var(--accent)',
            cursor: (isEmpty || (!isStreaming && !hasContent)) ? 'not-allowed' : 'pointer',
            opacity: (isEmpty || (!isStreaming && !hasContent)) ? 0.4 : 1,
            transition: 'all var(--t)',
          }}
        >
          {isStreaming ? 'Stop' : 'Pressure-test'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run — verify pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/components/IdeaForm.jsx src/components/IdeaForm.test.jsx
git commit -m "feat: add IdeaForm with all fields, CTA state, sentence chips in done state"
```

---

## Task 10: `App.jsx` — state machine + full wiring

**Files:**
- Create: `projects/2026-03-17-idea-validator/src/App.jsx`
- Create: `projects/2026-03-17-idea-validator/src/App.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// src/App.test.jsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

function mockStreamFetch(events) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      events.forEach(e => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n`)));
      controller.enqueue(encoder.encode('data: [DONE]\n'));
      controller.close();
    },
  });
  global.fetch = vi.fn().mockResolvedValue({ body: stream, ok: true });
}

it('renders in empty state on load', () => {
  render(<App />);
  expect(screen.getByText(/pick a lens/i)).toBeInTheDocument();
});

it('transitions to drafting when a field is filled', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText(/idea title/i), { target: { value: 'My idea' } });
  expect(screen.getByRole('button', { name: /pressure-test/i })).not.toBeDisabled();
});

it('transitions to done after stream completes with verdict', async () => {
  mockStreamFetch([
    { type: 'thought', category: 'concern', text: 'Weak moat', quote: 'easier to use' },
    { type: 'verdict', label: 'Refine', score: 60, reason: 'Solid problem, weak moat.' },
  ]);
  render(<App />);
  fireEvent.change(screen.getByLabelText(/idea title/i), { target: { value: 'Test idea' } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /pressure-test/i }));
  });
  expect(screen.getByText('Refine')).toBeInTheDocument();
  expect(screen.getByText('60')).toBeInTheDocument();
});

it('switching lens from done state triggers a new stream', async () => {
  mockStreamFetch([
    { type: 'verdict', label: 'Pursue', score: 80, reason: 'Strong signals.' },
  ]);
  render(<App />);
  fireEvent.change(screen.getByLabelText(/idea title/i), { target: { value: 'Test idea' } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /pressure-test/i }));
  });
  expect(screen.getByText('Pursue')).toBeInTheDocument();

  mockStreamFetch([
    { type: 'verdict', label: 'Pass', score: 35, reason: 'Too costly.' },
  ]);
  await act(async () => {
    fireEvent.click(screen.getByText(/buyer/i));
  });
  expect(screen.getByText('Pass')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test
```

- [ ] **Step 3: Implement `src/App.jsx`**

```jsx
import { useState, useEffect, useCallback } from 'react';
import { useStream } from './hooks/useStream';
import LensBar from './components/LensBar';
import IdeaForm from './components/IdeaForm';
import StreamPane from './components/StreamPane';

const LENSES = ['skeptic', 'builder', 'buyer', 'competitor'];

const EMPTY_DRAFT = {
  ideaTitle: '', ideaStage: 'seed', problem: '', target: '',
  valueProp: '', solution: '', differentiation: '', competitors: '',
  channels: '', successMetric: '', constraints: '',
};

function deriveAppState(streamStatus, draft) {
  if (streamStatus === 'streaming') return 'streaming';
  if (streamStatus === 'done') return 'done';
  if (streamStatus === 'error') return 'error';
  if (streamStatus === 'nothing') return 'nothing';
  const hasContent = Object.values(draft).some(v => typeof v === 'string' && v.trim().length > 0 && v !== 'seed');
  return hasContent ? 'drafting' : 'empty';
}

export default function App() {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [activeLens, setActiveLens] = useState('skeptic');
  const [activeSentenceId, setActiveSentenceId] = useState(null);
  const [activeSentenceText, setActiveSentenceText] = useState(null);
  const [stopped, setStopped] = useState(false);
  const { thoughts, verdict, status, startStream, stop } = useStream();

  const appState = deriveAppState(status, draft);

  function handleDraftChange(field, value) {
    setDraft(prev => ({ ...prev, [field]: value }));
  }

  function handleRun() {
    setStopped(false);
    setActiveSentenceId(null);
    setActiveSentenceText(null);
    startStream(draft, activeLens);
  }

  function handleStop() {
    setStopped(true);
    stop();
  }

  function handleLensChange(lens) {
    setActiveLens(lens);
    if (appState === 'done' || appState === 'error' || appState === 'nothing') {
      setStopped(false);
      setActiveSentenceId(null);
      setActiveSentenceText(null);
      startStream(draft, lens);
    }
  }

  function handleSentenceClick(id, text) {
    setActiveSentenceId(id);
    setActiveSentenceText(text || null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--paper)' }}>
      <LensBar lenses={LENSES} activeLens={activeLens} onChange={handleLensChange} appState={appState} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden', borderTop: '1px solid var(--rule)' }}>
        <div style={{ borderRight: '1px solid var(--rule)', overflowY: 'auto' }}>
          <IdeaForm
            draft={draft}
            onChange={handleDraftChange}
            onRun={handleRun}
            onStop={handleStop}
            appState={appState}
            activeSentenceId={activeSentenceId}
            onSentenceClick={handleSentenceClick}
          />
        </div>
        <StreamPane
          thoughts={thoughts}
          verdict={verdict}
          appState={appState}
          activeSentenceId={activeSentenceId}
          activeSentenceText={activeSentenceText}
          stopped={stopped}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run — verify pass**

```bash
npm test
```

- [ ] **Step 5: Smoke test in browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- Page loads with two columns
- Lens bar at top with four pills (Skeptic active)
- Right column shows "Pick a lens…" invitation
- Typing in Idea Title enables the Pressure-test button
- (Stream call will fail at `/api/stream` — that's expected, backend not built yet)

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: wire App state machine, lens switching, sentence click filtering"
```

---

## Task 11: `/api/stream.js` backend

**Files:**
- Create: `projects/2026-03-17-idea-validator/api/stream.js`
- Create: `projects/2026-03-17-idea-validator/api/stream.test.js`

- [ ] **Step 1: Write failing tests for helper functions**

```js
// api/stream.test.js
const { buildSystemPrompt, buildUserPrompt } = require('./stream');

describe('buildSystemPrompt', () => {
  it('includes skeptic persona', () => {
    const prompt = buildSystemPrompt('skeptic');
    expect(prompt).toMatch(/devil's advocate/i);
  });

  it('includes builder persona', () => {
    const prompt = buildSystemPrompt('builder');
    expect(prompt).toMatch(/staff engineer/i);
  });

  it('includes buyer persona', () => {
    const prompt = buildSystemPrompt('buyer');
    expect(prompt).toMatch(/economic buyer/i);
  });

  it('includes competitor persona', () => {
    const prompt = buildSystemPrompt('competitor');
    expect(prompt).toMatch(/closest substitute/i);
  });

  it('falls back to skeptic for unknown lens', () => {
    const prompt = buildSystemPrompt('unknown-lens');
    expect(prompt).toMatch(/devil's advocate/i);
  });

  it('includes NDJSON instruction', () => {
    const prompt = buildSystemPrompt('skeptic');
    expect(prompt).toMatch(/one JSON object per line/i);
  });
});

describe('buildUserPrompt', () => {
  it('includes the idea title', () => {
    const prompt = buildUserPrompt({ ideaTitle: 'My AI tool', ideaStage: 'seed', problem: '', target: '', valueProp: '', solution: '', differentiation: '', competitors: '', channels: '', successMetric: '', constraints: '' });
    expect(prompt).toContain('My AI tool');
  });

  it('truncates very long problem text', () => {
    const longText = 'x'.repeat(600);
    const prompt = buildUserPrompt({ ideaTitle: 'T', ideaStage: 'seed', problem: longText, target: '', valueProp: '', solution: '', differentiation: '', competitors: '', channels: '', successMetric: '', constraints: '' });
    expect(prompt.length).toBeLessThan(3000);
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test
```

Expected: FAIL — `stream.js` not found / exports not defined.

- [ ] **Step 3: Implement `api/stream.js`**

```js
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LENS_PERSONAS = {
  skeptic:    "A devil's advocate who hunts for unvalidated assumptions, logical gaps, and claims that sound good but aren't falsifiable. You are not trying to kill the idea — you are trying to surface what must be true for it to work.",
  builder:    "A staff engineer evaluating what it would actually take to ship this. You flag hidden technical complexity, integration risks, data dependencies, and the gap between 'solution sketch' and working software.",
  buyer:      "A skeptical economic buyer who controls the budget. You evaluate whether the ROI story is credible, whether procurement friction is acknowledged, and whether you'd actually sign off on this.",
  competitor: "A product lead at the closest substitute. You evaluate why your users wouldn't switch, where the new product's differentiation is weak, and what the incumbent response would be.",
};

const STAGE_CONTEXT = {
  seed:        'early-stage startup validating problem-market fit',
  'series-a':  'growth-stage company with initial traction seeking scale',
  'scale-up':  'scaling company optimizing a proven business model',
  enterprise:  'enterprise organization with an established customer base',
};

const cap = (s, n = 500) => (s && s.length > n) ? s.slice(0, n) + '…' : (s || '(none)');

function buildSystemPrompt(lens) {
  const persona = LENS_PERSONAS[lens] || LENS_PERSONAS.skeptic;
  return `You are ${persona}

Read this product idea carefully. Think aloud — for each claim, assumption, or signal you notice, output one JSON object on its own line. Each object must include:
- "type": "thought"
- "category": "concern" or "strength"
- "text": your observation (1–2 sentences, direct and specific)
- "quote": the exact phrase from the input that triggered this thought

After all thoughts, output one final object:
- "type": "verdict"
- "label": "Pursue", "Refine", or "Pass"
- "score": integer 0–100
- "reason": 2-sentence summary referencing the strongest and weakest signal

Output nothing else. No markdown. No wrapper object. One JSON object per line.`;
}

function buildUserPrompt(draft) {
  return `Company stage: ${STAGE_CONTEXT[draft.ideaStage] || 'unknown'}
Title: ${cap(draft.ideaTitle, 120)}
Problem: ${cap(draft.problem)}
Target user: ${cap(draft.target)}
Value proposition: ${cap(draft.valueProp)}
Solution sketch: ${cap(draft.solution)}
Differentiation: ${cap(draft.differentiation)}
Known competitors: ${cap(draft.competitors, 200)}
Distribution channel: ${cap(draft.channels)}
Success metric: ${cap(draft.successMetric)}
Constraints: ${cap(draft.constraints)}`;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draft, lens } = req.body || {};
  if (!draft || !draft.ideaTitle) {
    return res.status(400).json({ error: 'draft with ideaTitle required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let buffer = '';

  try {
    const stream = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: buildSystemPrompt(lens) },
        { role: 'user', content: buildUserPrompt(draft) },
      ],
      stream: true,
      temperature: 0.4,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      buffer += delta;

      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          JSON.parse(trimmed);
          res.write(`data: ${trimmed}\n\n`);
        } catch {
          // skip malformed line
        }
      }
    }

    if (buffer.trim()) {
      try {
        JSON.parse(buffer.trim());
        res.write(`data: ${buffer.trim()}\n\n`);
      } catch {}
    }
  } catch (err) {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`);
    }
  } finally {
    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}

module.exports = handler;
module.exports.buildSystemPrompt = buildSystemPrompt;
module.exports.buildUserPrompt = buildUserPrompt;
```

- [ ] **Step 4: Run — verify pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add api/stream.js api/stream.test.js
git commit -m "feat: add streaming SSE endpoint with NDJSON parsing and four lens personas"
```

---

## Task 12: Update `/api/save.js` for V3 data model

**Files:**
- Modify: `projects/2026-03-17-idea-validator/api/save.js`

Before modifying: the current `save.js` inserts `{ idea_title, draft_data, analysis, assumptions, steps }` into a `evaluations` Supabase table. V3 needs a new `v3_evaluations` table to avoid breaking existing saves.

- [ ] **Step 1: Create the `v3_evaluations` table in Supabase**

In your Supabase project dashboard → SQL Editor, run:

```sql
create table v3_evaluations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  idea_title  text not null,
  draft       jsonb not null,
  lens        text not null,
  thoughts    jsonb not null default '[]',
  verdict     jsonb
);

alter table v3_evaluations enable row level security;
create policy "Public read" on v3_evaluations for select using (true);
create policy "Public insert" on v3_evaluations for insert with check (true);
```

- [ ] **Step 2: Add the V3 save route**

Add a new file `api/save-v3.js` (keeps old save.js untouched):

```js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draft, lens, thoughts, verdict } = req.body || {};
  if (!draft || !draft.ideaTitle || !lens) {
    return res.status(400).json({ error: 'draft (with ideaTitle) and lens are required' });
  }

  const { data, error } = await supabase
    .from('v3_evaluations')
    .insert({
      idea_title: draft.ideaTitle || 'Untitled idea',
      draft,
      lens,
      thoughts: thoughts || [],
      verdict: verdict || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase save error:', error.message);
    return res.status(500).json({ error: 'Save failed. Try again.' });
  }

  return res.status(200).json({ id: data.id });
};
```

- [ ] **Step 3: Verify save endpoint works**

With the Vercel dev server running (`vercel dev` in the project folder), test:

```bash
curl -X POST http://localhost:3000/api/save-v3 \
  -H "Content-Type: application/json" \
  -d '{"draft":{"ideaTitle":"Test"},"lens":"skeptic","thoughts":[],"verdict":{"label":"Refine","score":60,"reason":"Test."}}'
```

Expected: `{"id":"<uuid>"}` response.

- [ ] **Step 4: Commit**

```bash
git add api/save-v3.js
git commit -m "feat: add V3 save endpoint with v3_evaluations Supabase table"
```

---

## Task 13: End-to-end smoke test + Vercel deploy

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Build and preview locally**

```bash
npm run build && npm run preview
```

Expected: no build errors, preview server runs at `http://localhost:4173`.

- [ ] **Step 3: Full local smoke test with `vercel dev`**

```bash
vercel dev
```

In browser at `http://localhost:3000`:

- [ ] Page loads, two columns visible, lens bar shows four pills
- [ ] Empty state: right column shows "Pick a lens…"
- [ ] Type in Idea Title: Pressure-test button becomes active
- [ ] Fill in Problem, Value Prop, Solution. Click Pressure-test.
- [ ] Right column shows pulsing dot and thoughts arriving in real time
- [ ] Click Stop: dot disappears, "Stopped" notice appears
- [ ] Click Pressure-test again: new run starts, thoughts reset
- [ ] Let run complete: Verdict block appears with score, label, reason
- [ ] Click a sentence chip under Problem: non-matching thoughts dim
- [ ] Click another lens pill (e.g., Buyer): new stream starts automatically
- [ ] Fill in minimal fields and run: if GPT-4o returns nothing, "Specificity gap" message shows

- [ ] **Step 4: Deploy to Vercel**

```bash
git push origin HEAD
```

Vercel auto-deploys from the `docs/month-1-wrap` branch (or merge to main first if that's the deploy branch). Confirm deploy succeeds in Vercel dashboard.

- [ ] **Step 5: Smoke test on live URL**

Open `https://2026-03-17-idea-validator.vercel.app` and repeat the smoke test checklist from Step 3.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: idea validator v3 — streaming reasoning stream with four critic lenses"
```
