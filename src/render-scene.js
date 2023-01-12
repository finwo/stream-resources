import { PNG } from 'pngjs';
import { insidePolygon } from './polygon-detection.js';

export function renderScene(
  scene,
  windowX,
  windowY,
  outputWidth,
  outputHeight,
) {

  // Initialize canvas
  const img = new PNG({
    width: outputWidth,
    height: outputHeight,
    colorType: 6 // color & alpha
  });

  for(let py=0; py<img.height; py++) {
    for(let px=0; px<img.width; px++) {
      const idx = (img.width * py + px) << 2;

      // Calculate logical point we're rendering
      const sx = px / (outputWidth  - 1)
      const sy = py / (outputHeight - 1)
      const x  = (-windowX) + ((windowX*2) * sx)
      const y  =   windowY  - ((windowY*2) * sy)

      // Iterate over the shapes
      for(const shape of scene) {
        const color  = shape[0];
        const points = shape.slice(1);

        // Inside = color and stop
        if (insidePolygon(points, x, y)) {
          img.data[idx + 0] = color[0];
          img.data[idx + 1] = color[1];
          img.data[idx + 2] = color[2];
          img.data[idx + 3] =      255;
          break;
        }
      }
    }
  }

  return img;
}


// for(let y=0; y<height; y++) {
//   for(let x=0; x<width; x++) {

//     const idx       = (img.width * y + x) << 2;
//     let   crossings = 0;

//     // Iterate over the shapes
//     for(const shape of scene) {
//       if (

//       // Iterate over lines in the shape
//       for(let i=0; i<shape.length; i++) {

//         // Fetch shape
//         const pointA = [...shape[i]];
//         const pointB = [...shape[(i + 1) % shape.length]];

//         // Line position is relative to our testPoint
//         pointA[0] -= x;
//         pointA[1] -= y;
//         pointB[0] -= x;
//         pointB[1] -= y;

//         if ((pointA[0] < 0) && (pointB[0] < 0)) continue; // Both points to the left
//         if ((pointA[1] < 0) && (pointB[1] < 0)) continue; // Both points to above test
//         if ((pointA[1] > 0) && (pointB[1] > 0)) continue; // Both points to below test

//         // Vertical line
//         if (pointA[0] == pointB[0]) {
//           crossings += 1;
//           continue;
//         }

//         // Horizontal line
//         // Horizontal line = NOT crossing
//         if (pointA[1] == pointB[1]) {
//           continue;
//         }

//         // Order points, calculate slope
//         const left   = pointA[0] < pointB[0] ? pointA : pointB;
//         const right  = pointB[0] < pointA[0] ? pointA : pointB;
//         const slope  = (right[1] - left[1]) / (right[0] - left[0]);

//         // Translate to left = at 0,0
//         const targetY = -left[1];
//         const targetP = [ right[0] - left[0], right[1] - left[1] ];
//         const ratioP  = targetY / targetP[1];

//         // Calculate where it crosses the target & translate back to testpoint-based
//         const targetX = (targetP[0] * ratioP) + left[0];

//         // If it crosses to the right of us, it's a match
//         if (targetX >= 0) {
//           crossings += 1;
//           continue;
//         }

//       }
//     }


//     if (crossings % 2) {
//       img.data[idx + 0] = 255;
//       img.data[idx + 1] =   0;
//       img.data[idx + 2] =   0;
//       img.data[idx + 3] = 255;
//     } else {
//       img.data[idx + 0] =   0;
//       img.data[idx + 1] =   0;
//       img.data[idx + 2] =   0;
//       img.data[idx + 3] =   0;
//     }

//   }
// }

