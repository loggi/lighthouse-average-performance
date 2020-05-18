#!/usr/bin/env node

const reportsInputDir = 'baseline10';

const normalizedPath = require('path').join(__dirname, reportsInputDir);
const reports = [];

require('fs')
  .readdirSync(normalizedPath)
  .forEach(file => {
    if (file.endsWith('json')) {
      console.log(`Importing file ${reportsInputDir}/${file}...`);
      const report = require(`./${reportsInputDir}/${file}`);
      reports.push(report);
    }
  });

const calculateAverageInArray = (array, getProperty) =>
  array.map(getProperty).reduce((a, b) => a + b, 0) / array.length;

const averagePerformanceScore = calculateAverageInArray(
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

const generateAverageReport = reports => {
  const audits = {
    ...reports[0].audits,
    'first-contentful-paint': calculateAverageForAudit(
      reports,
      'first-contentful-paint'
    ),
    'first-meaningful-paint': calculateAverageForAudit(
      reports,
      'first-meaningful-paint'
    ),
    'speed-index': calculateAverageForAudit(reports, 'speed-index'),
    'first-cpu-idle': calculateAverageForAudit(reports, 'first-cpu-idle'),
    interactive: calculateAverageForAudit(reports, 'interactive'),
    'max-potential-fid': calculateAverageForAudit(reports, 'max-potential-fid')
  };

  const finalReport = {
    ...reports[0],
    audits
  };
  finalReport.categories.performance.score = averagePerformanceScore;
  return finalReport;
};

console.log('\n\n');
printAudit(calculateAverageForAudit(reports, 'first-contentful-paint'));
printAudit(calculateAverageForAudit(reports, 'first-meaningful-paint'));
printAudit(calculateAverageForAudit(reports, 'speed-index'));
printAudit(calculateAverageForAudit(reports, 'first-cpu-idle'));
printAudit(calculateAverageForAudit(reports, 'interactive'));
printAudit(calculateAverageForAudit(reports, 'max-potential-fid'));
console.log(`Average Performance Score: ${averagePerformanceScore}`);

console.log(
  '\n' +
    `Generating average performance report in ${reportsInputDir}/average-performance-report.json...`
);

const fs = require('fs');
const reportJSON = JSON.stringify(generateAverageReport(reports));
fs.writeFile(
  `${reportsInputDir}/average-performance-report.json`,
  reportJSON,
  'utf8',
  err => {
    if (err) {
      console.log('An error occured while writing JSON Object to File.');
      return console.log(err);
    }

    console.log(
      'Average performance report generated, use https://googlechrome.github.io/lighthouse/viewer/ to visualize it'
    );
    console.warn(
      'NOTE: only the overral performance and metrics number are calculated. ' +
        'Opportunities and Diagnostics number are not analyzed.'
    );
  }
);
