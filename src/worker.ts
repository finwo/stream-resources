import process from 'node:process';

import { render_aa } from './stack/frame/anti-aliasing';
import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';

export function main(id) {
  process.on('message', messageHandler.bind(null, id));
  process.send({ state: 'waiting' });
}

export function messageHandler(workerId, message) {
  // console.log(`worker ${workerId}`, { message });

  // Only tasks supported right now
  if (!message.task) return;

  switch(message.task.type) {
    case 'renderFrame':
      const img = render_aa(
        message.task.renderable,
        message.task.windowWidth,
        message.task.windowHeight,
        message.task.outputWidth,
        message.task.outputHeight,
        message.task.aa_method,
      );
      fs.writeFileSync(
        path.join(message.task.outdir, `${message.task.frameName}.png`),
        PNG.sync.write(img)
      );
      break;
  }

  process.send({ state: 'waiting' });
}
