import autocannon from 'autocannon';
import { writeFileSync } from 'fs';

const url = 'http://localhost:3000/';

const instance = autocannon({
  url,
  connections: 10,
  duration: 30,
}, finishedBench);

autocannon.track(instance);

function finishedBench(err:any, res:any) {
  if (err) {
    console.error('Benchmark failed:', err);
  } else {
    console.log('Benchmark finished');
    writeFileSync('autocannon-report.json', JSON.stringify(res, null, 2));
    console.log('Report saved to autocannon-report.json');
  }
}
