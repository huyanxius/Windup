import { useEffect } from 'react';
import { motion } from 'motion/react';
import { CreationFlowCanvas } from './features/creation-flow/CreationFlowCanvas';
import { InspectorPanel } from './features/inspector/InspectorPanel';
import { ReviewStation } from './features/frame-review/ReviewStation';
import { PlayStage } from './features/play/PlayStage';
import { ExportPackage } from './features/export/ExportPackage';
import { useFlow } from './store/flowStore';
import { DEMO_CHARACTER } from './contracts/catalog';
import './App.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } } };
const rise = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.44, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function App() {
  const runAll = useFlow((s) => s.runAll);
  const reset = useFlow((s) => s.reset);
  const running = useFlow((s) => s.running);

  // deep-link to a demo state (roadshow convenience + screenshot QA)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auto = params.get('auto');
    if (auto === 'run') runAll();
    if (auto === 'review') useFlow.getState().openReview('walk');
    if (auto === 'reject') {
      useFlow.getState().openReview('walk');
      useFlow.getState().markFrame('walk', 0, 'reject');
    }
    if (auto === 'play') useFlow.getState().openPlay();
    if (auto === 'export') useFlow.getState().openExport();
    if (auto === 'master') {
      useFlow.getState().select('n_master');
      useFlow.getState().runNode('n_master');
    }
    const sel = params.get('select');
    if (sel) useFlow.getState().select(sel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div className="app" variants={container} initial="hidden" animate="show">
      <motion.header className="topbar" variants={rise}>
        <div className="brand">
          <span className="brand__mark">W</span>
          <span className="brand__name">Windup</span>
          <span className="brand__sub">Asset Studio</span>
        </div>
        <div className="topbar__center">
          {DEMO_CHARACTER.name} · 手绘风 · 横版侧视
        </div>
        <div className="topbar__actions">
          <button className="btn btn--ghost" onClick={reset} disabled={running}>
            重置
          </button>
          <button className="btn btn--primary" onClick={runAll} disabled={running}>
            ▶ 演示全流程
          </button>
        </div>
      </motion.header>
      <motion.main className="main" variants={rise}>
        <CreationFlowCanvas />
        <InspectorPanel />
      </motion.main>
      <ReviewStation />
      <PlayStage />
      <ExportPackage />
    </motion.div>
  );
}
