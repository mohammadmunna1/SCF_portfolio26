// How the sketch's pencils become SVG. A drawing is a group of strokes in a few weights, with paper (the page
// colour) behind its solid parts so that whatever stands behind them is hidden, and an optional label.
// The director draws each drawing in as its reveal goes from 0 to 1 (see director.js).

/**
 * Strokes from a pencil, in one of the sketch's weights: "bold" outlines, "line", "fine" details or "hatch"
 * shading. `w` ("from to") narrows when, during its drawing's reveal, these strokes are drawn; `own` leaves
 * the reveal to the director (strokes it draws and erases itself, like the car turning into a truck).
 */
export function Ink({ pen, weight = "line", w, j, own }) {
  const { d, pathLength } = pen.done();
  if (!d) return null;
  return (
    <path
      className={`sk-${weight}`}
      d={d}
      pathLength={pathLength}
      strokeDasharray="1 2"
      data-w={w}
      data-j={j}
      data-own={own ? "" : undefined}
    />
  );
}

/** Paper: hides what is behind a shape. */
export const Paper = ({ d, j }) => <path className="sk-paper" d={d} data-j={j} />;

/**
 * A drawing the pencil sketches in as it reaches world x `at`, over the next `len` units of its travel —
 * or, with `during` ([from, to] of the journey's progress), while the journey passes through that window.
 * `x` ([from, to]) lets the director skip it while it is off screen.
 */
export function Drawing({ at, len = 300, during, x, children, ...rest }) {
  return (
    <g
      data-draw={during ? undefined : `${at} ${len}`}
      data-during={during && during.join(" ")}
      data-x={x && x.join(" ")}
      {...rest}
    >
      {children}
    </g>
  );
}

/** A part of the world skipped while off screen, between x0 and x1 (in its layer's units). */
export const Region = ({ x0, x1, children }) => <g data-x={`${x0} ${x1}`}>{children}</g>;

/** Lettering, like the stencilled names on buildings and the numbered notes of a technical drawing. */
export const Label = ({ x, y, size = 13, anchor = "start", children }) => (
  <text className="sk-label" x={x} y={y} fontSize={size} textAnchor={anchor}>
    {children}
  </text>
);
