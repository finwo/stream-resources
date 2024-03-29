import { render_aa, AA_METHOD } from '../frame/anti-aliasing';
import { exec } from 'child_process';
import { v4 as uuid } from 'uuid';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { PNG } from 'pngjs';
import * as fs from 'fs';
import path from 'path';
import { enqueue, onDone } from '../../orchestrator';

export class Scene {
  public entities: Entity[] = [];
  public name = '';

  constructor(name) {
    this.name = name || uuid();
  }

  toRenderable(timestamp = 0) {
    const renderable = [];
    for(const entity of this.entities) {
      renderable.push(...entity.toRenderable(timestamp));
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
      process.stdout.write(`\rQueueing tasks ${(timestamp / (fps * duration) * 100).toFixed(2)}%  `);
      const renderable = this.toRenderable(timestamp / fps);
      const frameName  = ('000000' + timestamp.toString()).substr(-6);
      enqueue({
        type         : 'renderFrame',
        windowWidth  : window * aspectRatio,
        windowHeight : window,
        outputWidth  : resolution[0],
        outputHeight : resolution[1],
        renderable,
        frameName,
        aa_method,
        outdir,
      });
    }
    process.stdout.write(`\rAll tasks enqueued            \n`);
    onDone(() => {
      return new Promise<void>(resolve => {
        exec(`ffmpeg -y -framerate ${fps} -i '${outdir}/%06d.png' -pix_fmt yuva420p -b:v 2500k -maxrate 2500k -minrate 1k -speed 0 '${outdir}/video.webm'`, (err, stdout, stderr) => {
          if (stderr) process.stderr.write(stderr);
          if (stdout) process.stdout.write(stdout);
          resolve();
        });
      });
    });
  }
}
