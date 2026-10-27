// A drivable route made of straight lines and cubic Bézier curves, measured once so a vehicle can be
// placed by distance travelled — position and heading — at any point.

const SAMPLES = 80;

/**
 * `route([x, y], ["C", [x1, y1], [x2, y2], [x, y]], [x, y], …)`: a start point, then line-to points or
 * curve-to segments. Returns its length and `at(distance)` → { x, y, angle (degrees) }.
 */
export function route(start, ...steps) {
  const points = [start];
  for (const step of steps) {
    const from = points[points.length - 1];
    if (step[0] !== "C") {
      points.push(step);
      continue;
    }
    const [, c1, c2, end] = step;
    for (let i = 1; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      points.push([a * from[0] + b * c1[0] + c * c2[0] + d * end[0], a * from[1] + b * c1[1] + c * c2[1] + d * end[1]]);
    }
  }
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  const length = lengths[lengths.length - 1];

  return {
    length,
    at(distance) {
      const d = Math.min(length, Math.max(0, distance));
      let low = 0;
      let high = lengths.length - 1;
      while (high - low > 1) {
        const mid = (low + high) >> 1;
        if (lengths[mid] <= d) low = mid;
        else high = mid;
      }
      const [x0, y0] = points[low];
      const [x1, y1] = points[high];
      const t = (d - lengths[low]) / (lengths[high] - lengths[low] || 1);
      return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, angle: (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI };
    },
    /** Distance along the route to the first point at or beyond `x` (routes here only move rightwards). */
    distanceAtX(x) {
      const index = points.findIndex((point) => point[0] >= x);
      return index === -1 ? length : lengths[index];
    },
  };
}
