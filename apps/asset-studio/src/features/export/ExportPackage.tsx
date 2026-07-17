import { useEffect } from 'react';
import { useFlow } from '../../store/flowStore';
import { DEMO_CHARACTER } from '../../contracts/catalog';
import { FIXED_FPS } from '../../contracts/types';
import { SpriteAnimator } from '../../components/SpriteAnimator';
import './export.css';

type EngineId = 'cocos' | 'wechat' | 'douyin';

const ENGINES: Record<EngineId, { label: string; files: string[]; note: string }> = {
  cocos: {
    label: 'Cocos Creator',
    files: ['lamplighter_side.plist', 'lamplighter_side.png', 'anim.json', 'preview.gif', '导入说明.md'],
    note: 'SpriteFrame + AnimationClip · 拖入即播',
  },
  wechat: {
    label: '微信小游戏',
    files: ['lamplighter_side.png', 'atlas.json', 'preview.gif', 'remote/（CDN 目录）', '导入说明.md'],
    note: '远程加载目录 · 角色不进 4MB 主包',
  },
  douyin: {
    label: '抖音小游戏',
    files: ['lamplighter_side.png', 'atlas.json', 'preview.gif', '导入说明.md'],
    note: '分包 / CDN 远程加载',
  },
};

export function ExportPackage() {
  const open = useFlow((s) => s.exportOpen);
  const close = useFlow((s) => s.closeExport);
  const engine = useFlow((s) => s.engine);
  const setEngine = useFlow((s) => s.setEngine);
  const openPlay = useFlow((s) => s.openPlay);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  if (!open) return null;
  const eng = ENGINES[engine];

  return (
    <div className="ex-backdrop" onClick={close}>
      <div className="ex-panel" onClick={(e) => e.stopPropagation()}>
        <header className="ex-head">
          <div>
            <span className="eyebrow">导出资源包 · 交付即用</span>
            <h2>{DEMO_CHARACTER.name} · 资源包</h2>
          </div>
          <button className="ex-close" onClick={close} aria-label="关闭">
            ×
          </button>
        </header>

        <div className="ex-body">
          <div className="ex-preview">
            {(['idle', 'walk'] as const).map((a) => (
              <div className="ex-clip" key={a}>
                <SpriteAnimator frames={DEMO_CHARACTER.actions[a].frames} fps={FIXED_FPS} size={128} />
                <span className="ex-clip__tag">
                  {a} · 8 帧 · {FIXED_FPS} FPS 循环
                </span>
              </div>
            ))}
          </div>

          <div className="ex-side">
            <div className="ex-block">
              <span className="ex-label">目标引擎 / 平台</span>
              <div className="ex-seg">
                {(Object.keys(ENGINES) as EngineId[]).map((k) => (
                  <button key={k} className={engine === k ? 'on' : ''} onClick={() => setEngine(k)}>
                    {ENGINES[k].label}
                  </button>
                ))}
              </div>
              <span className="ex-note">{eng.note}</span>
            </div>

            <div className="ex-block">
              <span className="ex-label">包内容</span>
              <ul className="ex-files">
                {eng.files.map((f) => (
                  <li key={f}>
                    <span className="ex-files__ic">▪</span>
                    {f}
                  </li>
                ))}
                <li className="ex-files__meta">逐帧透明 PNG · Sprite Sheet · JSON（帧序/FPS/锚点/脚底线）</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="ex-foot">
          <span className="ex-tagline">放进项目即可播放 —— 无需手工去背、切帧、对齐、改名</span>
          <div className="ex-foot__btns">
            <button className="ex-download">下载资源包（.zip）</button>
            <button className="ex-play" onClick={openPlay}>
              ▶ 进引擎前 · WASD 验收
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
