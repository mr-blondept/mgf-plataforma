"use client";

import { useEffect, useRef, useState } from "react";

const CUBE_SIZE = 28;
const GAP = 4;
const STEP = CUBE_SIZE + GAP;

const RAW_PIXELS = [
  [3, 0, "olive"],
  [4, 0, "olive"],
  [5, 0, "olive"],
  [3, 1, "olive"],
  [4, 1, "olive"],
  [5, 1, "olive"],
  [3, 2, "olive"],
  [4, 2, "olive"],
  [5, 2, "olive"],
  [22, 0, "olive"],
  [23, 0, "olive"],
  [24, 0, "olive"],
  [22, 1, "olive"],
  [23, 1, "olive"],
  [24, 1, "olive"],
  [22, 2, "olive"],
  [23, 2, "olive"],
  [24, 2, "olive"],
  [4, 3, "tube"],
  [5, 3, "tube"],
  [3, 4, "tube"],
  [4, 4, "tube"],
  [2, 5, "tube"],
  [3, 5, "tube"],
  [2, 6, "tube"],
  [3, 6, "tube"],
  [2, 7, "tube"],
  [3, 7, "tube"],
  [3, 8, "tube"],
  [4, 8, "tube"],
  [4, 9, "tube"],
  [5, 9, "tube"],
  [5, 10, "tube"],
  [6, 10, "tube"],
  [6, 11, "tube"],
  [7, 11, "tube"],
  [7, 12, "tube"],
  [8, 12, "tube"],
  [8, 13, "tube"],
  [9, 13, "tube"],
  [9, 14, "tube"],
  [10, 14, "tube"],
  [10, 15, "tube"],
  [11, 15, "tube"],
  [22, 3, "tube"],
  [23, 3, "tube"],
  [23, 4, "tube"],
  [24, 4, "tube"],
  [24, 5, "tube"],
  [25, 5, "tube"],
  [24, 6, "tube"],
  [25, 6, "tube"],
  [24, 7, "tube"],
  [25, 7, "tube"],
  [23, 8, "tube"],
  [24, 8, "tube"],
  [22, 9, "tube"],
  [23, 9, "tube"],
  [21, 10, "tube"],
  [22, 10, "tube"],
  [20, 11, "tube"],
  [21, 11, "tube"],
  [19, 12, "tube"],
  [20, 12, "tube"],
  [18, 13, "tube"],
  [19, 13, "tube"],
  [17, 14, "tube"],
  [18, 14, "tube"],
  [16, 15, "tube"],
  [17, 15, "tube"],
  [11, 16, "tube"],
  [12, 16, "tube"],
  [13, 16, "tube"],
  [14, 16, "tube"],
  [15, 16, "tube"],
  [16, 16, "tube"],
  [12, 17, "tube"],
  [13, 17, "tube"],
  [14, 17, "tube"],
  [15, 17, "tube"],
  [13, 18, "tube"],
  [14, 18, "tube"],
  [13, 19, "tube"],
  [14, 19, "tube"],
  [13, 20, "tube"],
  [14, 20, "tube"],
  [13, 21, "tube"],
  [14, 21, "tube"],
  [13, 22, "tube"],
  [14, 22, "tube"],
  [13, 23, "tube"],
  [14, 23, "tube"],
  [13, 24, "tube"],
  [14, 24, "tube"],
  [10, 25, "ring"],
  [11, 25, "ring"],
  [12, 25, "ring"],
  [13, 25, "ring"],
  [14, 25, "ring"],
  [15, 25, "ring"],
  [16, 25, "ring"],
  [9, 26, "ring"],
  [17, 26, "ring"],
  [9, 27, "ring"],
  [17, 27, "ring"],
  [9, 28, "ring"],
  [17, 28, "ring"],
  [9, 29, "ring"],
  [17, 29, "ring"],
  [9, 30, "ring"],
  [17, 30, "ring"],
  [10, 31, "ring"],
  [11, 31, "ring"],
  [12, 31, "ring"],
  [13, 31, "ring"],
  [14, 31, "ring"],
  [15, 31, "ring"],
  [16, 31, "ring"],
  [10, 26, "head"],
  [11, 26, "head"],
  [12, 26, "head"],
  [13, 26, "head"],
  [14, 26, "head"],
  [15, 26, "head"],
  [16, 26, "head"],
  [10, 27, "head"],
  [11, 27, "head"],
  [12, 27, "head"],
  [13, 27, "head"],
  [14, 27, "head"],
  [15, 27, "head"],
  [16, 27, "head"],
  [10, 28, "head"],
  [11, 28, "head"],
  [12, 28, "head"],
  [13, 28, "head"],
  [14, 28, "head"],
  [15, 28, "head"],
  [16, 28, "head"],
  [10, 29, "head"],
  [11, 29, "head"],
  [12, 29, "head"],
  [13, 29, "head"],
  [14, 29, "head"],
  [15, 29, "head"],
  [16, 29, "head"],
  [10, 30, "head"],
  [11, 30, "head"],
  [12, 30, "head"],
  [13, 30, "head"],
  [14, 30, "head"],
  [15, 30, "head"],
  [16, 30, "head"],
] as const;

const PALETTE: Record<"tube" | "olive" | "head" | "ring", { g1: string; g2: string }> = {
  tube: { g1: "#e53e3e", g2: "#9b1c1c" },
  olive: { g1: "#bcc4cb", g2: "#6e7d88" },
  head: { g1: "#d4dbe1", g2: "#8d9aa3" },
  ring: { g1: "#8d9faa", g2: "#4f6370" },
};

function seededRand(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const ENTROPY = RAW_PIXELS.map(([col, row], index) => {
  const random = seededRand(index * 1327 + col * 31 + row * 97);
  return {
    driftAmpX: 3.5 + random() * 4.5,
    driftAmpY: 3.5 + random() * 4.5,
    driftPhaseX: random() * Math.PI * 2,
    driftPhaseY: random() * Math.PI * 2,
    driftSpeedX: 0.16 + random() * 0.28,
    driftSpeedY: 0.14 + random() * 0.26,
    drift2AmpX: 1.2 + random() * 1.8,
    drift2AmpY: 1.2 + random() * 1.8,
    drift2PhaseX: random() * Math.PI * 2,
    drift2PhaseY: random() * Math.PI * 2,
    drift2SpeedX: 0.45 + random() * 0.6,
    drift2SpeedY: 0.4 + random() * 0.55,
    initRot: (random() - 0.5) * 7,
    initScale: 0.88 + random() * 0.16,
    gradAngle: 95 + random() * 85,
    borderRadius: 4 + random() * 6,
    opacity: 0.83 + random() * 0.17,
    nudgeAngle: random() * Math.PI * 2,
  };
});

const allCols = RAW_PIXELS.map(([col]) => col);
const allRows = RAW_PIXELS.map(([, row]) => row);
const minCol = Math.min(...allCols);
const maxCol = Math.max(...allCols);
const minRow = Math.min(...allRows);
const maxRow = Math.max(...allRows);
const PAD = 70;
const CANVAS_W = (maxCol - minCol + 1) * STEP + PAD * 2;
const CANVAS_H = (maxRow - minRow + 1) * STEP + PAD * 2;
const ORIG_X = PAD - minCol * STEP;
const ORIG_Y = PAD - minRow * STEP;

type CubeProps = {
  col: number;
  row: number;
  type: "tube" | "olive" | "ring" | "head";
  entropy: (typeof ENTROPY)[number];
  driftTime: number;
};

function Cube({ col, row, type, entropy, driftTime }: CubeProps) {
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const palette = PALETTE[type];

  const driftX =
    Math.sin(driftTime * entropy.driftSpeedX + entropy.driftPhaseX) * entropy.driftAmpX +
    Math.sin(driftTime * entropy.drift2SpeedX + entropy.drift2PhaseX) * entropy.drift2AmpX;
  const driftY =
    Math.cos(driftTime * entropy.driftSpeedY + entropy.driftPhaseY) * entropy.driftAmpY +
    Math.cos(driftTime * entropy.drift2SpeedY + entropy.drift2PhaseY) * entropy.drift2AmpY;

  const tx = hovered ? Math.cos(entropy.nudgeAngle) * 38 : driftX;
  const ty = hovered ? Math.sin(entropy.nudgeAngle) * 38 : driftY;
  const scale = hovered ? entropy.initScale * 1.22 : entropy.initScale;
  const rot = hovered ? entropy.initRot + (entropy.nudgeAngle > Math.PI ? 12 : -12) : entropy.initRot;

  return (
    <div
      onMouseEnter={() => {
        if (leaveTimer.current) clearTimeout(leaveTimer.current);
        setHovered(true);
      }}
      onMouseLeave={() => {
        leaveTimer.current = setTimeout(() => setHovered(false), 60);
      }}
      style={{
        position: "absolute",
        left: ORIG_X + col * STEP,
        top: ORIG_Y + row * STEP,
        width: CUBE_SIZE,
        height: CUBE_SIZE,
        borderRadius: entropy.borderRadius,
        cursor: "default",
        zIndex: hovered ? 10 : 1,
        willChange: "transform",
        opacity: entropy.opacity,
        transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${scale})`,
        transition: hovered
          ? "transform 0.45s cubic-bezier(0.25,1,0.5,1)"
          : "transform 1.2s cubic-bezier(0.25,1,0.5,1)",
        background: `linear-gradient(${entropy.gradAngle}deg, ${palette.g1}, ${palette.g2})`,
        boxShadow: hovered
          ? "2px 6px 18px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)"
          : "1px 3px 7px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.14)",
      }}
    />
  );
}

const DISPLAY_SCALE = 0.5;

export default function StethoscopeCubes() {
  const [driftTime, setDriftTime] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      setDriftTime((timestamp - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative mx-auto w-full max-w-[340px] overflow-visible"
      style={{ aspectRatio: `${CANVAS_W * DISPLAY_SCALE} / ${CANVAS_H * DISPLAY_SCALE}` }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.35), transparent 42%), radial-gradient(circle at 52% 64%, rgba(14,165,233,0.08), transparent 40%)",
          filter: "blur(10px)",
        }}
      />
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${DISPLAY_SCALE})`,
          transformOrigin: "center",
          background: "transparent",
          overflow: "visible",
          margin: "0 auto",
          filter: "contrast(1.05) saturate(1.07)",
        }}
      >
        {RAW_PIXELS.map(([col, row, type], index) => (
          <Cube
            key={`${col}-${row}-${index}`}
            col={col}
            row={row}
            type={type}
            entropy={ENTROPY[index]}
            driftTime={driftTime}
          />
        ))}
      </div>
    </div>
  );
}
