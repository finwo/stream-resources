import * as fs from 'fs';
import { render_aa, AA_METHOD } from './anti-aliasing.js';
import { rotate    } from './rotate.js';

// const verticalPixels = 4;
const verticalPixels = 1440;
// const verticalPixels = 96;
// const aspectRatio    = 128 / 96;
const aspectRatio    = 21 / 9;
// const aspectRatio    = 4/3;
// const aspectRatio    = 1;

const windowScale    = 1;

const canvasSize = [ verticalPixels * aspectRatio, verticalPixels ];

const windowSize = [ windowScale * aspectRatio, windowScale ];

const triangle = [
  [ 255, 0, 0 ], // Red
  [  -0.75,  0.75 ], // Point
  [  -0.25,  0.25 ],
  [  -0.75,  0.25 ],
];

const square = [ // Square
  [ 0, 85, 0 ], // Green
  [ -0.5 , 0.5 ],
  [  0   , 0.5 ],
  [  0   , 0   ],
  [ -0.5 , 0   ],
];

// const circlePrecision = 90;
// const circle = [
//   [ 0, 85, 170 ], // Blueish
// ];
// // center = 0.5,-0.5
// // radius = 0.707 * 0.5
// for(let i=0; i<circlePrecision; i++) {
//   let rad = Math.PI * 2 * i / circlePrecision;
//   circle.push([
//     0.5 + (Math.sin(rad) * (0.707 * 0.5)),
//    -0.5 + (Math.cos(rad) * (0.707 * 0.5))
//   ]);
// }

const rect = rotate(
  [
    [ 0, 85, 170 ], // Blueish
    [ 0.25, -0.33 ],
    [ 0.75, -0.33 ],
    [ 0.75, -0.66 ],
    [ 0.25, -0.66 ],
  ],
  Math.PI / 9,
  [ 0.5, -0.5 ],
);

const scene = [
  triangle,
  square,
  // circle,
  rect,
];

// const scene = [
//   [
//     [ 0, 85, 170 ], // Blueish
//     [ -0.5, -0.25 ],
//     [  0.5,  0.25 ],
//     [  0.5, -0.25 ],
//   ]
// ];

const img = render_aa(
  scene,
  windowSize[0],
  windowSize[1],
  canvasSize[0],
  canvasSize[1],
  AA_METHOD.SSAA20,
  // aa_method_none,
);

img
  .pack()
  .pipe(fs.createWriteStream("out.png"));
