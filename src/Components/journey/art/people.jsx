// People in the sketch: a few quick lines, about 58 units tall with their feet at y = 0. The director swings
// `${j}.legA` / `${j}.legB` about the hip to make them walk.

import { Ink } from "./draw";
import { pencil } from "./pen";

const HIP = -24;

export function Person({ j, seed = 91, bag = false, cap = false }) {
  const body = pencil(seed).circle(0, -52, 5.5);
  body.lines(
    [
      [-4.5, -45],
      [4.5, -45],
      [3.5, HIP],
      [-3.5, HIP],
    ],
    true,
    0.8,
  );
  body.line(4, -43, 7, -29, 0.5).line(-4, -43, -7, -30, 0.5);
  if (cap) body.line(-6, -56, 8, -56, 0.5);
  if (bag) body.rect(5, -30, 10, 11, 0.5).arc(10, -30, 3.5, 180, 360);
  const leg = (seed2) => pencil(seed2).line(0, 0, 0, -HIP, 0.5).line(0, -HIP, 4, -HIP, 0);
  return (
    <g data-j={j}>
      <Ink pen={body} weight="line" />
      <g data-j={j && `${j}.legB`} transform={`translate(0 ${HIP})`}>
        <Ink pen={leg(seed + 1)} weight="fine" />
      </g>
      <g data-j={j && `${j}.legA`} transform={`translate(0 ${HIP})`}>
        <Ink pen={leg(seed + 2)} weight="line" />
      </g>
    </g>
  );
}
