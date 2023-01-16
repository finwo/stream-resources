const cluster      = require('node:cluster');
const numCPUs      = require('node:os').cpus().length;
const orchestrator = require('./orchestrator');
const worker       = require('./worker');

if (cluster.isPrimary) {
  // Start workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  for (const id in cluster.workers) {
    const worker = cluster.workers[id];
    worker.on('message', orchestrator.messageHandler.bind(null, worker));
  }
  orchestrator.main(numCPUs);
} else if (cluster.isWorker) {
  worker.main(cluster.worker.id);
}
