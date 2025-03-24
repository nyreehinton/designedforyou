#!/usr/bin/env node

/**
 * SEO Metadata Checker
 * Checks HTML files for proper SEO metadata and best practices
 */

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { Command } from 'commander';
import { seoConfig } from './config.js';

// Configure CLI options
const program = new Command();
program
  .option('-d, --directory <path>', 'Directory to scan', '.')
  .option('-v, --verbose', 'Show verbose output', false)
  .parse(process.argv);

const options = program.opts();

// Metadata checks from config
const metadataChecks = seoConfig.checks.metadata;

// Find all HTML files
function findHtmlFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...findHtmlFiles(filePath));
    } else if (path.extname(file) === '.html') {
      results.push(filePath);
    }
  }

  return results;
}

// Check a single HTML file
function checkHtmlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(content);
  const { document } = dom.window;

  const issues = [];
  let passCount = 0;

  for (const check of metadataChecks) {
    const element = document.querySelector(check.selector);
    const passed = check.check(element, document);

    if (!passed) {
      issues.push({
        check: check.name,
        message: check.message,
      });
    } else {
      passCount++;
    }
  }

  return {
    file: filePath,
    issues,
    passCount,
    totalChecks: metadataChecks.length,
  };
}

// Main function
function main() {
  const directory = path.resolve(options.directory);
  console.log(`Scanning directory: ${directory} for HTML files...`);

  const htmlFiles = findHtmlFiles(directory);
  console.log(`Found ${htmlFiles.length} HTML files to check\n`);

  let totalIssues = 0;
  let totalChecks = 0;
  let passedChecks = 0;

  for (const file of htmlFiles) {
    const result = checkHtmlFile(file);
    totalIssues += result.issues.length;
    totalChecks += result.totalChecks;
    passedChecks += result.passCount;

    const relativePath = path.relative(directory, file);
    console.log(`File: ${relativePath}`);
    console.log(`  Status: ${result.issues.length > 0 ? '❌ Failed' : '✅ Passed'}`);

    if (result.issues.length > 0 || options.verbose) {
      console.log(`  Passed: ${result.passCount}/${result.totalChecks} checks`);
    }

    if (result.issues.length > 0) {
      console.log('  Issues:');
      for (const issue of result.issues) {
        console.log(`   - ${issue.message}`);
      }
    }

    console.log('');
  }

  // Summary
  console.log('======== Summary ========');
  console.log(`Total Files Checked: ${htmlFiles.length}`);
  console.log(
    `Passed Checks: ${passedChecks}/${totalChecks} (${Math.round((passedChecks / totalChecks) * 100)}%)`
  );
  console.log(`Total Issues: ${totalIssues}`);

  const score = Math.round((passedChecks / totalChecks) * 100);
  console.log(`SEO Score: ${score}/100 (${getScoreRating(score)})`);
}

function getScoreRating(score) {
  const { excellent, good, fair, poor } = seoConfig.thresholds.metadata;
  if (score >= excellent) return 'Excellent';
  if (score >= good) return 'Good';
  if (score >= fair) return 'Fair';
  if (score >= poor) return 'Poor';
  return 'Very Poor';
}

main();
