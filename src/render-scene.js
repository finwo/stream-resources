import { PNG } from 'pngjs';
import { insidePolygon } from './polygon-detection.js';

export function renderScene(
  scene,
  windowWidth,
  windowHeight,
  outputWidth,
  outputHeight,
) {

  // Working with intervals, not points
  // 3 points to 4 points =
  //     -1     0     1
  //   ?     ?     ?     ?
  const intWindowWidth  = windowWidth  / (outputWidth  - 1) * outputWidth;
  const intWindowHeight = windowHeight / (outputHeight - 1) * outputHeight;

  const intermediate = render_core(
    scene,
    intWindowWidth,
    intWindowHeight,
    outputWidth + 1,
    outputHeight + 1,
  );

  const img = new PNG({
    width: outputWidth,
    height: outputHeight,
    colorType: 6 // color & alpha
  });

  // Iterate over the whole canvas
  for(let y=0; y<img.height; y++) {
    for(let x=0; x<img.width; x++) {
      const dst_idx = (img.width * y + x) << 2;
      const src_idx = [
        ((intermediate.width * (y+0) + (x+0)) << 2),
        ((intermediate.width * (y+0) + (x+1)) << 2),
        ((intermediate.width * (y+1) + (x+0)) << 2),
        ((intermediate.width * (y+1) + (x+1)) << 2),
      ];

      // Alpha first
      img.data[dst_idx + 3] = Math.round(
        ( intermediate.data[src_idx[0] + 3] +
          intermediate.data[src_idx[1] + 3] +
          intermediate.data[src_idx[2] + 3] +
          intermediate.data[src_idx[3] + 3]
        ) / 4
      );

      // Accumulator
      let color = [0,0,0];

      // Add colors from the src pixels
      let colorWeight = 0;
      for(let i=0; i<3; i++) {
        if (intermediate.data[src_idx[i] + 3]) {
          colorWeight++;
          color[0] += intermediate.data[src_idx[i] + 0] ** 2;
          color[1] += intermediate.data[src_idx[i] + 1] ** 2;
          color[2] += intermediate.data[src_idx[i] + 2] ** 2;
        }
      }

      // If anything had opacity
      if (colorWeight) {
        color[0] = Math.round(Math.sqrt(color[0] / colorWeight));
        color[1] = Math.round(Math.sqrt(color[1] / colorWeight));
        color[2] = Math.round(Math.sqrt(color[2] / colorWeight));
      }

      // Write down the value for our pixels
      img.data[dst_idx + 0] = color[0];
      img.data[dst_idx + 1] = color[1];
      img.data[dst_idx + 2] = color[2];
    }
  }

  return img;
}

function render_core(
  scene,
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
