export function insidePolygon(polygon, x, y) {
  let crossings = 0;

  for(const path of polygon) {
    // Iterate over lines in the path
    // const path = polygon[p];
    for(let i=0; i<path.length; i++) {

      // Fetch path's points, relative to our position
      const
        pointA = [
          path[i][0] - x,
          path[i][1] - y,
        ],
        pointB = [
          path[(i + 1) % path.length][0] - x,
          path[(i + 1) % path.length][1] - y,
        ];

      if ((pointA[0] < 0) && (pointB[0] < 0)) continue; // Both points are to the left
      if ((pointA[1] < 0) && (pointB[1] < 0)) continue; // Both points are below test
      if ((pointA[1] > 0) && (pointB[1] > 0)) continue; // Both points are above test

      // Horizontal line = NOT crossing
      if (pointA[1] == pointB[1]) {
        continue;
      }

      // Crosses somewhere, don't care where
      if ((pointA[0] >= 0) && (pointB[0] >= 0)) {
        crossings++;
        continue;
      }

      // We always want the line to go from left to right
      const left   = pointA[0] < pointB[0] ? pointA : pointB;
      const right  = pointB[0] < pointA[0] ? pointA : pointB;

      // y     = ax + c
      // y - c = ax
      //   - c = ax - y
      const a = (right[1] - left[1]) / (right[0] - left[0]); // Slope
      const c = -((a * left[0]) - left[1]);                  // Constant

      // // Plug in y=0 to get where it'll cross the X axis
      // x = (y - c) / a
      // x = (  - c) / a
      const T = (-c) / a;

      // Count as crossing if @ 0 or to the right
      if (T >= 0) {
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
