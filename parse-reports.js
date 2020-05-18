#!/usr/bin/env node
const dir = 'hotjar';
const normalizedPath = require('path').join(__dirname, dir);
const reports = [];

require('fs')
  .readdirSync(normalizedPath)
  .forEach(file => {
    if (file.endsWith('json')) {
      console.log(`Importing file ${dir}/${file}...`);
      const report = require(`./${dir}/${file}`);
      reports.push(report);
    }
  });

const calculateAverageInArray = (array, getProperty) =>
  array.map(getProperty).reduce((a, b) => a + b, 0) / array.length;

const medianAverageScore = calculateAverageInArray(
  reports,
  report => report.categories.performance.score
);

const calculateAverageForAudit = (reports, audit) => {
  const baseAudit = {
    ...reports[0].audits[audit]
  };
  const getPropertyForAuditItem = item => report => report.audits[audit][item];
  baseAudit.score = calculateAverageInArray(
    reports,
    getPropertyForAuditItem('score')
  );
  baseAudit.numericValue = calculateAverageInArray(
    reports,
    getPropertyForAuditItem('numericValue')
  );
  baseAudit.displayValue = (baseAudit.numericValue / 1000).toFixed(1) + ' s';
  return baseAudit;
};

const printAudit = audit => {
  console.log(`${audit.title}: ${audit.score} (${audit.displayValue})`);
};

console.log('\n\n\n\n');
printAudit(calculateAverageForAudit(reports, 'first-contentful-paint'));
printAudit(calculateAverageForAudit(reports, 'first-meaningful-paint'));
printAudit(calculateAverageForAudit(reports, 'speed-index'));
printAudit(calculateAverageForAudit(reports, 'first-cpu-idle'));
printAudit(calculateAverageForAudit(reports, 'interactive'));
printAudit(calculateAverageForAudit(reports, 'max-potential-fid'));
console.log(medianAverageScore);
