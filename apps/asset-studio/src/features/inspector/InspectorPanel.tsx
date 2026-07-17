import { useFlow, gateOpen } from '../../store/flowStore';
import type { WData } from '../../contracts/types';
import { SpriteAnimator } from '../../components/SpriteAnimator';
import { DEMO_CHARACTER } from '../../contracts/catalog';
import { SettingsForm } from './SettingsForm';
import { SourceEntry } from './SourceEntry';
import './inspector.css';

const COCOS_CONFIG = `{
  "character": "lamplighter",
  "view": "side",
  "fps": 8,
  "anchor": { "x": 128, "y": 238 },
  "actions": {
    "idle": { "frames": 8, "loop": true },
    "walk": { "frames": 8, "loop": true }
  },
  "sheet": "lamplighter_side.png",
  "target": "cocos-creator | wechat-minigame"
}`;

const KIND_LABEL: Record<WData['kind'], string> = {
  source: '角色来源',
  master: '角色母版',
  animation: '动作实例',
  review: '逐帧审核',
  promote: '采用 / 导出',
};

export function InspectorPanel() {
  const node = useFlow((s) => s.nodes.find((n) => n.id === s.selectedId));
  const openReview = useFlow((s) => s.openReview);
  const openPlay = useFlow((s) => s.openPlay);
  const openExport = useFlow((s) => s.openExport);
  const pickCandidate = useFlow((s) => s.pickCandidate);
  const marks = useFlow((s) => s.marks);
  const gate = gateOpen(marks);
  const approvedCount =
    marks.idle.filter((m) => m === 'pass').length + marks.walk.filter((m) => m === 'pass').length;

  if (!node) {
    return (
      <aside className="inspector">
        <div className="insp-idle">
          <span className="eyebrow">当前角色</span>
          <div className="insp-idle__char">
            <img src={DEMO_CHARACTER.master} alt="" />
            <div>
              <b>{DEMO_CHARACTER.name}</b>
              <span>{DEMO_CHARACTER.brief}</span>
            </div>
          </div>

          <span className="eyebrow">资产工作流</span>
          <ol className="insp-pipeline">
            <li>
              <span className="num">01</span>角色来源
            </li>
            <li>
              <span className="num">02</span>角色母版 · 身份锁定
            </li>
            <li>
              <span className="num">03</span>动作 idle / walk
            </li>
            <li>
              <span className="num">04</span>逐帧审核 · 导出门禁
            </li>
            <li>
              <span className="num">05</span>采用 · 进 Cocos
            </li>
          </ol>

          <p className="insp-idle__hint">
            在画布上点选任一节点 → 这里显示它的帧 / 几何质检 / 生成溯源。
          </p>
        </div>
      </aside>
    );
  }

  const d = node.data as WData;
  const ready = d.status === 'done' || !!d.revealed;

  return (
    <aside className="inspector">
      <header className="insp-head">
        <span className="insp-kind">{KIND_LABEL[d.kind]}</span>
        <h2>{d.label}</h2>
        <span className={`insp-status is-${d.status}`}>
          {d.status === 'done'
            ? '已完成'
            : d.status === 'running'
              ? '生成中'
              : d.status === 'candidates'
                ? '候选待选'
                : '待生成'}
        </span>
      </header>

      {d.kind === 'source' && (
        <section className="insp-sec">
          <SourceEntry />
        </section>
      )}

      {d.kind === 'master' && (
        <section className="insp-sec">
          {d.status === 'candidates' ? (
            <div className="insp-cands">
              <p className="insp-brief">
                选一张作为<b>身份基准</b> —— 之后所有动作帧都以它为条件生成，保证跨动作一致。
              </p>
              <div className="insp-cands__grid">
                {(d.candidates ?? []).map((c, i) => (
                  <div className="insp-cand" key={i}>
                    <img src={c} alt="" />
                    <span className="insp-cand__gate">✓ 侧视达标</span>
                    <button className="insp-cand__pick" onClick={() => pickCandidate(node.id, c)}>
                      选这张
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : ready ? (
            <>
              {d.image && <img className="insp-hero" src={d.image} alt="" />}
              {d.locked && <div className="insp-locked">🔒 母版已锁定 · 身份基准</div>}
              <ProvenanceRows
                rows={[
                  ['模型', 'gemini-2.5-flash-image'],
                  ['视角', '横版侧视 · 朝右'],
                  ['身份约束', '已锁定 · 后续帧比对基准'],
                ]}
              />
            </>
          ) : (
            <SettingsForm nodeId={node.id} kind="master" />
          )}
        </section>
      )}

      {d.kind === 'animation' && (
        <section className="insp-sec">
          {ready ? (
            <>
              <div className="insp-stage">
                <SpriteAnimator frames={d.frames ?? []} fps={d.fps} size={160} />
              </div>
              <div className="insp-meta">
                <span>{d.frames?.length ?? 0} 帧</span>
                <span>· 8 FPS 锁定</span>
                <span>· {d.loop ? '循环' : '单次'}</span>
              </div>
              <div className="insp-filmstrip">
                {(d.frames ?? []).map((f, i) => (
                  <div className="insp-cell" key={i}>
                    <img src={f} alt="" />
                    <span className="insp-cell__dot" />
                  </div>
                ))}
              </div>
              <div className="insp-qc">
                <div className="insp-qc__title">
                  自动质检 <b>{d.qc?.length ?? 0}/{d.qc?.length ?? 0} 通过</b>
                </div>
                {(d.qc ?? []).map((c) => (
                  <div className="insp-qc__row" key={c.label}>
                    <span className={`insp-qc__dot ${c.pass ? 'ok' : 'bad'}`} />
                    <span className="insp-qc__label">{c.label}</span>
                    <span className="insp-qc__detail">{c.detail}</span>
                  </div>
                ))}
                <p className="insp-note">几何质检只保证对齐 / 连续；步态、解剖、风格一致性靠逐帧人工确认。</p>
              </div>
              <button className="insp-review" onClick={() => d.action && openReview(d.action)}>
                ▶ 打开逐帧检查台
              </button>
            </>
          ) : (
            <SettingsForm nodeId={node.id} kind="animation" actionLabel={d.label} />
          )}
        </section>
      )}

      {d.kind === 'review' && (
        <section className="insp-sec">
          <div className="insp-gate">
            <div className="insp-gate__num">
              {d.approved}/{d.total}
            </div>
            <div className="insp-gate__label">帧通过 · {ready ? '导出已解锁' : '未解锁'}</div>
          </div>
          <p className="insp-note">规则：任一帧未通过，该动作不可导出，不产出残缺包。</p>
        </section>
      )}

      {d.kind === 'promote' && (
        <section className="insp-sec">
          {gate ? (
            <>
              <div className="insp-atlas">
                {(['idle', 'walk'] as const).map((a) => (
                  <div className="insp-atlas__row" key={a}>
                    <span className="insp-atlas__tag">{a}</span>
                    <div className="insp-atlas__strip">
                      {DEMO_CHARACTER.actions[a].frames.map((f, i) => (
                        <img key={i} src={f} alt="" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <pre className="insp-code">{COCOS_CONFIG}</pre>
              <ul className="insp-list">
                <li>逐帧透明 PNG · Sprite Sheet 图集</li>
                <li>JSON metadata（帧序 / FPS / 锚点 / 脚底线）</li>
                <li>Cocos / 微信小游戏 导入说明</li>
              </ul>
              <div className="insp-exportbtns">
                <button className="insp-review" onClick={openExport}>
                  打开导出资源包 →
                </button>
                <button className="insp-export2" onClick={openPlay}>
                  ▶ 手感预览 (WASD)
                </button>
              </div>
            </>
          ) : (
            <div className="insp-gatelock">
              <div className="insp-gatelock__icon">🔒</div>
              <b>导出门禁未解锁</b>
              <span>
                逐帧审核 <span className="num">{approvedCount}</span>/16 通过 · 还差{' '}
                <span className="num">{16 - approvedCount}</span> 帧
              </span>
            </div>
          )}
        </section>
      )}
    </aside>
  );
}

function ProvenanceRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="insp-prov">
      {rows.map(([k, v]) => (
        <div className="insp-prov__row" key={k}>
          <span>{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}
