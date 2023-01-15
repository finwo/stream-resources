import { Scene     } from './stack/scene/scene';
import { AA_METHOD } from './stack/frame/anti-aliasing';
import { rotate    } from './stack/rotate';

const s = new Scene('animation');

s.entities.push({
  color: [ 0, 85, 170 ],
  base: [
    [ // Outer rectangle
      [ 0.00,  0.33 ],
      [ 0.50,  0.33 ],
      [ 0.50, -0.33 ],
      [ 0.00, -0.33 ],
    ],
    [ // Inner cutout
      [ 0.167,  0.20 ],
      [ 0.333,  0.20 ],
      [ 0.333, -0.20 ],
      [ 0.167, -0.20 ],
    ],
  ],
  toRenderable(timestamp = 0) {
    const output = rotate(
      [
        this.color,
        ...this.base,
      ],
      Math.PI * timestamp,
      [ 0.25, 0 ],
    );
    return output;
  }
});

let circle = [[ 0, 85, 0 ],[]];
const circlePrecision = 60;
for(let i=0; i < circlePrecision; i++) {
  circle[1].push([
    -0.15 + (Math.sin(Math.PI * 2 * i / circlePrecision) * 0.707 * 0.5),
            (Math.cos(Math.PI * 2 * i / circlePrecision) * 0.707 * 0.5),
  ]);
}
s.entities.push({
  toRenderable() {
    return circle;
  }
});

s.render(
  [ 1280, 720 ],   // resolution
  1,               // window scale
  60,              // fps
  2,               // duration
  AA_METHOD.SSAA5, // AA method
);
