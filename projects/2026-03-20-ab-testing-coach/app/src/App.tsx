
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ExperimentConfiguration from './pages/ExperimentConfiguration';
import DecisionEngine from './pages/DecisionEngine';
import HypothesisBuilder from './pages/HypothesisBuilder';
import ExperimentSimulator from './pages/ExperimentSimulator';
import MetricsDashboard from './pages/MetricsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Default redirect to experiments */}
          <Route index element={<Navigate to="/experiments" replace />} />

          <Route path="experiments" element={<ExperimentConfiguration />} />
          <Route path="decision-engine" element={<DecisionEngine />} />
          <Route path="hypotheses" element={<HypothesisBuilder />} />
          <Route path="simulator" element={<ExperimentSimulator />} />
          <Route path="metrics" element={<MetricsDashboard />} />

          {/* Catch-all route to experiments */}
          <Route path="*" element={<Navigate to="/experiments" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;