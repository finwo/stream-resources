import * as fs from 'fs';
import { renderScene } from './render-scene.js';

const verticalPixels = 144;
const aspectRatio    = 16 / 9;
const windowScale    = 2;

const canvasSize = [ verticalPixels * aspectRatio, verticalPixels ];

const windowSize = [ 2, 2 / aspectRatio ];

const scene = [

  [ // Triangle
    [ 255, 0, 0 ], // Red
    [  -0.75,  0.75 ], // Point
    [  -0.25,  0.25 ],
    [  -0.75,  0.25 ],
  ],

  [ // Square
    [ 0, 85, 0 ], // Green
    [ -0.5 , 0.5 ],
    [  0   , 0.5 ],
    [  0   , 0   ],
    [ -0.5 , 0   ],
  ],

  [ // Square
    [ 0, 85, 170 ], // Blueish
    [ 0.25, -0.25 ],
    [ 0.75, -0.25 ],
    [ 0.75, -0.75 ],
    [ 0.25, -0.75 ],
  ],

];

const img = renderScene(
  scene,
  windowSize[0],
  windowSize[1],
  canvasSize[0],
  canvasSize[1]
);

img
  .pack()
  .pipe(fs.createWriteStream("out.png"));
