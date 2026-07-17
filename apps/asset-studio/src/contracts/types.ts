// Windup product contract (mirrors contracts/windup.v1.json — MS1 subset).
// Single source of truth for the frontend demo. Locked: 8 FPS, view=side, actions=idle|walk.

export const FIXED_FPS = 8;

export type NodeKind = 'source' | 'master' | 'animation' | 'review' | 'promote';
export type NodeStatus = 'idle' | 'running' | 'candidates' | 'done' | 'error';
export type ActionId = 'idle' | 'walk';
export type ReviewMark = 'pending' | 'pass' | 'reject' | 'regenerating';

export type ViewId = 'side' | 'topdown' | 'isometric';
export type GenMode = 'full' | 'single';

/** User-editable generation settings (this is the control the customer needs). */
export interface GenSettings {
  // character master
  name?: string;
  description?: string;
  style?: string;
  palette?: string;
  // action
  view?: ViewId;
  frames?: number;
  fps?: number;
  loop?: boolean;
  mode?: GenMode;
  prompt?: string;
  // shared
  model?: string;
  costEst?: number; // estimated credits, shown before generating
}

export const IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-image-preview',
  'gemini-3.0-pro-image-preview',
] as const;

export const VIEW_LABELS: Record<ViewId, string> = {
  side: '横屏侧视',
  topdown: '俯视',
  isometric: '2.5D',
};

export interface QcCheck {
  label: string;
  detail: string;
  pass: boolean;
}

/** Data carried by every node on the creation canvas. */
export interface WData {
  kind: NodeKind;
  label: string;
  sub?: string;
  status: NodeStatus;
  revealed?: boolean;

  // source / master
  image?: string;
  brief?: string;

  // animation
  action?: ActionId;
  frames?: string[];
  fps?: number;
  loop?: boolean;
  qc?: QcCheck[];

  // review / promote
  approved?: number;
  total?: number;

  // L1 master: candidate options + locked identity
  candidates?: string[];
  locked?: boolean;

  // allow React Flow's Record<string, unknown> constraint
  [k: string]: unknown;
}
