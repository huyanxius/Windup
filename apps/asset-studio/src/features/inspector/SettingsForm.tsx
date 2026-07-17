import { useFlow } from '../../store/flowStore';
import { IMAGE_MODELS, VIEW_LABELS, type ViewId } from '../../contracts/types';
import './settings.css';

interface Props {
  nodeId: string;
  kind: 'master' | 'animation';
  actionLabel?: string;
}

export function SettingsForm({ nodeId, kind, actionLabel }: Props) {
  const s = useFlow((st) => st.settings[nodeId]) ?? {};
  const setSetting = useFlow((st) => st.setSetting);
  const runNode = useFlow((st) => st.runNode);
  const set = (patch: Partial<typeof s>) => setSetting(nodeId, patch);

  return (
    <div className="sf">
      <span className="eyebrow">生成设置</span>

      {kind === 'master' ? (
        <>
          <Field label="角色名称">
            <input value={s.name ?? ''} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="角色描述">
            <textarea rows={3} value={s.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <div className="sf-row">
            <Field label="风格">
              <input value={s.style ?? ''} onChange={(e) => set({ style: e.target.value })} />
            </Field>
            <Field label="配色">
              <input value={s.palette ?? ''} onChange={(e) => set({ palette: e.target.value })} />
            </Field>
          </div>
        </>
      ) : (
        <>
          <div className="sf-row">
            <Field label="视角">
              <select value={s.view ?? 'side'} onChange={(e) => set({ view: e.target.value as ViewId })}>
                {(Object.keys(VIEW_LABELS) as ViewId[]).map((v) => (
                  <option key={v} value={v}>
                    {VIEW_LABELS[v]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="动作">
              <div className="sf-static">{actionLabel}</div>
            </Field>
          </div>

          <Field label="生成模式">
            <div className="sf-seg">
              <button className={s.mode !== 'single' ? 'on' : ''} onClick={() => set({ mode: 'full' })}>
                一致性动作条 · 8 帧
              </button>
              <button className={s.mode === 'single' ? 'on' : ''} onClick={() => set({ mode: 'single' })}>
                仅修复单帧
              </button>
            </div>
          </Field>

          <div className="sf-row">
            <Field label="帧数">
              <input
                type="number"
                min={2}
                max={16}
                value={s.frames ?? 8}
                onChange={(e) => set({ frames: Number(e.target.value) })}
              />
            </Field>
            <Field label="FPS">
              <div className="sf-static sf-locked">8 · 锁定</div>
            </Field>
            <Field label="循环">
              <button className={`sf-toggle ${s.loop ? 'on' : ''}`} onClick={() => set({ loop: !s.loop })}>
                {s.loop ? '循环' : '单次'}
              </button>
            </Field>
          </div>

          <Field label="提示词（生成指令）">
            <textarea rows={2} value={s.prompt ?? ''} onChange={(e) => set({ prompt: e.target.value })} />
          </Field>
        </>
      )}

      <Field label="模型">
        <select value={s.model ?? IMAGE_MODELS[0]} onChange={(e) => set({ model: e.target.value })}>
          {IMAGE_MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Field>

      <div className="sf-foot">
        <span className="sf-cost">
          预估消耗 <b className="num">{s.costEst ?? 1}</b> 次生成
        </span>
        <button className="sf-generate" onClick={() => runNode(nodeId)}>
          ✦ {kind === 'master' ? '生成母版' : '生成动作'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="sf-field">
      <span className="sf-label">{label}</span>
      {children}
    </label>
  );
}
