import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import type { WData, ActionId, ReviewMark, GenSettings } from '../contracts/types';
import { buildPreset } from '../features/creation-flow/preset';
import { MASTER_CANDIDATES } from '../contracts/catalog';

const GEN_DEFAULTS: Record<string, GenSettings> = {
  n_master: {
    name: '点灯人',
    description: '雾港的提灯少年，约十六岁，清瘦，黑发，深蓝旧外套，暗红围巾，手提黄铜提灯',
    style: '手绘风',
    palette: '黑发 · 深蓝外套 · 暗红围巾点缀',
    model: 'gemini-2.5-flash-image',
    costEst: 3,
  },
  n_idle: {
    view: 'side', frames: 8, fps: 8, loop: true, mode: 'full',
    prompt: '呼吸起伏，提灯随呼吸轻摆，脚底始终对齐基线',
    model: 'gemini-2.5-flash-image', costEst: 1,
  },
  n_walk: {
    view: 'side', frames: 8, fps: 8, loop: true, mode: 'full',
    prompt: '保留围巾的运动节奏，脚底始终对齐基线，重心自然过渡',
    model: 'gemini-2.5-flash-image', costEst: 1,
  },
};
const cloneDefaults = () => JSON.parse(JSON.stringify(GEN_DEFAULTS)) as Record<string, GenSettings>;

// export gate: every frame of every action must pass before 采用/导出 unlocks
export const gateOpen = (marks: Record<ActionId, ReviewMark[]>) =>
  marks.idle.filter((m) => m === 'pass').length === 8 &&
  marks.walk.filter((m) => m === 'pass').length === 8;

const ACTIVE = { stroke: '#f0a52b', strokeWidth: 2.6 };
const SOLID = { stroke: '#f0a52b', strokeWidth: 2.6 };

const FRAMES_PER_ACTION = 8;
const initMarks = (): ReviewMark[] => Array(FRAMES_PER_ACTION).fill('pending');

interface FlowState {
  nodes: Node<WData>[];
  edges: Edge[];
  selectedId: string | null;
  running: boolean;

  // per-frame review station
  reviewOpen: ActionId | null;
  marks: Record<ActionId, ReviewMark[]>;

  // WASD play / engine-handoff finale
  playOpen: boolean;

  // F 导出资源包 · 目标引擎
  exportOpen: boolean;
  engine: 'cocos' | 'wechat' | 'douyin';
  openExport: () => void;
  closeExport: () => void;
  setEngine: (e: 'cocos' | 'wechat' | 'douyin') => void;

  // L0/entry — how the user starts (ms1-workflow §三 生成路径)
  sourceMode: 'describe' | 'upload';
  reference: string | null;
  setSourceMode: (m: 'describe' | 'upload') => void;
  setReference: (url: string | null) => void;

  // user-editable generation settings, keyed by node id
  settings: Record<string, GenSettings>;
  setSetting: (id: string, patch: Partial<GenSettings>) => void;

  onNodesChange: (c: NodeChange[]) => void;
  onEdgesChange: (c: EdgeChange[]) => void;
  onConnect: (c: Connection) => void;
  select: (id: string | null) => void;
  confirmEdge: (id: string) => void;
  runNode: (id: string) => void;
  pickCandidate: (id: string, url: string) => void;
  runAll: () => void;
  reset: () => void;

  openReview: (a: ActionId) => void;
  closeReview: () => void;
  markFrame: (a: ActionId, i: number, mark: ReviewMark) => void;
  regenFrame: (a: ActionId, i: number) => void;
  approveAllFrames: (a: ActionId) => void;
  syncGate: () => void;

  openPlay: () => void;
  closePlay: () => void;
}

function patch(n: Node<WData>, p: Partial<WData>): Node<WData> {
  return { ...n, data: { ...n.data, ...p } };
}
function confirmStyle(e: Edge): Edge {
  return { ...e, animated: false, data: { ...e.data, confirmed: true }, style: SOLID };
}

const preset = buildPreset();

export const useFlow = create<FlowState>((set, get) => ({
  nodes: preset.nodes,
  edges: preset.edges,
  selectedId: null,
  running: false,
  reviewOpen: null,
  marks: { idle: initMarks(), walk: initMarks() },
  playOpen: false,
  exportOpen: false,
  engine: 'cocos',
  sourceMode: 'describe',
  reference: null,
  settings: cloneDefaults(),

  setSourceMode: (m) => set({ sourceMode: m }),
  setReference: (url) => set({ reference: url }),

  setSetting: (id, patch) =>
    set({ settings: { ...get().settings, [id]: { ...get().settings[id], ...patch } } }),

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes as never, get().nodes) as Node<WData>[] }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes as never, get().edges) }),
  onConnect: (_c: Connection) => {},

  select: (id) => set({ selectedId: id }),

  confirmEdge: (id) =>
    set({ edges: get().edges.map((e) => (e.id === id ? confirmStyle(e) : e)) }),

  runNode: (id) => {
    // export gate — 采用/导出 must not run until every frame passed review
    if (id === 'n_promote' && !gateOpen(get().marks)) return;
    const isMaster = get().nodes.find((n) => n.id === id)?.data.kind === 'master';
    const incoming = new Set(get().edges.filter((e) => e.target === id).map((e) => e.id));
    set({
      nodes: get().nodes.map((n) => (n.id === id ? patch(n, { status: 'running' }) : n)),
      edges: get().edges.map((e) => (incoming.has(e.id) ? { ...e, animated: true, style: ACTIVE } : e)),
    });
    window.setTimeout(() => {
      set({
        nodes: get().nodes.map((n) =>
          n.id === id
            ? isMaster
              ? // master gen yields candidates; user must PICK one to lock identity
                patch(n, { status: 'candidates', candidates: MASTER_CANDIDATES })
              : patch(n, { status: 'done', revealed: true, ...(id === 'n_review' ? { approved: 16, total: 16 } : {}) })
            : n,
        ),
        edges: get().edges.map((e) => (incoming.has(e.id) ? confirmStyle(e) : e)),
      });
    }, 1100);
  },

  // pick a master candidate → lock identity basis for all downstream frames
  pickCandidate: (id, url) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id
          ? patch(n, { status: 'done', revealed: true, image: url, locked: true, candidates: undefined })
          : n,
      ),
    }),

  runAll: () => {
    get().reset();
    set({ running: true });
    // master → candidates → auto-pick (lock), then downstream stages
    get().runNode('n_master');
    window.setTimeout(() => get().pickCandidate('n_master', MASTER_CANDIDATES[0]), 1350);
    const later = [['n_idle', 'n_walk'], ['n_review'], ['n_promote']];
    later.forEach((stage, i) => {
      window.setTimeout(() => {
        stage.forEach((nid) => get().runNode(nid));
        if (stage.includes('n_review')) {
          set({ marks: { idle: Array(8).fill('pass'), walk: Array(8).fill('pass') } });
        }
        if (i === later.length - 1) window.setTimeout(() => set({ running: false }), 1300);
      }, 1900 + i * 1550);
    });
  },

  reset: () => {
    const fresh = buildPreset();
    set({
      nodes: fresh.nodes,
      edges: fresh.edges,
      selectedId: null,
      running: false,
      reviewOpen: null,
      marks: { idle: initMarks(), walk: initMarks() },
      playOpen: false,
      exportOpen: false,
      engine: 'cocos',
      sourceMode: 'describe',
      reference: null,
      settings: cloneDefaults(),
    });
  },

  openReview: (a) => set({ reviewOpen: a }),
  closeReview: () => set({ reviewOpen: null }),

  openPlay: () => set({ playOpen: true }),
  closePlay: () => set({ playOpen: false }),

  openExport: () => set({ exportOpen: true }),
  closeExport: () => set({ exportOpen: false }),
  setEngine: (e) => set({ engine: e }),

  markFrame: (a, i, mark) => {
    set({ marks: { ...get().marks, [a]: get().marks[a].map((m, j) => (j === i ? mark : m)) } });
    get().syncGate();
  },

  // 退回单帧 → 携带相邻帧上下文单点重生成 → 回到待审
  regenFrame: (a, i) => {
    set({ marks: { ...get().marks, [a]: get().marks[a].map((m, j) => (j === i ? 'regenerating' : m)) } });
    get().syncGate();
    window.setTimeout(() => {
      set({ marks: { ...get().marks, [a]: get().marks[a].map((m, j) => (j === i ? 'pending' : m)) } });
      get().syncGate();
    }, 1100);
  },
  approveAllFrames: (a) => {
    set({ marks: { ...get().marks, [a]: Array(FRAMES_PER_ACTION).fill('pass') } });
    get().syncGate();
  },

  // Reflect per-frame review results back onto the canvas review node + gate edges.
  syncGate: () => {
    const { marks } = get();
    const passOf = (a: ActionId) => marks[a].filter((m) => m === 'pass').length;
    const idlePass = passOf('idle');
    const walkPass = passOf('walk');
    const approved = idlePass + walkPass;
    const allPass = approved === 16;

    set({
      nodes: get().nodes.map((n) =>
        n.id === 'n_review'
          ? patch(n, { approved, total: 16, revealed: approved > 0, status: allPass ? 'done' : 'idle' })
          : n,
      ),
      edges: get().edges.map((e) => {
        if (e.id === 'e_i_r' && idlePass === 8) return confirmStyle(e);
        if (e.id === 'e_w_r' && walkPass === 8) return confirmStyle(e);
        if (e.id === 'e_r_p' && allPass) return confirmStyle(e);
        return e;
      }),
    });
  },
}));
