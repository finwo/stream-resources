import { renderFrame } from './render-frame.js';
import { PNG } from 'pngjs';

export const AA_METHOD = {
  none   :  0,
  SSAA4  :  1, // Corner rendering
  SSAA8  :  2, // Dual render, mix together
  MSAA   :  4, // Double resolution, then downscale
};

export function render_aa(
  renderable,
  windowWidth: number,
  windowHeight: number,
  outputWidth: number,
  outputHeight: number,
  aa_method = 0,
) {

  // Get multi-sampling rate
  const msaa = Math.max(1, Math.floor(aa_method / AA_METHOD.MSAA));

  // Le basic rendering method
  const render_fn = aa_method & AA_METHOD.SSAA4 ?
    render_aa_corner :
    renderFrame;

  // Build the base frame
  const full = (() => {
    if (aa_method & AA_METHOD.SSAA8) {
      return render_aa_dual(
        renderable,
        windowWidth,
        windowHeight,
        outputWidth * msaa,
        outputHeight * msaa,
        render_fn
      );
    } else {
      return render_fn(
        renderable,
        windowWidth,
        windowHeight,
        outputWidth * msaa,
        outputHeight * msaa
      );
    }
  })();

  // Handle msaa downscaling
  const img = new PNG({
    width: outputWidth,
    height: outputHeight,
    colorType: 6 // color & alpha
  });

  // Iterate with slow & fast index
  const w = msaa ** 2;
  for(let y = 0 ; y < outputHeight ; y++) {
    for(let x = 0 ; x < outputWidth ; x++) {
      const dst_idx = (img.width * y + x) << 2;
      const output  = [0,0,0,0];
      for(let iy = 0 ; iy < msaa ; iy++) {
        for(let ix = 0 ; ix < msaa ; ix++) {
          const src_idx = ((full.width * (y*msaa+iy) + (x*msaa+ix)) << 2);
          output[0] += full.data[src_idx + 0] ** 2;
          output[1] += full.data[src_idx + 1] ** 2;
          output[2] += full.data[src_idx + 2] ** 2;
          output[3] += full.data[src_idx + 3];
        }
      }
      img.data[dst_idx + 0] = Math.round(Math.sqrt(output[0] / w));
      img.data[dst_idx + 1] = Math.round(Math.sqrt(output[1] / w));
      img.data[dst_idx + 2] = Math.round(Math.sqrt(output[2] / w));
      img.data[dst_idx + 3] = Math.round(          output[3] / w );
    }
  }

  return img;
}

// Essentially SSAAx4
export function render_aa_corner(
  renderable,
  windowWidth: number,
  windowHeight: number,
  outputWidth: number,
  outputHeight: number,
) {

  // Working with intervals, not points
  // 3 points to 4 points =
  //     -1     0     1
  //   ?     ?     ?     ?
  const intWindowWidth  = windowWidth  / (outputWidth  - 1) * outputWidth;
  const intWindowHeight = windowHeight / (outputHeight - 1) * outputHeight;

  const intermediate = renderFrame(
    renderable,
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
  for(let y=0; y < img.height; y++) {
    for(let x=0; x < img.width; x++) {
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
      for(let i=0; i < 4; i++) {
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

// Essentially SSAAx8
export function render_aa_dual(
  renderable,
  windowWidth: number,
  windowHeight: number,
  outputWidth: number,
  outputHeight: number,
  renderFn,
) {

  // Render fullsize version
  const fullsize = renderFn(
    renderable,
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
    renderable,
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
  for(let y=0; y < img.height; y++) {
    for(let x=0; x < img.width; x++) {
      const dst_idx = (img.width * y + x) << 2;

      const int_idx = [
        ((intermediate.width * (y-1) + (x-1)) << 2), // top left
        ((intermediate.width * (y-1) + (x-0)) << 2), // top right
        ((intermediate.width * (y-0) + (x-1)) << 2), // bottom left
        ((intermediate.width * (y-0) + (x-0)) << 2), // bottom right
      ];

      // Calculate quadrants separately
      //          Red                         Green                        Blue                         Alpha
      let q0 = [ fullsize.data[dst_idx+0]**2, fullsize.data[dst_idx+1]**2, fullsize.data[dst_idx+2]**2, fullsize.data[dst_idx+3] ]; // TopLeft
      let q1 = [ fullsize.data[dst_idx+0]**2, fullsize.data[dst_idx+1]**2, fullsize.data[dst_idx+2]**2, fullsize.data[dst_idx+3] ]; // TopRight
      let q2 = [ fullsize.data[dst_idx+0]**2, fullsize.data[dst_idx+1]**2, fullsize.data[dst_idx+2]**2, fullsize.data[dst_idx+3] ]; // BottomLeft
      let q3 = [ fullsize.data[dst_idx+0]**2, fullsize.data[dst_idx+1]**2, fullsize.data[dst_idx+2]**2, fullsize.data[dst_idx+3] ]; // BottomRight

      // // Accumulators
      // let   alpha       = fullsize.data[dst_idx + 3] * 4;
      // let   alphaWeight = 4;
      // let   colorWeight = alpha ? 4 : 0;
      // const color       = alpha ? [
      //   (fullsize.data[dst_idx + 0] ** 2) * 4,
      //   (fullsize.data[dst_idx + 1] ** 2) * 4,
      //   (fullsize.data[dst_idx + 2] ** 2) * 4,
      // ] : [ 0, 0, 0 ];

      // Top-left
      if ((x > 0) && (y > 0)) {
        q0[0] = ( q0[0] +  (intermediate.data[int_idx[0] + 0]**2) ) / 2 ;
        q0[1] = ( q0[1] +  (intermediate.data[int_idx[0] + 1]**2) ) / 2 ;
        q0[2] = ( q0[2] +  (intermediate.data[int_idx[0] + 2]**2) ) / 2 ;
        q0[3] = ( q0[3] +  (intermediate.data[int_idx[0] + 3]   ) ) / 2 ;
      }

      // Top-right
      if ((x < intermediate.width) && (y > 0)) {
        q1[0] = ( q1[0] +  (intermediate.data[int_idx[1] + 0]**2) ) / 2 ;
        q1[1] = ( q1[1] +  (intermediate.data[int_idx[1] + 1]**2) ) / 2 ;
        q1[2] = ( q1[2] +  (intermediate.data[int_idx[1] + 2]**2) ) / 2 ;
        q1[3] = ( q1[3] +  (intermediate.data[int_idx[1] + 3]   ) ) / 2 ;
      }

      // Bottom-left
      if ((x > 0) && (y < intermediate.height)) {
        q2[0] = ( q2[0] +  (intermediate.data[int_idx[2] + 0]**2) ) / 2 ;
        q2[1] = ( q2[1] +  (intermediate.data[int_idx[2] + 1]**2) ) / 2 ;
        q2[2] = ( q2[2] +  (intermediate.data[int_idx[2] + 2]**2) ) / 2 ;
        q2[3] = ( q2[3] +  (intermediate.data[int_idx[2] + 3]   ) ) / 2 ;
      }

      // Bottom-right
      if ((x < intermediate.width) && (y < intermediate.height)) {
        q3[0] = ( q3[0] +  (intermediate.data[int_idx[3] + 0]**2) ) / 2 ;
        q3[1] = ( q3[1] +  (intermediate.data[int_idx[3] + 1]**2) ) / 2 ;
        q3[2] = ( q3[2] +  (intermediate.data[int_idx[3] + 2]**2) ) / 2 ;
        q3[3] = ( q3[3] +  (intermediate.data[int_idx[3] + 3]   ) ) / 2 ;
      }

      // Merge colors into 1
      // Alculate alpha in 1 go
      img.data[dst_idx + 0] = Math.round(Math.sqrt((q0[0] + q1[0] + q2[0] + q3[0]) / 4));
      img.data[dst_idx + 1] = Math.round(Math.sqrt((q0[1] + q1[1] + q2[1] + q3[1]) / 4));
      img.data[dst_idx + 2] = Math.round(Math.sqrt((q0[2] + q1[2] + q2[2] + q3[2]) / 4));
      img.data[dst_idx + 3] = Math.round(          (q0[3] + q1[3] + q2[3] + q3[3]) / 4 );
    }
  }

  return img;
}
