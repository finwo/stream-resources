export function insidePolygon(polygon, x, y) {
  let crossings = 0;

  for(let p=2; p < polygon.length; p++) {
    const path = polygon[p];
    // Iterate over lines in the path
    // const path = polygon[p];
    for(let i=0; i < path.length; i++) {

      // Fetch path's points, relative to our position
      const pointA = path[i],
            pointB = path[(i + 1) % path.length];

      if ((pointA[0] < x) && (pointB[0] < x)) continue; // Both points are to the left
      if ((pointA[1] < y) && (pointB[1] < y)) continue; // Both points are below test
      if ((pointA[1] > y) && (pointB[1] > y)) continue; // Both points are above test

      // Horizontal line = NOT crossing
      if (pointA[1] == pointB[1]) {
        continue;
      }

      // Crosses somewhere, don't care where
      if ((pointA[0] >= x) && (pointB[0] >= x)) {
        crossings++;
        continue;
      }

      // y     = ax + c
      // y - c = ax
      //   - c = ax - y
      const a = (pointB[1] - pointA[1]) / (pointB[0] - pointA[0]); // Slope
      const c = -((a * pointA[0]) - pointA[1]);                  // Constant

      // Plug in y to get where it'll cross the X axis
      // x = (y - c) / a
      const T = (y-c) / a;

      // Count as crossing if at x or to it's right
      if (T >= x) {
        crossings++;
        continue;
      }

      // No further operations
    }
  }

  // true  = inside
  // false = inside
  return !!(crossings % 2);
}
