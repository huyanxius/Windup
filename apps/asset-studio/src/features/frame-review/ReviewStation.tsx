import { useEffect, useState } from 'react';
import { useFlow } from '../../store/flowStore';
import { DEMO_CHARACTER } from '../../contracts/catalog';
import { FIXED_FPS } from '../../contracts/types';
import './review.css';

export function ReviewStation() {
  const action = useFlow((s) => s.reviewOpen);
  const marks = useFlow((s) => (action ? s.marks[action] : null));
  const closeReview = useFlow((s) => s.closeReview);
  const markFrame = useFlow((s) => s.markFrame);
  const regenFrame = useFlow((s) => s.regenFrame);
  const approveAllFrames = useFlow((s) => s.approveAllFrames);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [onion, setOnion] = useState(true);

  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [action]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setI((p) => (p + 1) % 8), 1000 / FIXED_FPS);
    return () => window.clearInterval(id);
  }, [playing]);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeReview();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeReview]);

  if (!action || !marks) return null;

  const def = DEMO_CHARACTER.actions[action];
  const frames = def.frames;
  const passCount = marks.filter((m) => m === 'pass').length;
  const rejectCount = marks.filter((m) => m === 'reject').length;
  const allPass = passCount === 8;

  const step = (d: number) => {
    setPlaying(false);
    setI((p) => (p + d + 8) % 8);
  };
  const decide = (mark: 'pass' | 'reject') => {
    markFrame(action, i, mark);
    if (mark === 'pass') {
      setPlaying(false);
      setI((p) => (p + 1) % 8);
    }
  };

  return (
    <div className="rv-backdrop" onClick={closeReview}>
      <div className="rv-panel" onClick={(e) => e.stopPropagation()}>
        <header className="rv-head">
          <div className="rv-titles">
            <span className="rv-kind">逐帧审核 · 导出门禁</span>
            <h2>
              {DEMO_CHARACTER.name} · {def.label}
            </h2>
          </div>
          <div className={`rv-gate ${allPass ? 'is-pass' : ''}`}>
            <div className="rv-gate__num">{passCount}/8</div>
            <div className="rv-gate__state">
              {allPass ? '✓ 全部通过 · 导出已解锁' : `还差 ${8 - passCount} 帧${rejectCount ? ` · ${rejectCount} 帧待重生成` : ''}`}
            </div>
          </div>
          <button className="rv-close" onClick={closeReview} aria-label="关闭">
            ×
          </button>
        </header>

        <div className="rv-body">
          <div className="rv-stage-col">
            <div className="rv-stage">
              {onion && !playing && (
                <>
                  <img className="rv-ghost rv-ghost--prev" src={frames[(i + 7) % 8]} alt="" />
                  <img className="rv-ghost rv-ghost--next" src={frames[(i + 1) % 8]} alt="" />
                </>
              )}
              <img className="rv-current" src={frames[i]} alt="" />
              <span className={`rv-stamp rv-stamp--${marks[i]}`}>
                {marks[i] === 'pass'
                  ? '通过'
                  : marks[i] === 'reject'
                    ? '退回'
                    : marks[i] === 'regenerating'
                      ? '重生成中'
                      : '待审'}
              </span>
            </div>
            <div className="rv-controls">
              <button onClick={() => step(-1)} title="上一帧">◀</button>
              <button className="rv-play" onClick={() => setPlaying((p) => !p)}>
                {playing ? '⏸ 暂停' : '▶ 播放'}
              </button>
              <button onClick={() => step(1)} title="下一帧">▶</button>
              <label className={`rv-onion ${onion ? 'on' : ''}`}>
                <input type="checkbox" checked={onion} onChange={(e) => setOnion(e.target.checked)} />
                洋葱皮
              </label>
              <span className="rv-meta">
                8 FPS · 帧 {i + 1}/8 · {(i / FIXED_FPS).toFixed(2)}s
              </span>
            </div>
          </div>

          <div className="rv-side">
            <div className="rv-frameinfo">
              当前帧 <b>#{String(i + 1).padStart(2, '0')}</b>
            </div>
            <div className="rv-qc">
              <div className="rv-qc__title">
                自动质检（本动作） <b>{def.qc.length}/{def.qc.length} 通过</b>
              </div>
              {def.qc.map((c) => (
                <div className="rv-qc__row" key={c.label}>
                  <span className={`rv-qc__dot ${c.pass ? 'ok' : 'bad'}`} />
                  <span className="rv-qc__label">{c.label}</span>
                  <span className="rv-qc__detail">{c.detail}</span>
                </div>
              ))}
              <p className="rv-note-hint">几何质检只保证对齐/连续；步态、解剖、风格一致性靠你逐帧确认。</p>
            </div>
            <textarea className="rv-note" placeholder="这一帧哪里不对…（退回时附给单帧重生成）" />
            {marks[i] === 'reject' && (
              <button className="rv-regen" onClick={() => regenFrame(action, i)}>
                ✦ 携相邻帧上下文 · 重生成此帧
              </button>
            )}
            {marks[i] === 'regenerating' && (
              <div className="rv-regenning">
                <span className="rv-spin" /> 重生成中… 携带相邻帧上下文
              </div>
            )}
            <div className="rv-decide">
              <button
                className="rv-reject"
                disabled={marks[i] === 'regenerating'}
                onClick={() => decide('reject')}
              >
                退回此帧
              </button>
              <button
                className="rv-pass"
                disabled={marks[i] === 'regenerating'}
                onClick={() => decide('pass')}
              >
                通过此帧
              </button>
            </div>
          </div>
        </div>

        <footer className="rv-film">
          <div className="rv-strip">
            {frames.map((f, idx) => (
              <button
                key={idx}
                className={`rv-cell is-${marks[idx]} ${idx === i ? 'is-active' : ''}`}
                onClick={() => {
                  setPlaying(false);
                  setI(idx);
                }}
              >
                <img src={f} alt="" />
                <span className="rv-cell__idx">{idx + 1}</span>
                <span className="rv-cell__dot" />
              </button>
            ))}
          </div>
          <button className="rv-approveall" onClick={() => approveAllFrames(action)}>
            全部通过
          </button>
        </footer>
      </div>
    </div>
  );
}
