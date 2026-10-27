// Small helpers for the scroll-driven journey. Everything on screen is a pure function of one number, the
// journey's progress (0–1), so scrolling back plays the story exactly in reverse.

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (from, to, t) => from + (to - from) * t;

export const ease = {
  linear: (t) => t,
  /** Smoothstep: gentle start and stop — the default for movement. */
  inOut: (t) => t * t * (3 - 2 * t),
  out: (t) => 1 - (1 - t) ** 3,
  in: (t) => t * t * t,
};

/** 0 before `start`, 1 after `end`, eased in between. */
export const span = (p, start, end, fn = ease.inOut) => fn(clamp((p - start) / (end - start)));

/**
 * The value at `p` along keyframes `[[p0, v0], [p1, v1, easing?], …]`: holds the first and last values
 * outside the range; each segment uses the easing given on its end keyframe (smoothstep by default).
 */
export function track(p, keys) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [end, to, fn = ease.inOut] = keys[i];
    if (p <= end) {
      const [start, from] = keys[i - 1];
      return end === start ? to : lerp(from, to, fn((p - start) / (end - start)));
    }
  }
  return keys[keys.length - 1][1];
}

/** 1 between `start` and `end`, fading in before `start` and out before `end` over `fade`. */
export const presence = (p, start, end, fade = 0.012) =>
  Math.min(span(p, start - fade, start, ease.linear), 1 - span(p, end - fade, end, ease.linear));

const cacheOf = (element) => (element.__journey ??= {});

/** Sets an attribute, skipping the DOM write when the value hasn't changed (most hold still most of the time). */
export function attr(element, name, value) {
  if (!element) return;
  const cache = cacheOf(element);
  if (cache[name] === value) return;
  cache[name] = value;
  element.setAttribute(name, value);
}

/** Sets an inline style property (CSS name, e.g. "opacity" or "--x"), skipping unchanged values. */
export function css(element, property, value) {
  if (!element) return;
  const cache = cacheOf(element);
  const key = `style:${property}`;
  if (cache[key] === value) return;
  cache[key] = value;
  element.style.setProperty(property, value);
}

const round = (value) => Math.round(value * 100) / 100;

/** SVG transform: translate, then rotate (degrees) and scale about the element's own origin. */
export const move = (x, y, rotate = 0, scale = 1) =>
  `translate(${round(x)} ${round(y)})${rotate ? ` rotate(${round(rotate)})` : ""}${
    scale !== 1 ? ` scale(${Math.round(scale * 1000) / 1000})` : ""
  }`;

/** Opacity as a short string, with "visibility" handled by the caller where it matters. */
export const alpha = (value) => String(Math.round(clamp(value) * 1000) / 1000);

/**
 * A smooth path through keyframes `[[p, value], …]` (monotone cubic): speed carries through each key, the
 * value rests wherever two neighbouring keys share it and at both ends, and it never overshoots a key.
 */
export function curve(keys) {
  const n = keys.length;
  const t = keys.map((key) => key[0]);
  const y = keys.map((key) => key[1]);
  const slope = [];
  for (let i = 0; i < n - 1; i++) slope.push((y[i + 1] - y[i]) / (t[i + 1] - t[i]));
  const m = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      m[i] = k * a * slope[i];
      m[i + 1] = k * b * slope[i];
    }
  }
  return (p) => {
    if (p <= t[0]) return y[0];
    if (p >= t[n - 1]) return y[n - 1];
    let i = 0;
    while (p > t[i + 1]) i++;
    const h = t[i + 1] - t[i];
    const s = (p - t[i]) / h;
    const s2 = s * s;
    const s3 = s2 * s;
    return (
      (2 * s3 - 3 * s2 + 1) * y[i] +
      (s3 - 2 * s2 + s) * h * m[i] +
      (-2 * s3 + 3 * s2) * y[i + 1] +
      (s3 - s2) * h * m[i + 1]
    );
  };
}
