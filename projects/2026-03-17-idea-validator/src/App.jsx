import { useState } from 'react';
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
