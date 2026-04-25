import { useState } from 'react';
import { useStream } from './hooks/useStream';
import IdeaForm from './components/IdeaForm';
import StreamPane from './components/StreamPane';

const LENSES = ['skeptic', 'builder', 'buyer'];

function deriveAppState(streamStatus, ideaText) {
  if (streamStatus === 'streaming') return 'streaming';
  if (streamStatus === 'done') return 'done';
  if (streamStatus === 'error') return 'error';
  if (streamStatus === 'nothing') return 'nothing';
  return ideaText.trim().length > 0 ? 'drafting' : 'empty';
}

function TopChrome({ ideaText }) {
  const rawTitle = ideaText.trim().split(/[.!?]/)[0].trim();
  const crumb = rawTitle.length > 44 ? rawTitle.slice(0, 44) + '…' : rawTitle || 'New session';
  return (
    <div style={{
      height: 46,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid var(--rule)',
      background: 'var(--paper)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), oklch(0.55 0.15 290))',
        }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--sans)' }}>
          <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Idea Validator</span>
          <span style={{ color: 'var(--ink-faint)' }}>/</span>
          <span>{crumb}</span>
        </div>
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Autosaved
      </span>
    </div>
  );
}

export default function App() {
  const [ideaText, setIdeaText] = useState('');
  const [activeLens, setActiveLens] = useState('skeptic');
  const [activeSentenceId, setActiveSentenceId] = useState(null);
  const [activeSentenceText, setActiveSentenceText] = useState(null);
  const [stopped, setStopped] = useState(false);
  const { thoughts, verdict, status, startStream, stop, reset } = useStream();

  const appState = deriveAppState(status, ideaText);
  const concernCount = thoughts.filter(t => t.category === 'concern').length;

  function handleRun() {
    setStopped(false);
    setActiveSentenceId(null);
    setActiveSentenceText(null);
    startStream(ideaText, activeLens);
  }

  function handleStop() {
    setStopped(true);
    stop();
  }

  function handleReset() {
    reset();
    setActiveSentenceId(null);
    setActiveSentenceText(null);
  }

  function handleLensChange(lens) {
    setActiveLens(lens);
    if (['done', 'error', 'nothing'].includes(appState)) {
      setStopped(false);
      setActiveSentenceId(null);
      setActiveSentenceText(null);
      startStream(ideaText, lens);
    }
  }

  function handleSentenceClick(id, text) {
    setActiveSentenceId(id);
    setActiveSentenceText(id === null ? null : (text ?? null));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--paper)' }}>
      <TopChrome ideaText={ideaText} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', flex: 1, minHeight: 0 }}>
        <IdeaForm
          ideaText={ideaText}
          onChange={setIdeaText}
          onReset={handleReset}
          activeLens={activeLens}
          onLensChange={handleLensChange}
          onRun={handleRun}
          onStop={handleStop}
          appState={appState}
          activeSentenceId={activeSentenceId}
          onSentenceClick={handleSentenceClick}
          concernCount={concernCount}
          lenses={LENSES}
        />
        <StreamPane
          thoughts={thoughts}
          verdict={verdict}
          appState={appState}
          activeSentenceId={activeSentenceId}
          activeSentenceText={activeSentenceText}
          onClearFocus={() => handleSentenceClick(null, null)}
          stopped={stopped}
          activeLens={activeLens}
        />
      </div>
    </div>
  );
}
