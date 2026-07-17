import { useFlow } from '../../store/flowStore';
import { DEMO_CHARACTER } from '../../contracts/catalog';
import './source.css';

// L0 / entry — how the user starts (ms1-workflow §三 生成路径):
// 从0描述 / 上传参考图 / 已有资产(需资产库).
export function SourceEntry() {
  const mode = useFlow((s) => s.sourceMode);
  const setMode = useFlow((s) => s.setSourceMode);
  const reference = useFlow((s) => s.reference);
  const setReference = useFlow((s) => s.setReference);
  const desc = useFlow((s) => (s.settings.n_master?.description as string) ?? '');
  const setSetting = useFlow((s) => s.setSetting);

  return (
    <div className="src">
      <span className="eyebrow">起点 · 生成入口</span>

      <div className="src-seg">
        <button className={mode === 'describe' ? 'on' : ''} onClick={() => setMode('describe')}>
          文字描述 <em>从零</em>
        </button>
        <button className={mode === 'upload' ? 'on' : ''} onClick={() => setMode('upload')}>
          上传参考图
        </button>
        <button className="src-dim" disabled title="需资产库">
          已有资产
        </button>
      </div>

      {mode === 'describe' ? (
        <label className="src-field">
          <span className="src-label">角色描述 —— 母版将据此从零生成</span>
          <textarea
            rows={4}
            value={desc}
            onChange={(e) => setSetting('n_master', { description: e.target.value })}
          />
        </label>
      ) : (
        <div className="src-upload">
          {reference ? (
            <div className="src-ref">
              <img src={reference} alt="" />
              <div className="src-ref__meta">
                <b>参考图已就绪</b>
                <span>母版将基于此参考图生成</span>
                <button className="src-clear" onClick={() => setReference(null)}>
                  移除
                </button>
              </div>
            </div>
          ) : (
            <button className="src-drop" onClick={() => setReference(DEMO_CHARACTER.master)}>
              <span className="src-drop__icon">⤒</span>
              <span>拖入或点击选择参考图</span>
              <span className="src-drop__hint">PNG / JPG · 单角色 · 建议侧视</span>
            </button>
          )}
          <div className="src-tune">
            <span className="src-label">风格微调（可选）</span>
            <div className="src-chips">
              <span>像素化</span>
              <span>改发色</span>
              <span>手绘化</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
