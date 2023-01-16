import glob from 'fast-glob';
import path from 'path';

const availableWorkers = [];
const taskQueue        = [];

const projects = glob.sync([
  path.join(__dirname, 'project', '*.js'),
  path.join(__dirname, 'project', '*', 'index.js'),
]);

export function messageHandler(worker, message: any): void {
  switch(message.state) {
    case 'waiting':
      if (taskQueue.length) {
        worker.send({ task: taskQueue.shift() });
        console.log(`Queue length: ${taskQueue.length}`);
      } else {
        availableWorkers.push(worker);
      }
      break;
  }
}

export function enqueue(task: any): void {
  taskQueue.push(task);
  if (availableWorkers.length) {
    availableWorkers.shift().send({ task: taskQueue.shift() });
  }
  console.log(`Queue length: ${taskQueue.length}`);
}

export function main(numWorkers: number): void {
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


}

