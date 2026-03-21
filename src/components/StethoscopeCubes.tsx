"use client";

import { useEffect, useRef, useState } from "react";

const CUBE_SIZE = 13;
const GAP = 2;
const STEP = CUBE_SIZE + GAP;

const RAW_PIXELS = [
  [3, 0],
  [4, 0],
  [5, 0],
  [2, 1],
  [3, 1],
  [4, 1],
  [1, 2],
  [2, 2],
  [3, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [2, 4],
  [1, 5],
  [2, 5],
  [2, 6],
  [3, 6],
  [22, 0],
  [23, 0],
  [24, 0],
  [23, 1],
  [24, 1],
  [25, 1],
  [24, 2],
  [25, 2],
  [26, 2],
  [25, 3],
  [26, 3],
  [25, 4],
  [26, 4],
  [25, 5],
  [26, 5],
  [24, 6],
  [25, 6],
  [3, 7],
  [4, 7],
  [4, 8],
  [5, 8],
  [5, 9],
  [6, 9],
  [6, 10],
  [6, 11],
  [6, 12],
  [7, 12],
  [7, 13],
  [8, 13],
  [8, 14],
  [9, 14],
  [9, 15],
  [10, 15],
  [10, 16],
  [11, 16],
  [11, 17],
  [12, 17],
  [12, 18],
  [13, 18],
  [23, 7],
  [24, 7],
  [22, 8],
  [23, 8],
  [21, 9],
  [22, 9],
  [21, 10],
  [21, 11],
  [20, 12],
  [21, 12],
  [19, 13],
  [20, 13],
  [18, 14],
  [19, 14],
  [17, 15],
  [18, 15],
  [16, 16],
  [17, 16],
  [15, 17],
  [16, 17],
  [14, 18],
  [15, 18],
  [13, 19],
  [14, 19],
  [13, 20],
  [14, 20],
  [13, 21],
  [14, 21],
  [13, 22],
  [14, 22],
  [13, 23],
  [14, 23],
  [13, 24],
  [14, 24],
  [13, 25],
  [14, 25],
  [13, 26],
  [14, 26],
  [13, 27],
  [14, 27],
  [11, 28],
  [12, 28],
  [13, 28],
  [14, 28],
  [15, 28],
  [16, 28],
  [10, 29],
  [11, 29],
  [12, 29],
  [13, 29],
  [14, 29],
  [15, 29],
  [16, 29],
  [17, 29],
  [10, 30],
  [11, 30],
  [12, 30],
  [13, 30],
  [14, 30],
  [15, 30],
  [16, 30],
  [17, 30],
  [10, 31],
  [11, 31],
  [12, 31],
  [13, 31],
  [14, 31],
  [15, 31],
  [16, 31],
  [17, 31],
  [10, 32],
  [11, 32],
  [12, 32],
  [13, 32],
  [14, 32],
  [15, 32],
  [16, 32],
  [17, 32],
  [11, 33],
  [12, 33],
  [13, 33],
  [14, 33],
  [15, 33],
  [16, 33],
] as const;

const DIAPHRAGM_ROWS = new Set([28, 29, 30, 31, 32, 33]);

function seededRand(seed: number) {
  let state = (seed * 9301 + 49297) % 233280;

  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

const ENTROPY = RAW_PIXELS.map(([col, row], index) => {
  const random = seededRand(index * 1327 + col * 31 + row * 97);

  return {
    driftAmpX: 4 + random() * 5,
    driftAmpY: 4 + random() * 5,
    driftPhaseX: random() * Math.PI * 2,
    driftPhaseY: random() * Math.PI * 2,
    driftSpeedX: 0.18 + random() * 0.32,
    driftSpeedY: 0.15 + random() * 0.28,
    drift2AmpX: 1.5 + random() * 2,
    drift2AmpY: 1.5 + random() * 2,
    drift2PhaseX: random() * Math.PI * 2,
    drift2PhaseY: random() * Math.PI * 2,
    drift2SpeedX: 0.5 + random() * 0.7,
    drift2SpeedY: 0.45 + random() * 0.65,
    initRot: (random() - 0.5) * 10,
    initScale: 0.88 + random() * 0.18,
    gradAngle: 100 + random() * 80,
    borderRadius: 2 + random() * 4,
    opacity: 0.78 + random() * 0.22,
    nudgeAngle: random() * Math.PI * 2,
  };
});

const allCols = RAW_PIXELS.map(([col]) => col);
const allRows = RAW_PIXELS.map(([, row]) => row);
const minCol = Math.min(...allCols);
const maxCol = Math.max(...allCols);
const minRow = Math.min(...allRows);
const maxRow = Math.max(...allRows);
const gridW = (maxCol - minCol + 1) * STEP;
const gridH = (maxRow - minRow + 1) * STEP;
const PAD = 50;
const CANVAS_W = gridW + PAD * 2;
const CANVAS_H = gridH + PAD * 2;
const ORIG_X = PAD - minCol * STEP;
const ORIG_Y = PAD - minRow * STEP;

type CubeProps = {
  col: number;
  row: number;
  entropy: (typeof ENTROPY)[number];
  driftTime: number;
};

function Cube({ col, row, entropy, driftTime }: CubeProps) {
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const diaphragm = DIAPHRAGM_ROWS.has(row);

  const driftX =
    Math.sin(driftTime * entropy.driftSpeedX + entropy.driftPhaseX) * entropy.driftAmpX +
    Math.sin(driftTime * entropy.drift2SpeedX + entropy.drift2PhaseX) * entropy.drift2AmpX;
  const driftY =
    Math.cos(driftTime * entropy.driftSpeedY + entropy.driftPhaseY) * entropy.driftAmpY +
    Math.cos(driftTime * entropy.drift2SpeedY + entropy.drift2PhaseY) * entropy.drift2AmpY;

  const nudgeDist = 22;
  const tx = hovered ? Math.cos(entropy.nudgeAngle) * nudgeDist : driftX;
  const ty = hovered ? Math.sin(entropy.nudgeAngle) * nudgeDist : driftY;
  const scale = hovered ? entropy.initScale * 1.25 : entropy.initScale;

  const base1 = diaphragm ? "#9ca3af" : "#c0392b";
  const base2 = diaphragm ? "#6b7280" : "#8b1a1a";

  return (
    <div
      onMouseEnter={() => {
        if (leaveTimer.current) {
          clearTimeout(leaveTimer.current);
        }
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
        transform: `translate(${tx}px, ${ty}px) rotate(${entropy.initRot}deg) scale(${scale})`,
        transition: hovered
          ? "transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)"
          : "transform 1.1s cubic-bezier(0.25, 1, 0.5, 1)",
        background: `linear-gradient(${entropy.gradAngle}deg, ${base1}, ${base2})`,
        boxShadow: "1px 2px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    />
  );
}

export default function StethoscopeCubes() {
  const [driftTime, setDriftTime] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }

      setDriftTime((timestamp - startRef.current) / 1000);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[620px] overflow-visible"
      style={{
        aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
      }}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.9), transparent 38%), radial-gradient(circle at 52% 64%, rgba(14,165,233,0.08), transparent 32%)",
          filter: "blur(12px)",
        }}
      />

      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "transparent",
          overflow: "visible",
          margin: "0 auto",
        }}
      >
        {RAW_PIXELS.map(([col, row], index) => (
          <Cube key={`${col}-${row}-${index}`} col={col} row={row} entropy={ENTROPY[index]} driftTime={driftTime} />
        ))}
      </div>
    </div>
  );
}
