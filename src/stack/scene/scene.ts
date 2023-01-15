import { render_aa, AA_METHOD } from '../frame/anti-aliasing';
import { exec } from 'child_process';
import { v4 as uuid } from 'uuid';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { PNG } from 'pngjs';
import * as fs from 'fs';
import path from 'path';

export class Scene {
  public entities: Entity[] = [];
  public name = '';

  constructor(name) {
    this.name = name || uuid();
  }

  toRenderable(timestamp = 0) {
    const renderable = [];
    for(const entity of this.entities) {
      renderable.push(entity.toRenderable(timestamp));
    }
    return renderable;
  }

  render(
    resolution,
    window,
    fps      = 30,
    duration = 2, // In seconds
    aa_method = AA_METHOD.SSAA5,
  ) {
    const outdir = path.join(__dirname, '..', '..', '..', 'output', this.name);
    rimraf.sync(outdir);
    mkdirp.sync(outdir);
    const aspectRatio = resolution[0] / resolution[1];
    for(let timestamp = 0; timestamp < (fps * duration); timestamp += 1) {
      process.stdout.write(`\rRendering ${(timestamp / (fps * duration) * 100).toFixed(2)}%  `);
      const renderable = this.toRenderable(timestamp / fps);
      const frameName  = ('000000' + timestamp.toString()).substr(-6);
      const img        = render_aa(
        renderable,
        window * aspectRatio,
        window,
        resolution[0],
        resolution[1],
        aa_method,
      );
      fs.writeFileSync(
        path.join(outdir, `${frameName}.png`),
        PNG.sync.write(img)
      );
    }
    process.stdout.write(`\rRendering 100.00%  \n`);
    exec(`ffmpeg -y -framerate ${fps} -i '${outdir}/%06d.png' -pix_fmt yuva420p -b:v 2500k -maxrate 2500k -minrate 1k -speed 0 '${outdir}/video.webm'`, (err, stdout, stderr) => {
      if (stderr) process.stderr.write(stderr);
      if (stdout) process.stdout.write(stdout);
    });
  }
}
