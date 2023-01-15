import { insidePolygon } from './polygon-detection.js';
import { PNG } from 'pngjs';

export function renderFrame(
  renderable,
  windowWidth,
  windowHeight,
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
      const x  = (-windowWidth ) + ((windowWidth *2) * sx)
      const y  =   windowHeight  - ((windowHeight*2) * sy)

      // Iterate over the shapes
      for(let i=0; i<renderable.length; i++) {
        const color = renderable[i][0];
        const path  = renderable[i].slice(1);

        // Inside = color and stop
        if (insidePolygon(path, x, y)) {
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
