import * as fs from 'fs';
import { PNG } from 'pngjs';

const width  = 2560;
const height = 1440;

const center = [width / 2, height / 2];
const radius = height / 3;

// Initialize image
const img = new PNG({
  width,
  height,
  colorType: 6 // color & alpha
});

// Test image
for(let y=0; y<height; y++) {
  for(let x=0; x<width; x++) {
    const idx = (img.width * y + x) << 2;
    const dist = Math.sqrt( (Math.abs(x-center[0]) ** 2) + (Math.abs(y-center[1]) ** 2) );
    if (dist <= radius) {
      img.data[idx + 0] = 255;
      img.data[idx + 1] =   0;
      img.data[idx + 2] =   0;
      img.data[idx + 3] = 255;
    } else {
      img.data[idx + 0] = 0;
      img.data[idx + 1] = 0;
      img.data[idx + 2] = 0;
      img.data[idx + 3] = 0;
    }
  }
}

img
  .pack()
  .pipe(fs.createWriteStream("out.png"));

// console.log('Hello world');
// console.log(PNG);
