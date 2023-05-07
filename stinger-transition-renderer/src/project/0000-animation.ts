import { Scene         } from '../stack/scene/scene';
import { AA_METHOD     } from '../stack/frame/anti-aliasing';
import { rotate        } from '../stack/rotate';
import { sep           } from 'path';
import { loadSvg       } from '../loader/svg';
import { insidePolygon } from '../stack/frame/polygon-detection';
import * as path from 'path';

const aspectRatio         = 16/9;
export const pixelHeight  = 1440;
export const duration     = 2.2;
export const fps          = 60;
export const windowHeight = 1;

const col_accent = [0xCC, 0x24, 0x1D];
const col_back   = [0x28, 0x28, 0x28];

export const scene      = new Scene((__filename).split(`${sep}project${sep}`).pop().split(sep).shift().split('.').shift());
const windowWidth       = windowHeight * aspectRatio;
export const pixelWidth = pixelHeight * aspectRatio;
export const aa_method  = AA_METHOD.SSAA8 + AA_METHOD.MSAA * 2;

const img = {
  data: loadSvg(path.join(__dirname, '..', '..', 'assets', '0000-stringer-transition', '0007 - logo lores.svg')),
  toRenderable(timestamp = 0) {
    const output = [];
    const scale  = 0.3 + ((timestamp-1.1) * 0.05);

    // Get dark slider
    const darkSlider = slider.toRenderable(timestamp)[0];

    // Iterate over all paths & points
    for(const entity of this.data) {
      const ett = [[255, 255, 255]];
      for(let i=1; i < entity.length; i++) {
        const p = [];
        for(const point of entity[i]) {
          if (insidePolygon([
            0,
            0,
            ...darkSlider.slice(1),
          ], point[0] * scale, point[1] * scale)) {
            p.push([
              point[0] * scale,
              point[1] * scale,
            ]);
          }
        }
        if (p.length) ett.push(p);
      }
      output.push(ett);
    }

    return output;
  }
};

const slider = {
  base_red: [
    col_accent,
    [
      [ -(windowWidth * 1.5),  1.01 ],
      [   windowWidth * 1   ,  1.01 ],
      [   windowWidth * 1.5 , -1.01 ],
      [ -(windowWidth * 1  ), -1.01 ],
    ]
  ],
  base_dark: [
    col_back,
    [
      [ -(windowWidth * 1.5),  1.01 ],
      [   windowWidth * 1   ,  1.01 ],
      [   windowWidth * 1.5 , -1.01 ],
      [ -(windowWidth * 1  ), -1.01 ],
    ]

  ],
  toRenderable(timestamp = 0) {
    const shape_red  = JSON.parse(JSON.stringify(this.base_red));
    const shape_dark = JSON.parse(JSON.stringify(this.base_dark));
    let   c = 0;

    if (timestamp < 1) {
      const start = windowWidth * 3;
      const mid   = windowWidth * 2.5;
      const end   = 0;
      const sm    = ((1-timestamp)*start) + (timestamp*mid);
      const me    = ((1-timestamp)*mid  ) + (timestamp*end);
            c     = ((1-timestamp)*sm   ) + (timestamp*me );
    } else if(timestamp >= 1.2) {
      const t = timestamp - 1.2;

      const start = 0;
      const mid   = windowWidth * -2.5;
      const end   = windowWidth * -3;
      const sm    = ((1-t)*start) + (t*mid);
      const me    = ((1-t)*mid  ) + (t*end);
            c     = ((1-t)*sm   ) + (t*me );
    }

    for (let i=1; i < shape_red.length; i++) {
      const path = shape_red[i];
      for(const point of path) {
        point[0] += c;
        point[0] += windowWidth * 0.1 * (timestamp < 1.1 ? -1 : 1);
      }
    }

    for (let i=1; i < shape_dark.length; i++) {
      const path = shape_dark[i];
      for(const point of path) {
        point[0] += c;
      }
    }

    return [
      shape_dark,
      shape_red
    ];
  }
};

scene.entities.push(img);
scene.entities.push(slider);
