import { Scene     } from '../stack/scene/scene';
import { AA_METHOD } from '../stack/frame/anti-aliasing';
import { rotate    } from '../stack/rotate';
import { sep       } from 'path';

const aspectRatio         = 16/9;
export const pixelHeight  = 1440;
export const duration     = 2.2;
export const fps          = 60;
export const windowHeight = 1;

export const scene      = new Scene((__filename).split(`${sep}project${sep}`).pop().split(sep).shift().split('.').shift());
const windowWidth       = windowHeight * aspectRatio;
export const pixelWidth = pixelHeight * aspectRatio;
export const aa_method  = AA_METHOD.SSAA32;

scene.entities.push({
  base_red: [
    [0xcc,0x24,0x1d],
    [
      [ -(windowWidth * 1.5),  1.01 ],
      [   windowWidth * 1   ,  1.01 ],
      [   windowWidth * 1.5 , -1.01 ],
      [ -(windowWidth * 1  ), -1.01 ],
    ]
  ],
  base_dark: [
    [0x28,0x28,0x28],
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
        // point[0] -= windowWidth * 2.5;
        point[0] += c;
        point[0] += windowWidth * 0.1 * (timestamp < 1.1 ? -1 : 1);
        // point[0] -= windowWidth * 5 / 2 * timestamp;
      }
    }

    for (let i=1; i < shape_dark.length; i++) {
      const path = shape_dark[i];
      for(const point of path) {
        // point[0] -= windowWidth * 2.5;
        point[0] += c;
        // point[0] -= windowWidth * 5 / 2 * timestamp;
      }
    }

    return [
      shape_dark,
      shape_red
    ];
  }
});
