import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { WData } from '../../contracts/types';
import { useFlow, gateOpen } from '../../store/flowStore';
import { SpriteAnimator } from '../../components/SpriteAnimator';
import './nodes.css';

export function FlowNode({ id, data, selected }: NodeProps) {
  const d = data as WData;
  const runNode = useFlow((s) => s.runNode);
  const openReview = useFlow((s) => s.openReview);
  const openExport = useFlow((s) => s.openExport);
  const sourceMode = useFlow((s) => s.sourceMode);
  const reference = useFlow((s) => s.reference);
  const marks = useFlow((s) => s.marks);
  const gate = gateOpen(marks);
  const hasTarget = d.kind !== 'source';
  const hasSource = d.kind !== 'promote';
  const revealed = d.status === 'done' || !!d.revealed;

  return (
    <div className={`wnode wnode--${d.kind} is-${d.status}${selected ? ' is-selected' : ''}`}>
      {hasTarget && <Handle type="target" position={Position.Left} />}

      <div className="wnode__head">
        <span className="wnode__title">{d.label}</span>
        <span className={`sdot sdot--${d.status}`} />
      </div>
      {d.sub && <div className="wnode__sub">{d.sub}</div>}

      <div className="wnode__body">
        <NodeBody d={d} revealed={revealed} sourceMode={sourceMode} reference={reference} />
        {d.status === 'running' && <span className="wripple" aria-hidden />}
      </div>

      <div className="wnode__foot">
        {d.kind !== 'source' && d.kind !== 'promote' && d.status === 'idle' && (
          <button
            className="wnode__btn"
            onClick={(e) => {
              e.stopPropagation();
              runNode(id);
            }}
          >
            ✦ 生成
          </button>
        )}
        {d.kind === 'promote' &&
          d.status === 'idle' &&
          (gate ? (
            <button
              className="wnode__btn"
              onClick={(e) => {
                e.stopPropagation();
                runNode(id);
                openExport();
              }}
            >
              ✦ 采用 / 导出
            </button>
          ) : (
            <span className="wnode__locked">🔒 待全部通过</span>
          ))}
        {d.kind === 'promote' && d.status === 'done' && (
          <button
            className="wnode__review"
            onClick={(e) => {
              e.stopPropagation();
              openExport();
            }}
          >
            查看导出包 →
          </button>
        )}
        {d.status === 'running' && <span className="wnode__hint">生成中…</span>}
        {d.status === 'candidates' && <span className="wnode__hint">选择候选 →</span>}
        {d.status === 'done' && d.kind === 'animation' && (
          <button
            className="wnode__review"
            onClick={(e) => {
              e.stopPropagation();
              if (d.action) openReview(d.action);
            }}
          >
            逐帧审核 →
          </button>
        )}
        {d.status === 'done' && d.kind !== 'source' && d.kind !== 'animation' && d.kind !== 'promote' && (
          <span className="wnode__ok">✓ 完成</span>
        )}
        {d.kind === 'source' && <span className="wnode__hint">已就绪</span>}
      </div>

      {hasSource && <Handle type="source" position={Position.Right} />}
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="wph">
      <span className="wph__grid" />
      <span className="wph__label">{label}</span>
    </div>
  );
}

function NodeBody({
  d,
  revealed,
  sourceMode,
  reference,
}: {
  d: WData;
  revealed: boolean;
  sourceMode?: 'describe' | 'upload';
  reference?: string | null;
}) {
  if (d.kind === 'source') {
    const upload = sourceMode === 'upload';
    const img = upload ? reference : (d.image as string);
    return (
      <div className="wsource">
        {img ? (
          <img className="wthumb" src={img} alt="" />
        ) : (
          <div className="wthumb wthumb--empty">⤒</div>
        )}
        <p className="wbrief">
          <b className="wsource__tag">{upload ? '参考图' : '文字描述'}</b>
          {upload ? (reference ? '参考图已就绪' : '待上传参考图') : (d.brief as string)}
        </p>
      </div>
    );
  }

  if (d.kind === 'master') {
    if (d.status === 'candidates') {
      return (
        <div className="wcand reveal">
          <div className="wcand__strip">
            {(d.candidates ?? []).map((c, i) => (
              <img key={i} src={c} alt="" />
            ))}
          </div>
          <span className="wcand__hint">{d.candidates?.length ?? 0} 候选 · 右栏选择</span>
        </div>
      );
    }
    return revealed ? (
      <div className="wmaster-wrap reveal">
        <img className="wmaster" src={d.image} alt="" />
        {d.locked && <span className="wlock">🔒 已锁定</span>}
      </div>
    ) : (
      <Placeholder label="母版待生成" />
    );
  }

  if (d.kind === 'animation') {
    return revealed ? (
      <div className="wanim reveal">
        <SpriteAnimator frames={d.frames ?? []} fps={d.fps} size={104} />
        <div className="wfilmstrip">
          {(d.frames ?? []).map((f, i) => (
            <img key={i} src={f} alt="" />
          ))}
        </div>
      </div>
    ) : (
      <Placeholder label={`${d.label}待生成`} />
    );
  }

  if (d.kind === 'review') {
    return revealed ? (
      <div className="wreview reveal">
        <div className="wreview__count">
          {d.approved}/{d.total} 帧通过
        </div>
        <div className="wticks">
          {Array.from({ length: d.total ?? 16 }, (_, i) => (
            <span key={i} className={`wtick ${i < (d.approved ?? 0) ? 'is-pass' : ''}`} />
          ))}
        </div>
      </div>
    ) : (
      <Placeholder label="等待候选帧" />
    );
  }

  // promote
  return revealed ? (
    <div className="wpromote reveal">
      <div className="wchip">Cocos 包</div>
      <div className="wpromote__meta">图集 + JSON + 锚点</div>
    </div>
  ) : (
    <Placeholder label="全过后解锁" />
  );
}
