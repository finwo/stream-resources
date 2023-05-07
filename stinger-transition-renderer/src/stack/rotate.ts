// Based on https://stackoverflow.com/a/2259502
export function rotate(polygon, angle, pivot) {
  const out = [polygon[0]];
  const s   = Math.sin(angle);
  const c   = Math.cos(angle);
  for(let i=1; i<polygon.length; i++) {
    out[i] = [];
    const path = polygon[i];
    for(const point of path) {
      const x = point[0] - pivot[0];
      const y = point[1] - pivot[1];
      // rotate point
      out[i].push([
        (x * c - y * s) + pivot[0],
        (x * s + y * c) + pivot[1]
      ]);
    }
  }

  return out;
}
