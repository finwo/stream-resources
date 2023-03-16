import glob from 'fast-glob';
import path from 'path';

let   totalWorkers     = 1;
const availableWorkers = [];
const taskQueue        = [];
const listeners        = [];

const projects = glob.sync([
  path.join(__dirname, 'project', '*.js'),
  path.join(__dirname, 'project', '*', 'index.js'),
]);

export function onDone(fn: Function) {
  listeners.push(fn);
}

export async function messageHandler(worker, message: any): void {
  switch(message.state) {
    case 'waiting':
      if (taskQueue.length) {
        worker.send({ task: taskQueue.shift() });
      } else {
        availableWorkers.push(worker);
      }
      if (availableWorkers.length == totalWorkers) {
        for(const fn of listeners) await fn();
      }
      break;
  }
}

export function enqueue(task: any): void {
  taskQueue.push(task);
  if (availableWorkers.length) {
    availableWorkers.shift().send({ task: taskQueue.shift() });
  }
}

export function main(numWorkers: number): void {
  totalWorkers = numWorkers;
  for(const projectFile of projects) {
    const {
      scene,
      windowHeight,
      fps,
      duration,
      aa_method,
      pixelWidth, pixelHeight,
    } = require(projectFile);

    scene.render(
      [ pixelWidth, pixelHeight ],
      windowHeight,
      fps,
      duration,
      aa_method,
    );
  }

  onDone(() => process.exit(0));

}

