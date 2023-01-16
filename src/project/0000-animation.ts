import { Scene     } from '../stack/scene/scene';
import { AA_METHOD } from '../stack/frame/anti-aliasing';
import { rotate    } from '../stack/rotate';
import { sep       } from 'path';

const aspectRatio         = 16/9;
export const pixelHeight  = 1440;
export const duration     = 2;
export const fps          = 60;
export const windowHeight = 1;

export const scene      = new Scene((__filename).split(`${sep}project${sep}`).pop().split(sep).shift().split('.').shift());
const windowWidth       = windowHeight * aspectRatio;
export const pixelWidth = pixelHeight * aspectRatio;
export const aa_method  = AA_METHOD.SSAA32;

scene.entities.push({
  base: [
    [0,85,0],
    [
      [ -(windowWidth * 1.5),  1.01 ],
      [   windowWidth * 1   ,  1.01 ],
      [   windowWidth * 1.5 , -1.01 ],
      [ -(windowWidth * 1  ), -1.01 ],
    ]
  ],
  toRenderable(timestamp = 0) {
    const shape = JSON.parse(JSON.stringify(this.base));
    let   c;

    if (timestamp < 1) {
      const start = windowWidth * 2.5;
      const mid   = windowWidth * 2;
      const end   = 0;
      const sm    = ((1-timestamp)*start) + (timestamp*mid);
      const me    = ((1-timestamp)*mid  ) + (timestamp*end);
            c     = ((1-timestamp)*sm   ) + (timestamp*me );
    } else {
      const t = timestamp - 1;

      const start = 0;
      const mid   = windowWidth * -2;
      const end   = windowWidth * -2.5;
      const sm    = ((1-t)*start) + (t*mid);
      const me    = ((1-t)*mid  ) + (t*end);
            c     = ((1-t)*sm   ) + (t*me );
    }

    for (let i=1; i < shape.length; i++) {
      const path = shape[i];
      for(const point of path) {
        // point[0] -= windowWidth * 2.5;
        point[0] += c;
        // point[0] -= windowWidth * 5 / 2 * timestamp;
      }
    }

    return shape;
  }
});
