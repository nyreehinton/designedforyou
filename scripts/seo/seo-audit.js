#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Parse command line arguments
const args = process.argv.slice(2);
let targetUrl = 'https://designedforyou.dev';
let targetDir = '.';

// Process command line arguments
for (let i = 0; i < args.length; i++) {
    if (args[i] === '-u' || args[i] === '--url') {
        if (i + 1 < args.length) {
            targetUrl = args[i + 1];
            i++; // Skip the next argument
        }
    } else if (args[i] === '-d' || args[i] === '--dir') {
        if (i + 1 < args.length) {
            targetDir = args[i + 1];
            i++; // Skip the next argument
        }
    }
}

// Configure scoring weights
const WEIGHTS = {
    metadata: {
        title: 15,
        metaDescription: 20,
        viewport: 10,
        charset: 10,
        headingStructure: 15,
        canonicalLink: 10,
    },
    content: {
        wordCount: 15,
        readability: 25,
        headingStructure: 20,
        imageAlt: 20,
        semanticTags: 10,
        internalLinks: 10,
    },
};

function auditMetadata(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    const results = {
        file: path.basename(filePath),
        score: 0,
        maxScore: 0,
        checks: [],
        issues: [],
    };

    // Title check
    results.maxScore += WEIGHTS.metadata.title;
    const title = $('title').text();
    const hasOptimalTitle = title && title.length >= 10 && title.length <= 60;
    if (hasOptimalTitle) {
        results.score += WEIGHTS.metadata.title;
        results.checks.push({ name: 'Title', status: 'passed', value: title });
    } else {
        results.checks.push({ name: 'Title', status: 'failed', value: title || 'missing' });
        results.issues.push('Title tag is missing or not optimal (should be between 10-60 chars)');
    }

    // Meta description check
    results.maxScore += WEIGHTS.metadata.metaDescription;
    const metaDescription = $('meta[name="description"]').attr('content');
    const hasOptimalDesc =
        metaDescription && metaDescription.length >= 10 && metaDescription.length <= 160;
    if (hasOptimalDesc) {
        results.score += WEIGHTS.metadata.metaDescription;
        results.checks.push({ name: 'Meta Description', status: 'passed', value: metaDescription });
    } else {
        results.checks.push({
            name: 'Meta Description',
            status: 'failed',
            value: metaDescription || 'missing',
        });
        results.issues.push(
            'Meta description is missing or not optimal (should be between 10-160 chars)'
        );
    }

    // Viewport check
    results.maxScore += WEIGHTS.metadata.viewport;
    const viewport = $('meta[name="viewport"]').attr('content');
    const hasViewport = viewport && viewport.includes('width=device-width');
    if (hasViewport) {
        results.score += WEIGHTS.metadata.viewport;
        results.checks.push({ name: 'Viewport', status: 'passed', value: viewport });
    } else {
        results.checks.push({ name: 'Viewport', status: 'failed', value: viewport || 'missing' });
        results.issues.push("Viewport meta tag is missing or doesn't include width=device-width");
    }

    // Charset check
    results.maxScore += WEIGHTS.metadata.charset;
    const hasCharset = $('meta[charset]').length > 0;
    if (hasCharset) {
        results.score += WEIGHTS.metadata.charset;
        results.checks.push({
            name: 'Charset',
            status: 'passed',
            value: $('meta[charset]').attr('charset'),
        });
    } else {
        results.checks.push({ name: 'Charset', status: 'failed', value: 'missing' });
        results.issues.push('Charset meta tag is missing');
    }

    // Heading structure check
    results.maxScore += WEIGHTS.metadata.headingStructure;
    const hasOneH1 = $('h1').length === 1;
    if (hasOneH1) {
        results.score += WEIGHTS.metadata.headingStructure;
        results.checks.push({ name: 'H1 Tag', status: 'passed', value: $('h1').first().text() });
    } else {
        results.checks.push({ name: 'H1 Tag', status: 'failed', value: `${$('h1').length} H1 tags` });
        results.issues.push('Page should have exactly one H1 tag');
    }

    // Canonical link check
    results.maxScore += WEIGHTS.metadata.canonicalLink;
    const hasCanonical = $('link[rel="canonical"]').length > 0;
    if (hasCanonical) {
        results.score += WEIGHTS.metadata.canonicalLink;
        results.checks.push({
            name: 'Canonical Link',
            status: 'passed',
            value: $('link[rel="canonical"]').attr('href'),
        });
    } else {
        results.checks.push({ name: 'Canonical Link', status: 'failed', value: 'missing' });
        results.issues.push('Canonical link is missing');
    }

    // Calculate normalized score (0-100)
    results.normalizedScore = Math.round((results.score / results.maxScore) * 100);

    return results;
}

function auditContent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    const results = {
        file: path.basename(filePath),
        score: 0,
        maxScore: 0,
        checks: [],
        issues: [],
    };

    // Word count check
    results.maxScore += WEIGHTS.content.wordCount;
    const textContent = $('body').text().trim();
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;

    // Optimal content length is around 300-1000 words
    let wordCountScore = 0;
    if (wordCount >= 300 && wordCount <= 1000) {
        wordCountScore = WEIGHTS.content.wordCount;
    } else if (wordCount > 0) {
        wordCountScore = Math.round(WEIGHTS.content.wordCount * 0.5);
    }

    results.score += wordCountScore;
    results.checks.push({
        name: 'Word Count',
        status: wordCountScore > 0 ? 'passed' : 'failed',
        value: wordCount,
    });

    if (wordCount < 300) {
        results.issues.push('Content is too short (< 300 words)');
    }

    // Readability check (simple approximation)
    results.maxScore += WEIGHTS.content.readability;

    // Simple readability measure: avg words per sentence
    const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;

    // Optimal: 15-20 words per sentence
    let readabilityScore = 0;
    if (avgWordsPerSentence > 0 && avgWordsPerSentence <= 20) {
        readabilityScore = WEIGHTS.content.readability;
    } else if (avgWordsPerSentence > 20 && avgWordsPerSentence <= 25) {
        readabilityScore = Math.round(WEIGHTS.content.readability * 0.75);
    } else if (avgWordsPerSentence > 25) {
        readabilityScore = Math.round(WEIGHTS.content.readability * 0.5);
    }

    results.score += readabilityScore;
    results.checks.push({
        name: 'Readability',
        status: readabilityScore > WEIGHTS.content.readability * 0.7 ? 'passed' : 'failed',
        value: `Avg ${Math.round(avgWordsPerSentence)} words per sentence`,
    });

    if (avgWordsPerSentence > 20) {
        results.issues.push('Sentences are too long (average > 20 words)');
    }

    // Heading structure check
    results.maxScore += WEIGHTS.content.headingStructure;
    const headings = {
        h1: $('h1').length,
        h2: $('h2').length,
        h3: $('h3').length,
        h4: $('h4').length,
    };

    let headingScore = 0;
    if (headings.h1 === 1 && headings.h2 + headings.h3 > 0) {
        headingScore = WEIGHTS.content.headingStructure;
    } else if (headings.h1 === 1) {
        headingScore = Math.round(WEIGHTS.content.headingStructure * 0.7);
    }

    results.score += headingScore;
    results.checks.push({
        name: 'Heading Structure',
        status: headingScore > WEIGHTS.content.headingStructure * 0.7 ? 'passed' : 'failed',
        value: `H1: ${headings.h1}, H2: ${headings.h2}, H3: ${headings.h3}, H4: ${headings.h4}`,
    });

    if (headings.h2 + headings.h3 === 0) {
        results.issues.push('Missing subheadings (H2, H3)');
    }

    // Image alt text check
    results.maxScore += WEIGHTS.content.imageAlt;
    const images = $('img');
    const imagesWithAlt = $('img[alt]');
    const altTextPercentage = images.length > 0 ? (imagesWithAlt.length / images.length) * 100 : 100;

    let imageAltScore = 0;
    if (altTextPercentage === 100) {
        imageAltScore = WEIGHTS.content.imageAlt;
    } else if (altTextPercentage >= 80) {
        imageAltScore = Math.round(WEIGHTS.content.imageAlt * 0.8);
    } else if (altTextPercentage >= 50) {
        imageAltScore = Math.round(WEIGHTS.content.imageAlt * 0.5);
    }

    results.score += imageAltScore;
    results.checks.push({
        name: 'Image Alt Text',
        status: imageAltScore > WEIGHTS.content.imageAlt * 0.7 ? 'passed' : 'failed',
        value: `${imagesWithAlt.length}/${images.length} images (${Math.round(altTextPercentage)}%)`,
    });

    if (images.length > 0 && altTextPercentage < 100) {
        results.issues.push(`${images.length - imagesWithAlt.length} images missing alt text`);
    }

    // Semantic tags check
    results.maxScore += WEIGHTS.content.semanticTags;
    const semanticTags = $('header, footer, main, article, section, nav, aside').length;

    let semanticScore = 0;
    if (semanticTags >= 3) {
        semanticScore = WEIGHTS.content.semanticTags;
    } else if (semanticTags > 0) {
        semanticScore = Math.round(WEIGHTS.content.semanticTags * (semanticTags / 3));
    }

    results.score += semanticScore;
    results.checks.push({
        name: 'Semantic Tags',
        status: semanticScore > WEIGHTS.content.semanticTags * 0.7 ? 'passed' : 'failed',
        value: `${semanticTags} semantic elements`,
    });

    if (semanticTags < 3) {
        results.issues.push('Insufficient semantic HTML elements');
    }

    // Internal links check
    results.maxScore += WEIGHTS.content.internalLinks;
    const internalLinks = $(
        'a[href^="/"]:not([href^="//"]), a[href^="."]:not([href^=".."]), a[href^="#"]'
    ).length;

    let linkScore = 0;
    if (internalLinks >= 3) {
        linkScore = WEIGHTS.content.internalLinks;
    } else if (internalLinks > 0) {
        linkScore = Math.round(WEIGHTS.content.internalLinks * (internalLinks / 3));
    }

    results.score += linkScore;
    results.checks.push({
        name: 'Internal Links',
        status: linkScore > WEIGHTS.content.internalLinks * 0.7 ? 'passed' : 'failed',
        value: `${internalLinks} internal links`,
    });

    if (internalLinks < 3) {
        results.issues.push('Insufficient internal links (recommendation: at least 3)');
    }

    // Calculate normalized score (0-100)
    results.normalizedScore = Math.round((results.score / results.maxScore) * 100);

    return results;
}

function generateRatingLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
}

function generateHTMLReport(metadataResults, contentResults, siteUrl) {
    const totalMetadataScore = Math.round(
        metadataResults.reduce((sum, result) => sum + result.normalizedScore, 0) /
        metadataResults.length
    );

    const totalContentScore = Math.round(
        contentResults.reduce((sum, result) => sum + result.normalizedScore, 0) / contentResults.length
    );

    const overallScore = Math.round((totalMetadataScore + totalContentScore) / 2);

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportFilename = `seo-report-${timestamp}.html`;
    const reportPath = path.join('seo-report', reportFilename);

    // Ensure directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Audit Report - ${siteUrl}</title>
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
    .file-summary {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .file-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .file-score {
      font-weight: bold;
      padding: 5px 10px;
      border-radius: 15px;
      color: white;
    }
    .good-bg { background-color: #4caf50; }
    .medium-bg { background-color: #ff9800; }
    .poor-bg { background-color: #f44336; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>SEO Audit Report</h1>
      <p class="date">Generated on: ${new Date().toLocaleString()}</p>
      <p class="site-url">Site URL: ${siteUrl}</p>
    </header>
    
    <div class="summary-box">
      <div class="summary-item">
        <h3>Metadata Score</h3>
        <div class="score ${totalMetadataScore >= 70 ? 'good' : totalMetadataScore >= 50 ? 'medium' : 'poor'}">
          ${totalMetadataScore}/100
        </div>
        <p>${generateRatingLabel(totalMetadataScore)}</p>
      </div>
      
      <div class="summary-item">
        <h3>Content Score</h3>
        <div class="score ${totalContentScore >= 70 ? 'good' : totalContentScore >= 50 ? 'medium' : 'poor'}">
          ${totalContentScore}/100
        </div>
        <p>${generateRatingLabel(totalContentScore)}</p>
      </div>
      
      <div class="summary-item">
        <h3>Overall Rating</h3>
        <div class="score ${overallScore >= 70 ? 'good' : overallScore >= 50 ? 'medium' : 'poor'}">
          ${overallScore}/100
        </div>
        <p>${generateRatingLabel(overallScore)}</p>
      </div>
    </div>
    
    <div class="report-section">
      <h2>Metadata Analysis</h2>
      
      ${metadataResults
        .map(
          (result) => `
        <div class="file-summary">
          <div class="file-header">
            <h3>${result.file}</h3>
            <span class="file-score ${result.normalizedScore >= 70 ? 'good-bg' : result.normalizedScore >= 50 ? 'medium-bg' : 'poor-bg'}">
              ${result.normalizedScore}/100
            </span>
          </div>
          
          <table>
            <tr>
              <th>Check</th>
              <th>Status</th>
              <th>Value</th>
            </tr>
            ${result.checks
              .map(
                (check) => `
              <tr>
                <td>${check.name}</td>
                <td>${check.status === 'passed' ? '✅ Passed' : '❌ Failed'}</td>
                <td>${check.value}</td>
              </tr>
            `
              )
              .join('')}
          </table>
          
          ${
            result.issues.length > 0
              ? `
            <h4>Issues:</h4>
            <ul>
              ${result.issues.map((issue) => `<li>${issue}</li>`).join('')}
            </ul>
          `
              : '<p>No issues found!</p>'
          }
        </div>
      `
        )
        .join('')}
    </div>
    
    <div class="report-section">
      <h2>Content Analysis</h2>
      
      ${contentResults
        .map(
          (result) => `
        <div class="file-summary">
          <div class="file-header">
            <h3>${result.file}</h3>
            <span class="file-score ${result.normalizedScore >= 70 ? 'good-bg' : result.normalizedScore >= 50 ? 'medium-bg' : 'poor-bg'}">
              ${result.normalizedScore}/100
            </span>
          </div>
          
          <table>
            <tr>
              <th>Check</th>
              <th>Status</th>
              <th>Value</th>
            </tr>
            ${result.checks
              .map(
                (check) => `
              <tr>
                <td>${check.name}</td>
                <td>${check.status === 'passed' ? '✅ Passed' : '❌ Failed'}</td>
                <td>${check.value}</td>
              </tr>
            `
              )
              .join('')}
          </table>
          
          ${
            result.issues.length > 0
              ? `
            <h4>Issues:</h4>
            <ul>
              ${result.issues.map((issue) => `<li>${issue}</li>`).join('')}
            </ul>
          `
              : '<p>No issues found!</p>'
          }
        </div>
      `
        )
        .join('')}
    </div>
    
    <div class="report-section">
      <h2>Recommendations</h2>
      <ul>
        <li>Add missing meta tags (description, viewport, charset)</li>
        <li>Ensure each page has a canonical link</li>
        <li>Improve content readability by using shorter sentences and simpler vocabulary</li>
        <li>Add descriptive alt text to all images</li>
        <li>Implement proper heading structure (one H1, followed by H2s, H3s)</li>
        <li>Use semantic HTML elements (header, main, footer, etc.)</li>
        <li>Add more internal links between pages</li>
        <li>Ensure content length is at least 300 words for important pages</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(reportPath, html);
  return reportPath;
}

function processDirectory(directory) {
    console.log(`Processing directory: ${directory}`);
    const metadataResults = [];
    const contentResults = [];

    function processFiles(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                processFiles(entryPath);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                try {
                    console.log(`Processing file: ${entryPath}`);
                    const metadata = auditMetadata(entryPath);
                    const content = auditContent(entryPath);

                    metadataResults.push(metadata);
                    contentResults.push(content);
                } catch (error) {
                    console.error(`Error processing ${entryPath}:`, error);
                }
            }
        }
    }

    processFiles(directory);

    // Sort results by normalized score (ascending)
    metadataResults.sort((a, b) => a.normalizedScore - b.normalizedScore);
    contentResults.sort((a, b) => a.normalizedScore - b.normalizedScore);

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportFilename = `seo-report-${timestamp}.html`;
    const reportPath = path.join('seo-report', reportFilename);

    // Ensure the 'seo-report' directory exists
    if (!fs.existsSync('seo-report')) {
        fs.mkdirSync('seo-report', { recursive: true });
    }

    // Generate HTML report
    const htmlReport = generateHTMLReport(metadataResults, contentResults, targetUrl);
    fs.writeFileSync(reportPath, htmlReport);

    // Create or update a symbolic link to the latest report
    const latestReportPath = path.join('seo-report', 'seo-report.html');
    if (fs.existsSync(latestReportPath)) {
        fs.unlinkSync(latestReportPath);
    }
    fs.copyFileSync(reportPath, latestReportPath);

    console.log(`SEO audit completed. Report generated at: ${reportPath}`);
    console.log(`Latest report available at: ${latestReportPath}`);
}

// Run the audit
processDirectory(targetDir);