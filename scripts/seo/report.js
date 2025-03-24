#!/usr/bin/env node

/**
 * SEO Report Generator
 * Generates a comprehensive SEO report for the website
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Command } from 'commander';
import { seoConfig } from './config.js';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CLI options
const program = new Command();
program
  .option('-d, --directory <path>', 'Directory to scan', '.')
  .option('-o, --output <path>', 'Output directory for report', seoConfig.paths.outputDir)
  .option('-u, --url <url>', 'Base URL for site', seoConfig.baseUrl)
  .parse(process.argv);

const options = program.opts();

// Create report directory if it doesn't exist
function ensureReportDirectory() {
  const outputDir = path.resolve(options.output);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return outputDir;
}

// Run a script and capture output
function runScript(scriptPath, args = []) {
  try {
    const scriptFullPath = path.resolve(__dirname, scriptPath);
    const argsString = args.join(' ');
    const command = `node "${scriptFullPath}" ${argsString}`;

    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    console.error(`Error running script ${scriptPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Generate HTML report
function generateHtmlReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Report - ${timestamp}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2a5885;
    }
    .report-section {
      margin-bottom: 30px;
      padding: 20px;
      border-radius: 5px;
      background-color: #f9f9f9;
      border-left: 5px solid #2a5885;
    }
    .summary-box {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .summary-item {
      flex: 1;
      min-width: 200px;
      margin: 10px;
      padding: 15px;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .score {
      font-size: 2em;
      font-weight: bold;
      margin: 10px 0;
    }
    .good { color: #4caf50; }
    .medium { color: #ff9800; }
    .poor { color: #f44336; }
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      white-space: pre-wrap;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px 15px;
      border-bottom: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <h1>SEO Report for ${options.url}</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  
  <div class="summary-box">
    <div class="summary-item">
      <h3>Metadata Score</h3>
      <div class="score ${getScoreClass(results.metadata.score, seoConfig.thresholds.metadata)}">
        ${results.metadata.score}/100
      </div>
      <p>${results.metadata.rating}</p>
    </div>
    
    <div class="summary-item">
      <h3>Content Score</h3>
      <div class="score ${getScoreClass(results.content.readabilityScore, seoConfig.thresholds.content)}">
        ${results.content.readabilityScore}/100
      </div>
      <p>${results.content.rating}</p>
    </div>
    
    <div class="summary-item">
      <h3>Overall Rating</h3>
      <div class="score ${getScoreClass(results.overallScore, seoConfig.thresholds.metadata)}">
        ${results.overallScore}/100
      </div>
      <p>${results.overallRating}</p>
    </div>
  </div>
  
  <div class="report-section">
    <h2>Metadata Analysis</h2>
    <pre>${results.metadata.output}</pre>
  </div>
  
  <div class="report-section">
    <h2>Content Analysis</h2>
    <pre>${results.content.output}</pre>
  </div>
  
  <div class="report-section">
    <h2>Recommendations</h2>
    <ul>
      ${results.recommendations.map((rec) => `<li>${rec}</li>`).join('\n      ')}
    </ul>
  </div>
</body>
</html>
  `;

  return reportHtml;
}

// Get color class based on score
function getScoreClass(score, thresholds) {
  if (score >= thresholds.good) return 'good';
  if (score >= thresholds.poor) return 'medium';
  return 'poor';
}

// Extract score from metadata output
function extractMetadataScore(output) {
  const scoreMatch = output.match(/SEO Score: (\d+)\/100 \(([^)]+)\)/);
  if (scoreMatch) {
    return {
      score: parseInt(scoreMatch[1], 10),
      rating: scoreMatch[2],
    };
  }
  return { score: 0, rating: 'Unknown' };
}

// Extract score from content output
function extractContentScore(output) {
  const scoreMatch = output.match(/Average Readability Score: (\d+)\/100/);
  const ratingMatch = output.match(/Readability Rating: ([^\n]+)/);

  return {
    readabilityScore: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
    rating: ratingMatch ? ratingMatch[1] : 'Unknown',
  };
}

// Generate recommendations based on results
function generateRecommendations(metadata, content) {
  const recommendations = [];
  const { checks } = seoConfig;

  // Metadata recommendations
  if (metadata.score < seoConfig.thresholds.metadata.good) {
    recommendations.push(checks.recommendations.metadata.low);
  } else if (metadata.score < seoConfig.thresholds.metadata.excellent) {
    recommendations.push(checks.recommendations.metadata.mid);
  }

  // Content recommendations
  if (content.readabilityScore < seoConfig.thresholds.content.fairlyEasy) {
    recommendations.push(checks.recommendations.content.low);
  } else if (content.readabilityScore < seoConfig.thresholds.content.easy) {
    recommendations.push(checks.recommendations.content.mid);
  }

  // Add general recommendations
  recommendations.push(...checks.recommendations.general);

  return recommendations;
}

// Calculate overall score
function calculateOverallScore(metadataScore, contentScore) {
  // Weight: 60% metadata, 40% content
  return Math.round(metadataScore * 0.6 + contentScore * 0.4);
}

// Get overall rating
function getOverallRating(score) {
  const { excellent, good, fair, poor } = seoConfig.thresholds.metadata;
  if (score >= excellent) return 'Excellent';
  if (score >= good) return 'Good';
  if (score >= fair) return 'Fair';
  if (score >= poor) return 'Poor';
  return 'Very Poor';
}

// Main function
async function main() {
  console.log('Generating SEO Report...');
  console.log(`Target Directory: ${options.directory}`);
  console.log(`Base URL: ${options.url}`);

  // Ensure report directory exists
  const outputDir = ensureReportDirectory();

  // Run metadata analysis
  console.log('\n===== Running Metadata Analysis =====');
  const metadataResult = runScript('./metadata.js', ['-d', options.directory, '-v']);

  // Run content analysis
  console.log('\n===== Running Content Analysis =====');
  const contentResult = runScript('./content.js', ['-d', options.directory, '-v']);

  // Extract scores and prepare results
  const metadataScore = extractMetadataScore(metadataResult.output || '');
  const contentScore = extractContentScore(contentResult.output || '');
  const overallScore = calculateOverallScore(metadataScore.score, contentScore.readabilityScore);
  const overallRating = getOverallRating(overallScore);

  // Generate recommendations
  const recommendations = generateRecommendations(metadataScore, contentScore);

  // Prepare result object
  const results = {
    metadata: {
      ...metadataScore,
      output: metadataResult.output || 'Error running metadata analysis',
    },
    content: {
      ...contentScore,
      output: contentResult.output || 'Error running content analysis',
    },
    overallScore,
    overallRating,
    recommendations,
  };

  // Generate HTML report
  const reportHtml = generateHtmlReport(results);
  const reportPath = path.join(outputDir, 'seo-report.html');
  fs.writeFileSync(reportPath, reportHtml);

  // Generate JSON report
  const jsonReport = JSON.stringify(results, null, 2);
  const jsonPath = path.join(outputDir, 'seo-report.json');
  fs.writeFileSync(jsonPath, jsonReport);

  console.log('\n===== SEO Report Generated =====');
  console.log(`HTML Report: ${reportPath}`);
  console.log(`JSON Report: ${jsonPath}`);
  console.log(`Overall Score: ${overallScore}/100 (${overallRating})`);
}

main().catch((error) => {
  console.error('Error generating SEO report:', error);
  process.exit(1);
});
