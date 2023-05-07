const spent = {};
let   namel = 0;
let   calll = 0;
let   timel = 0;

export function dbgStart(name: string) {
  const start = performance.now();
  return {
    stop() {
      const stop = performance.now();
      spent[name]        = spent[name] || { time: 0, calls: 0 };
      spent[name].calls += 1;
      spent[name].time  += stop - start;
      namel = Math.max(namel, name.length);
      calll = Math.max(calll, spent[name].calls.toString().length);
      timel = Math.max(timel, spent[name].time.toFixed(2).toString().length);
    }
  };
}

process.on('exit', () => {
  for(const name in spent) {
    const s = spent[name];
    process.stdout.write((' '.repeat(namel) + name).substr(-namel) + ' : ');
    process.stdout.write((' '.repeat(calll) + s.calls).substr(-calll) + ' calls, ');
    process.stdout.write((' '.repeat(timel) + s.time.toFixed(2)).substr(-timel) + 'ms\n');
  }
});
