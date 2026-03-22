"use client";

import { useMemo, useRef } from "react";

type CubeTone =
  | "ep"
  | "ep-m"
  | "ep-l"
  | "t-w"
  | "t-lg"
  | "t-mg"
  | "t-dg"
  | "t-sa"
  | "t-co"
  | "t-r"
  | "t-dr"
  | "t-br"
  | "cp-lg"
  | "cp-mg"
  | "cp-dk"
  | "cp-w"
  | "cp-r"
  | "cp-co";

type CubeData = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  tone: CubeTone;
  rotate?: number;
};

const CX = 190;
const DISPLAY_SCALE = 0.78;

const TONE_CLASSES: Record<CubeTone, string> = {
  ep: "bg-[#1c1c1c]",
  "ep-m": "bg-[#3c3c3c]",
  "ep-l": "bg-[#707070]",
  "t-w": "bg-[#f2f2f2]",
  "t-lg": "bg-[#d4d4d4]",
  "t-mg": "bg-[#ababab]",
  "t-dg": "bg-[#828282]",
  "t-sa": "bg-[#ebb09a]",
  "t-co": "bg-[#de7060]",
  "t-r": "bg-[#c82020]",
  "t-dr": "bg-[#a81212]",
  "t-br": "bg-[#880a0a]",
  "cp-lg": "bg-[#c8c8c8]",
  "cp-mg": "bg-[#888888]",
  "cp-dk": "bg-[#222222]",
  "cp-w": "bg-[#ececec]",
  "cp-r": "bg-[#c83030]",
  "cp-co": "bg-[#dd6050]",
};

function cube(
  id: string,
  left: number,
  top: number,
  width: number,
  height: number,
  tone: CubeTone,
  rotate = 0,
): CubeData {
  return { id, left, top, width, height, tone, rotate };
}

const BASE_CUBES: CubeData[] = [
  cube("ep_l1", CX - 118, 10, 26, 26, "ep"),
  cube("ep_l2", CX - 142, 12, 20, 10, "ep-l"),
  cube("ep_l3", CX - 94, 12, 14, 10, "ep-m"),
  cube("ep_r1", CX + 92, 10, 26, 26, "ep"),
  cube("ep_r2", CX + 118, 12, 20, 10, "ep-l"),
  cube("ep_r3", CX + 80, 12, 14, 10, "ep-m"),
  cube("al1", CX - 110, 20, 20, 20, "t-w", -8),
  cube("al2", CX - 126, 36, 20, 20, "t-w", -18),
  cube("al3", CX - 140, 56, 20, 20, "t-lg", -28),
  cube("al4", CX - 150, 78, 20, 20, "t-lg", -38),
  cube("al5", CX - 156, 102, 20, 20, "t-mg", -45),
  cube("al6", CX - 158, 126, 20, 20, "t-mg", -45),
  cube("al7", CX - 156, 150, 20, 20, "t-dg", -45),
  cube("al8", CX - 150, 174, 20, 20, "t-dg", -40),
  cube("al9", CX - 140, 196, 20, 20, "t-co", -32),
  cube("al10", CX - 126, 216, 20, 20, "t-co", -22),
  cube("al11", CX - 108, 232, 20, 20, "t-r", -12),
  cube("al12", CX - 88, 244, 20, 20, "t-r", -4),
  cube("al13", CX - 66, 252, 20, 20, "t-dr"),
  cube("ar1", CX + 90, 20, 20, 20, "t-w", 8),
  cube("ar2", CX + 106, 36, 20, 20, "t-w", 18),
  cube("ar3", CX + 120, 56, 20, 20, "t-lg", 28),
  cube("ar4", CX + 130, 78, 20, 20, "t-lg", 38),
  cube("ar5", CX + 136, 102, 20, 20, "t-mg", 45),
  cube("ar6", CX + 138, 126, 20, 20, "t-mg", 45),
  cube("ar7", CX + 136, 150, 20, 20, "t-dg", 45),
  cube("ar8", CX + 130, 174, 20, 20, "t-dg", 40),
  cube("ar9", CX + 120, 196, 20, 20, "t-co", 32),
  cube("ar10", CX + 106, 216, 20, 20, "t-co", 22),
  cube("ar11", CX + 88, 232, 20, 20, "t-r", 12),
  cube("ar12", CX + 68, 244, 20, 20, "t-r", 4),
  cube("ar13", CX + 46, 252, 20, 20, "t-dr"),
  cube("s1", CX - 20, 256, 20, 20, "t-dr"),
  cube("s2", CX + 2, 256, 20, 20, "t-dr"),
  cube("s3", CX - 20, 278, 20, 20, "t-r"),
  cube("s4", CX + 2, 278, 20, 20, "t-r"),
  cube("s5", CX - 20, 300, 20, 20, "t-r"),
  cube("s6", CX + 2, 300, 20, 20, "t-r"),
  cube("s7", CX - 20, 322, 20, 20, "t-dr"),
  cube("s8", CX + 2, 322, 20, 20, "t-dr"),
  cube("s9", CX - 20, 344, 20, 20, "t-br"),
  cube("s10", CX + 2, 344, 20, 20, "t-br"),
  cube("s11", CX - 20, 366, 20, 20, "t-sa"),
  cube("s12", CX + 2, 366, 20, 20, "t-sa"),
  cube("s13", CX - 20, 388, 20, 20, "t-co"),
  cube("s14", CX + 2, 388, 20, 20, "t-co"),
  cube("s15", CX - 20, 410, 20, 20, "t-r"),
  cube("s16", CX + 2, 410, 20, 20, "t-r"),
  cube("s17", CX - 20, 432, 20, 20, "t-dr"),
  cube("s18", CX + 2, 432, 20, 20, "t-dr"),
  cube("s19", CX - 20, 454, 20, 20, "t-br"),
  cube("s20", CX + 2, 454, 20, 20, "t-br"),
  cube("cn1", CX - 10, 476, 22, 12, "cp-mg"),
  cube("cn2", CX - 12, 488, 26, 12, "cp-lg"),
  cube("cn3", CX - 14, 500, 30, 14, "cp-dk"),
];

const CUBES: CubeData[] = (() => {
  const cubes = [...BASE_CUBES];
  const diaphragmCenterX = CX;
  const diaphragmCenterY = 595;

  for (let index = 0; index < 18; index += 1) {
    const angle = (index / 18) * Math.PI * 2 - Math.PI / 2;
    const left = Math.round(diaphragmCenterX + 64 * Math.cos(angle) - 9);
    const top = Math.round(diaphragmCenterY + 64 * Math.sin(angle) - 9);
    const rotate = Math.round((angle * 180) / Math.PI + 90);
    const toneGroup = index < 9 ? ["cp-dk", "cp-mg", "cp-lg"] : ["cp-r", "cp-co", "cp-lg"];
    cubes.push(
      cube(
        `do${index}`,
        left,
        top,
        18,
        18,
        toneGroup[index % 3] as CubeTone,
        rotate,
      ),
    );
  }

  for (let index = 0; index < 13; index += 1) {
    const angle = (index / 13) * Math.PI * 2 - Math.PI / 2;
    const left = Math.round(diaphragmCenterX + 40 * Math.cos(angle) - 7);
    const top = Math.round(diaphragmCenterY + 40 * Math.sin(angle) - 7);
    const rotate = Math.round((angle * 180) / Math.PI + 90);
    const tone = index < 6 ? (index % 2 === 0 ? "cp-w" : "cp-dk") : index % 2 === 0 ? "cp-r" : "cp-co";
    cubes.push(cube(`di${index}`, left, top, 14, 14, tone, rotate));
  }

  cubes.push(
    cube("cc1", diaphragmCenterX - 14, diaphragmCenterY - 14, 14, 14, "cp-dk"),
    cube("cc2", diaphragmCenterX + 2, diaphragmCenterY - 14, 14, 14, "cp-w"),
    cube("cc3", diaphragmCenterX - 14, diaphragmCenterY + 2, 14, 14, "cp-w"),
    cube("cc4", diaphragmCenterX + 2, diaphragmCenterY + 2, 14, 14, "cp-dk"),
  );

  return cubes;
})();

function distanceBetweenCubes(first: CubeData, second: CubeData) {
  const firstCenterX = first.left + first.width / 2;
  const firstCenterY = first.top + first.height / 2;
  const secondCenterX = second.left + second.width / 2;
  const secondCenterY = second.top + second.height / 2;
  return Math.hypot(firstCenterX - secondCenterX, firstCenterY - secondCenterY);
}

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export default function StethoscopeCubes() {
  const cubeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const resetTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const hoverTickRef = useRef(0);
  const cubesById = useMemo(
    () => Object.fromEntries(CUBES.map((cubeData) => [cubeData.id, cubeData])),
    [],
  );

  function setCubeTransform(cubeData: CubeData, intensity: number, delay = 160) {
    const cubeElement = cubeRefs.current[cubeData.id];
    if (!cubeElement) return;

    if (resetTimers.current[cubeData.id]) {
      clearTimeout(resetTimers.current[cubeData.id] as ReturnType<typeof setTimeout>);
    }

    hoverTickRef.current += 1;
    const dx = (seededUnit(hoverTickRef.current + cubeData.left) - 0.5) * intensity;
    const dy = (seededUnit(hoverTickRef.current + cubeData.top) - 0.5) * intensity;
    const rotateDelta =
      (seededUnit(hoverTickRef.current + cubeData.width + cubeData.height) - 0.5) *
      intensity *
      1.4;

    cubeElement.style.transition = "transform 160ms cubic-bezier(0.34,1.56,0.64,1)";
    cubeElement.style.transform = `translate(${dx}px, ${dy}px) rotate(${(cubeData.rotate ?? 0) + rotateDelta}deg)`;

    resetTimers.current[cubeData.id] = setTimeout(() => {
      cubeElement.style.transition = "transform 450ms cubic-bezier(0.34,1.56,0.64,1)";
      cubeElement.style.transform = `rotate(${cubeData.rotate ?? 0}deg)`;
    }, delay);
  }

  function handleCubeHover(cubeId: string) {
    const activeCube = cubesById[cubeId];
    if (!activeCube) return;

    setCubeTransform(activeCube, 14, 180);

    CUBES.forEach((otherCube) => {
      if (otherCube.id === activeCube.id) return;
      const distance = distanceBetweenCubes(activeCube, otherCube);
      if (distance >= 52) return;

      const factor = 1 - distance / 52;
      setTimeout(() => {
        setCubeTransform(otherCube, 7 * factor, 220);
      }, 60);
    });
  }

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="relative overflow-visible">
        <div className="pointer-events-none absolute inset-x-8 top-20 h-32 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-16 bottom-10 h-28 rounded-full bg-slate-900/10 blur-3xl" />
        <div
          className="relative mx-auto origin-top"
          style={{
            width: 380,
            height: 700,
            transform: `scale(${DISPLAY_SCALE})`,
            transformOrigin: "top center",
            marginBottom: `${700 * (DISPLAY_SCALE - 1)}px`,
          }}
        >
          {CUBES.map((cubeData) => (
            <div
              key={cubeData.id}
              ref={(node) => {
                cubeRefs.current[cubeData.id] = node;
              }}
              onMouseEnter={() => handleCubeHover(cubeData.id)}
              className={`absolute cursor-default rounded-[3px] shadow-[0_1px_4px_rgba(15,23,42,0.18)] transition-transform ${TONE_CLASSES[cubeData.tone]}`}
              style={{
                left: cubeData.left,
                top: cubeData.top,
                width: cubeData.width,
                height: cubeData.height,
                transform: `rotate(${cubeData.rotate ?? 0}deg)`,
                willChange: "transform",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
