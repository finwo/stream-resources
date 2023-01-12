import * as fs from 'fs';
import { PNG } from 'pngjs';

const width  = 32;
const height = 32;

const scene = [

  [ // Shape
    [  4,  4 ], // Point
    [ 12, 12 ],
    [  4, 12 ],
  ],

  [ // Shape
    [ 20, 20 ], // Point
    [ 28, 20 ],
    [ 28, 28 ],
    [ 20, 28 ],
  ],

];

// Initialize image
const img = new PNG({
  width,
  height,
  colorType: 6 // color & alpha
});

// Test image
for(let y=0; y<height; y++) {
  for(let x=0; x<width; x++) {

    const idx       = (img.width * y + x) << 2;
    let   crossings = 0;

    // Iterate over the shapes
    for(const shape of scene) {
      // Iterate over lines in the shape
      for(let i=0; i<shape.length; i++) {

        // Fetch shape
        const pointA = [...shape[i]];
        const pointB = [...shape[(i + 1) % shape.length]];

        // Line position is relative to our testPoint
        pointA[0] -= x;
        pointA[1] -= y;
        pointB[0] -= x;
        pointB[1] -= y;

        if ((pointA[0] < 0) && (pointB[0] < 0)) continue; // Both points to the left
        if ((pointA[1] < 0) && (pointB[1] < 0)) continue; // Both points to above test
        if ((pointA[1] > 0) && (pointB[1] > 0)) continue; // Both points to below test

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


    }


    if (crossings % 2) {
      img.data[idx + 0] = 255;
      img.data[idx + 1] =   0;
      img.data[idx + 2] =   0;
      img.data[idx + 3] = 255;
    } else {
      img.data[idx + 0] =   0;
      img.data[idx + 1] =   0;
      img.data[idx + 2] =   0;
      img.data[idx + 3] =   0;
    }

  }
}

img
  .pack()
  .pipe(fs.createWriteStream("out.png"));

// console.log('Hello world');
// console.log(PNG);
