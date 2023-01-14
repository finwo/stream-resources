import { PNG } from 'pngjs';
import { renderScene } from './render-scene.js';

export const AA_METHOD = {
  none  : 0,
  SSAA4 : 1, // Corner rendering
  SSAA5 : 2, // Dual render, mix together
  SSAA20: 3, // Corner first, then dual render mix together
};

export function render_aa(
  scene,
  windowWidth,
  windowHeight,
  outputWidth,
  outputHeight,
  aa_method = 0,
) {

  const render_fn = aa_method & AA_METHOD.SSAA4 ?
    render_aa_corner :
    renderScene;

  if (aa_method & AA_METHOD.SSAA5) {
    return render_aa_dual(
      scene,
      windowWidth,
      windowHeight,
      outputWidth,
      outputHeight,
      render_fn
    );
  } else {
    return render_fn(
      scene,
      windowWidth,
      windowHeight,
      outputWidth,
      outputHeight
    );
  }

  return img;
}

// Essentially SSAAx4
export function render_aa_corner(
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

  const intermediate = renderScene(
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

      // Alculate alpha in 1 go
      img.data[dst_idx + 3] = Math.round((
        intermediate.data[src_idx[0] + 3] +
        intermediate.data[src_idx[1] + 3] +
        intermediate.data[src_idx[2] + 3] +
        intermediate.data[src_idx[3] + 3]
      ) / 4);

      // Accumulators
      let color = [0,0,0];

      // Add colors from the src pixels
      let colorWeight = 0;
      for(let i=0; i<4; i++) {
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

// Essentially SSAAx5
export function render_aa_dual(
  scene,
  windowWidth,
  windowHeight,
  outputWidth,
  outputHeight,
  renderFn,
) {

  // Render fullsize version
  const fullsize = renderFn(
    scene,
    windowWidth,
    windowHeight,
    outputWidth,
    outputHeight,
  );

  // Working with intervals, not points
  // 3 points to 2 points =
  //     -1     0     1
  //         ?     ?
  //  ? = -0.5..0.5
  //
  // 4 points to 3 points =
  //  -1     -.3     .3      1
  //      ?       ?      ?
  //  ? = -0.66..0.66
  const intWindowWidth  = windowWidth  / (outputWidth  - 1) * (outputWidth  - 2);
  const intWindowHeight = windowHeight / (outputHeight - 1) * (outputHeight - 2);

  // Render the intermediate to mix together with the fullsize
  const intermediate = renderFn(
    scene,
    intWindowWidth,
    intWindowHeight,
    outputWidth  - 1,
    outputHeight - 1,
  );

  // The thing we'll output at the end
  const img = new PNG({
    width: outputWidth,
    height: outputHeight,
    colorType: 6 // color & alpha
  });

  // Iterate over the whole canvas
  for(let y=0; y<img.height; y++) {
    for(let x=0; x<img.width; x++) {
      const dst_idx = (img.width * y + x) << 2;

      const int_idx = [
        ((intermediate.width * (y-1) + (x-1)) << 2),
        ((intermediate.width * (y-1) + (x-0)) << 2),
        ((intermediate.width * (y-0) + (x-1)) << 2),
        ((intermediate.width * (y-0) + (x-0)) << 2),
      ];

      // Accumulators
      let   colorWeight = fullsize.data[dst_idx + 3] ? 1 : 0;
      let   alphaWeight = 1;
      let   alpha       = fullsize.data[dst_idx + 3];
      const color       = [
        fullsize.data[dst_idx + 0] ** 2,
        fullsize.data[dst_idx + 1] ** 2,
        fullsize.data[dst_idx + 2] ** 2,
      ];

      // Top-left
      if ((x > 0) && (y > 0)) {
        alpha       += intermediate.data[int_idx[0] + 3];
        alphaWeight += 1;
        if (intermediate.data[int_idx[0] + 3]) {
          colorWeight += 1;
          color[0] += intermediate.data[int_idx[0] + 0] ** 2;
          color[1] += intermediate.data[int_idx[0] + 1] ** 2;
          color[2] += intermediate.data[int_idx[0] + 2] ** 2;
        }
      }

      // Top-right
      if ((x < intermediate.width) && (y > 0)) {
        alpha       += intermediate.data[int_idx[1] + 3];
        alphaWeight += 1;
        if (intermediate.data[int_idx[1] + 3]) {
          colorWeight += 1;
          color[0] += intermediate.data[int_idx[1] + 0] ** 2;
          color[1] += intermediate.data[int_idx[1] + 1] ** 2;
          color[2] += intermediate.data[int_idx[1] + 2] ** 2;
        }
      }

      // Bottom-left
      if ((x > 0) && (y < intermediate.height)) {
        alpha       += intermediate.data[int_idx[2] + 3];
        alphaWeight += 1;
        if (intermediate.data[int_idx[2] + 3]) {
          colorWeight += 1;
          color[0] += intermediate.data[int_idx[2] + 0] ** 2;
          color[1] += intermediate.data[int_idx[2] + 1] ** 2;
          color[2] += intermediate.data[int_idx[2] + 2] ** 2;
        }
      }

      // Bottom-right
      if ((x < intermediate.width) && (y < intermediate.height)) {
        alpha       += intermediate.data[int_idx[3] + 3];
        alphaWeight += 1;
        if (intermediate.data[int_idx[3] + 3]) {
          colorWeight += 1;
          color[0] += intermediate.data[int_idx[3] + 0] ** 2;
          color[1] += intermediate.data[int_idx[3] + 1] ** 2;
          color[2] += intermediate.data[int_idx[3] + 2] ** 2;
        }
      }

      // Alculate alpha in 1 go
      img.data[dst_idx + 0] = Math.round(Math.sqrt(color[0] / colorWeight));
      img.data[dst_idx + 1] = Math.round(Math.sqrt(color[1] / colorWeight));
      img.data[dst_idx + 2] = Math.round(Math.sqrt(color[2] / colorWeight));
      img.data[dst_idx + 3] = Math.round(          alpha    / alphaWeight );
    }
  }

  return img;
}
