#!/usr/bin/env node

const execSync = require('child_process').execSync;

const appUrl = process.env.APP_URL;
const reportOutputDir = process.argv[2] || 'hotjar';
const howManyReports = 20; // Change this to be the number of tests you want to do

console.log(`Reports will be delivered on directory ${reportOutputDir}`);
for (let i = 0; i < howManyReports; i++) {
  console.log(`Starting performance test ${i + 1}`);
  try {
    execSync(
      `cd ${reportOutputDir} && ` +
        `lighthouse ${appUrl} --output json --output html --only-categories=performance --quiet --chrome-flags="--headless"`
    );
  } catch (err) {
    console.log(`Performance test ${i + 1} failed`);
    break;
  }
  console.log(`Finished running performance test ${i + 1}`);
}
console.log(`All finished`);
