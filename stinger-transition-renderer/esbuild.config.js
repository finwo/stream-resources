const glob = require('fast-glob');
const tsconfig = require('./tsconfig.json');
const cnf = [];

cnf.push(`--target=${tsconfig.compilerOptions.target}`);
cnf.push(`--format=cjs`);
cnf.push(`--platform=node`);
cnf.push(`--outdir=${tsconfig.compilerOptions.outDir}/`);
cnf.push(...glob.sync(tsconfig.include));

process.stdout.write(cnf.join(' ') + '\n');
