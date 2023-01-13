export function insidePolygon(polygon, x, y) {
  // return insidePolygon_naive(polygon, x, y);
  return insidePolygon_math(polygon, x, y);
}

// 2.84 seconds avg of 3
function insidePolygon_math(polygon, x, y) {
  let crossings = 0;

  // Iterate over lines in the polygon
  for(let i=0; i<polygon.length; i++) {

    // Fetch polygon
    const pointA = [...polygon[i]];
    const pointB = [...polygon[(i + 1) % polygon.length]];

    // Line position is relative to our testPoint
    pointA[0] -= x;
    pointA[1] -= y;
    pointB[0] -= x;
    pointB[1] -= y;

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

  // true  = inside
  // false = inside
  return !!(crossings % 2);
}

// 2.87 seconds avg of 3
function insidePolygon_naive(polygon, x, y) {
  let crossings = 0;

  // Iterate over lines in the polygon
  for(let i=0; i<polygon.length; i++) {

    // Fetch polygon
    const pointA = [...polygon[i]];
    const pointB = [...polygon[(i + 1) % polygon.length]];

    // Line position is relative to our testPoint
    pointA[0] -= x;
    pointA[1] -= y;
    pointB[0] -= x;
    pointB[1] -= y;

    if ((pointA[0] < 0) && (pointB[0] < 0)) continue; // Both points to the left
    if ((pointA[1] < 0) && (pointB[1] < 0)) continue; // Both points to below test
    if ((pointA[1] > 0) && (pointB[1] > 0)) continue; // Both points to above test

    // Vertical line
    if (pointA[0] == pointB[0]) {
      crossings += 1;
      continue;
    }

    // Horizontal line
    // Horizontal line = NOT crossing
    if (pointA[1] == pointB[1]) {
      continue;
    }

    // Order points, calculate slope
    const left   = pointA[0] < pointB[0] ? pointA : pointB;
    const right  = pointB[0] < pointA[0] ? pointA : pointB;
    const slope  = (right[1] - left[1]) / (right[0] - left[0]);

    // Translate to left = at 0,0
    const targetY = -left[1];
    const targetP = [ right[0] - left[0], right[1] - left[1] ];
    const ratioP  = targetY / targetP[1];

    // Calculate where it crosses the target & translate back to testpoint-based
    const targetX = (targetP[0] * ratioP) + left[0];

    // If it crosses to the right of us, it's a match
    if (targetX >= 0) {
      crossings += 1;
      continue;
    }

  }

  // true  = inside
  // false = inside
  return !!(crossings % 2);
}
