// The curated, fixed 6-node "creation flow" graph. Pre-placed (no free-form wiring).
// source -> master -> [idle ‖ walk] -> review -> promote
import type { Edge, Node } from '@xyflow/react';
import type { WData } from '../../contracts/types';
import { FIXED_FPS, type QcCheck } from '../../contracts/types';
import { DEMO_CHARACTER as C } from '../../contracts/catalog';

const anim = (action: 'idle' | 'walk') => {
  const a = C.actions[action];
  return {
    action,
    frames: a.frames,
    fps: FIXED_FPS,
    loop: a.loop,
    qc: a.qc as QcCheck[],
    total: a.frames.length,
    approved: a.frames.length,
  };
};

export function buildPreset(): { nodes: Node<WData>[]; edges: Edge[] } {
  const nodes: Node<WData>[] = [
    {
      id: 'n_source', type: 'source', position: { x: 0, y: 170 },
      data: { kind: 'source', label: '角色来源', sub: '描述 / 参考图', status: 'done', revealed: true,
        image: C.master, brief: C.brief },
    },
    {
      id: 'n_master', type: 'master', position: { x: 285, y: 170 },
      data: { kind: 'master', label: '角色母版', sub: '定妆 · 身份锁定', status: 'idle', image: C.master },
    },
    {
      id: 'n_idle', type: 'animation', position: { x: 605, y: 20 },
      data: { kind: 'animation', label: '待机动画', sub: 'idle · 8 帧 · 8FPS', status: 'idle', ...anim('idle') },
    },
    {
      id: 'n_walk', type: 'animation', position: { x: 605, y: 330 },
      data: { kind: 'animation', label: '行走动画', sub: 'walk · 8 帧 · 8FPS', status: 'idle', ...anim('walk') },
    },
    {
      id: 'n_review', type: 'review', position: { x: 940, y: 170 },
      data: { kind: 'review', label: '逐帧审核', sub: '门禁 · 全过才导出', status: 'idle', approved: 0, total: 16 },
    },
    {
      id: 'n_promote', type: 'promote', position: { x: 1230, y: 170 },
      data: { kind: 'promote', label: '采用 / 导出', sub: 'Cocos · 微信小游戏', status: 'idle' },
    },
  ];

  const e = (id: string, source: string, target: string): Edge => ({
    id, source, target, type: 'default',
    data: { confirmed: false },
    style: { stroke: '#c9bfa8', strokeWidth: 2, strokeDasharray: '7 6' },
  });

  const edges: Edge[] = [
    e('e_s_m', 'n_source', 'n_master'),
    e('e_m_i', 'n_master', 'n_idle'),
    e('e_m_w', 'n_master', 'n_walk'),
    e('e_i_r', 'n_idle', 'n_review'),
    e('e_w_r', 'n_walk', 'n_review'),
    e('e_r_p', 'n_review', 'n_promote'),
  ];

  return { nodes, edges };
}
