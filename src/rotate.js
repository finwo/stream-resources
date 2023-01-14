// Based on https://stackoverflow.com/a/2259502
export function rotate(polygon, angle, pivot) {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  for(let i=1; i<polygon.length; i++) {
    const x = polygon[i][0] - pivot[0];
    const y = polygon[i][1] - pivot[1];

    // rotate point
    polygon[i][0] = (x * c - y * s) + pivot[0];
    polygon[i][1] = (x * s + y * c) + pivot[1];
  }

  return polygon;
}
