// Mock character library for the MS1 demo. Real assets, mock generation.
// Swap this file (or add entries) to inject the "stunning" Meowa-made hero later.
import type { ActionId, QcCheck } from './types';

const pad = (n: number) => String(n).padStart(2, '0');
const framesOf = (action: string, n = 8) =>
  Array.from({ length: n }, (_, i) => `/characters/lamplighter/${action}/${action}-${pad(i + 1)}.png`);

// A believable geometry-QC read (the differentiator: per-frame, real numbers).
const qcPass = (extra: QcCheck[] = []): QcCheck[] => [
  { label: '画布一致', detail: '256×256 · 全帧一致', pass: true },
  { label: '透明背景', detail: 'alpha 干净 · 无残底', pass: true },
  { label: '脚底基线', detail: '漂移 0.0px (≤3px)', pass: true },
  { label: '主体高度', detail: '波动 2.1px (≤7px)', pass: true },
  { label: '相邻位移', detail: 'max 5.2 / 中位 2.9', pass: true },
  { label: '循环接缝', detail: '3.9px · 4.1% (≤10px)', pass: true },
  ...extra,
];

export interface CharacterDef {
  id: string;
  name: string;
  brief: string;
  master: string;
  actions: Record<ActionId, { label: string; frames: string[]; loop: boolean; qc: QcCheck[] }>;
}

export const lamplighter: CharacterDef = {
  id: 'lamplighter',
  name: '点灯人',
  brief: '雾港的提灯少年 · 手绘风 · 横版侧视',
  master: '/characters/lamplighter/master.png',
  actions: {
    idle: { label: '待机', frames: framesOf('idle'), loop: true, qc: qcPass() },
    walk: { label: '行走', frames: framesOf('walk'), loop: true, qc: qcPass() },
  },
};

export const DEMO_CHARACTER = lamplighter;

// Master generation candidates (mock): standing poses of the same character —
// the user picks one, which locks identity for all downstream frames.
export const MASTER_CANDIDATES = [
  '/characters/lamplighter/idle/idle-01.png',
  '/characters/lamplighter/idle/idle-03.png',
  '/characters/lamplighter/idle/idle-05.png',
  '/characters/lamplighter/idle/idle-07.png',
];
