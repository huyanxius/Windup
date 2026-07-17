import { useEffect, useRef, useState } from 'react';
import { useFlow } from '../../store/flowStore';
import { DEMO_CHARACTER } from '../../contracts/catalog';
import { FIXED_FPS } from '../../contracts/types';
import { SpriteAnimator } from '../../components/SpriteAnimator';
import './play.css';

const SPEED = 230; // px/s
const CHAR_W = 132;

export function PlayStage() {
  const open = useFlow((s) => s.playOpen);
  const closePlay = useFlow((s) => s.closePlay);

  const stageRef = useRef<HTMLDivElement>(null);
  const held = useRef<Set<string>>(new Set());
  const autoDir = useRef(1);
  const autoRef = useRef(false);

  const [x, setX] = useState(80);
  const [facing, setFacing] = useState(1);
  const [moving, setMoving] = useState(false);
  const [auto, setAuto] = useState(false);
  const [handedOff, setHandedOff] = useState(false);

  autoRef.current = auto;

  // keyboard
  useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || e.key === 'ArrowLeft') held.current.add('left');
      else if (k === 'd' || e.key === 'ArrowRight') held.current.add('right');
      else if (e.key === 'Escape') closePlay();
      if (['a', 'd', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || e.key === 'ArrowLeft') held.current.delete('left');
      if (k === 'd' || e.key === 'ArrowRight') held.current.delete('right');
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      held.current.clear();
    };
  }, [open, closePlay]);

  // movement loop
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (t: number) => {
      if (last == null) last = t;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      let dir = 0;
      if (held.current.has('left')) dir -= 1;
      if (held.current.has('right')) dir += 1;
      if (autoRef.current && dir === 0) dir = autoDir.current;

      setX((prev) => {
        const w = stageRef.current?.clientWidth ?? 800;
        const min = 24;
        const max = w - CHAR_W - 24;
        let nx = prev + dir * SPEED * dt;
        if (nx <= min) {
          nx = min;
          autoDir.current = 1;
        } else if (nx >= max) {
          nx = max;
          autoDir.current = -1;
        }
        return nx;
      });
      setMoving(dir !== 0);
      if (dir !== 0) setFacing(dir > 0 ? 1 : -1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;

  const idle = DEMO_CHARACTER.actions.idle.frames;
  const walk = DEMO_CHARACTER.actions.walk.frames;

  return (
    <div className="pl-backdrop" onClick={closePlay}>
      <div className="pl-panel" onClick={(e) => e.stopPropagation()}>
        <header className="pl-head">
          <div>
            <span className="pl-kind">手感预览 · 进引擎前最后验收</span>
            <h2>{DEMO_CHARACTER.name} · 画布试玩</h2>
          </div>
          <button className="pl-close" onClick={closePlay} aria-label="关闭">
            ×
          </button>
        </header>

        <div className="pl-stage" ref={stageRef}>
          <div className="pl-lantern pl-lantern--1" />
          <div className="pl-lantern pl-lantern--2" />
          <div className="pl-ground" />
          <div
            className="pl-char"
            style={{ left: `${x}px`, transform: `scaleX(${facing})` }}
          >
            {moving ? (
              <SpriteAnimator frames={walk} fps={FIXED_FPS} size={CHAR_W} />
            ) : (
              <SpriteAnimator frames={idle} fps={FIXED_FPS} size={CHAR_W} />
            )}
          </div>
          <div className="pl-hint">
            <kbd>A</kbd> <kbd>D</kbd> / <kbd>←</kbd> <kbd>→</kbd> 移动　·　真实资产 · 8 FPS
          </div>
        </div>

        <footer className="pl-foot">
          <label className={`pl-auto ${auto ? 'on' : ''}`}>
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            自动巡走
          </label>
          <div className="pl-foot__spacer" />
          {handedOff ? (
            <span className="pl-done">✓ 已导出到 Cocos 项目（lamplighter.plist + 序列帧）</span>
          ) : (
            <button className="pl-engine" onClick={() => setHandedOff(true)}>
              手感满意 → 一键进 Cocos 项目
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
