import { useEffect, useState } from 'react';

interface Props {
  frames: string[];
  fps?: number;
  size?: number;
  playing?: boolean;
  className?: string;
}

/** Loops a set of transparent PNG frames at a fixed FPS. The whole "8 FPS engine". */
export function SpriteAnimator({ frames, fps = 8, size = 112, playing = true, className }: Props) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!playing || frames.length <= 1) return;
    const id = window.setInterval(() => setI((p) => (p + 1) % frames.length), 1000 / fps);
    return () => window.clearInterval(id);
  }, [frames, fps, playing]);

  const src = frames[i] ?? frames[0];
  return (
    <img
      src={src}
      width={size}
      height={size}
      className={className}
      alt=""
      style={{ objectFit: 'contain', display: 'block' }}
    />
  );
}
