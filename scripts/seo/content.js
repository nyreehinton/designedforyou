#!/usr/bin/env node

/**
 * SEO Content Analyzer
 * Analyzes HTML content for readability and keyword optimization
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
  .option('-k, --keywords <keywords>', 'Target keywords (comma separated)')
  .option('-v, --verbose', 'Show verbose output', false)
  .parse(process.argv);

const options = program.opts();
const keywords = options.keywords
  ? options.keywords.split(',').map((k) => k.trim().toLowerCase())
  : [];

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

// Calculate readability score (Flesch-Kincaid)
function calculateReadability(text) {
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Count sentences, words, syllables
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.trim().length > 0);

  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }

  // Simplified syllable count
  let syllables = 0;
  for (const word of words) {
    // Count vowel groups as syllables (simplified)
    const count = word
      .toLowerCase()
      .replace(/[^aeiouy]+/g, ' ')
      .trim()
      .split(/\s+/).length;
    syllables += count > 0 ? count : 1;
  }

  // Flesch Reading Ease score
  const score =
    206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);

  return Math.min(100, Math.max(0, Math.round(score)));
}

// Check keyword density
function checkKeywordDensity(text, keywords) {
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter((w) => w.trim().length > 0).length;

  const results = {};

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex) || [];
    const count = matches.length;
    const density = (count / wordCount) * 100;

    results[keyword] = {
      count,
      density: Math.round(density * 100) / 100,
    };
  }

  return results;
}

// Analyze HTML content
function analyzeHtmlContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(content);
  const { document } = dom.window;

  // Extract useful content (main content area)
  const mainContent = document.querySelector('main') || document.querySelector('body');
  const textContent = mainContent.textContent;

  // Basic stats
  const wordCount = textContent.split(/\s+/).filter((w) => w.trim().length > 0).length;
  const readabilityScore = calculateReadability(textContent);

  // Keyword analysis (if keywords provided)
  const keywordResults = keywords.length > 0 ? checkKeywordDensity(textContent, keywords) : null;

  // Image analysis
  const images = document.querySelectorAll('img');
  const imagesWithAlt = Array.from(images).filter(
    (img) => img.hasAttribute('alt') && img.getAttribute('alt').trim() !== ''
  );

  // Check for heading structure
  const headings = {
    h1: document.querySelectorAll('h1').length,
    h2: document.querySelectorAll('h2').length,
    h3: document.querySelectorAll('h3').length,
  };

  return {
    file: filePath,
    wordCount,
    readabilityScore,
    keywordResults,
    images: {
      total: images.length,
      withAlt: imagesWithAlt.length,
    },
    headings,
  };
}

// Get readability rating
function getReadabilityRating(score) {
  const { veryEasy, easy, fairlyEasy, standard, fairlyDifficult, difficult } =
    seoConfig.thresholds.content;
  if (score >= veryEasy) return 'Very Easy';
  if (score >= easy) return 'Easy';
  if (score >= fairlyEasy) return 'Fairly Easy';
  if (score >= standard) return 'Standard';
  if (score >= fairlyDifficult) return 'Fairly Difficult';
  if (score >= difficult) return 'Difficult';
  return 'Very Difficult';
}

// Main function
function main() {
  const directory = path.resolve(options.directory);
  console.log(`Scanning directory: ${directory} for HTML files...`);

  if (keywords.length > 0) {
    console.log(`Target keywords: ${keywords.join(', ')}`);
  }

  const htmlFiles = findHtmlFiles(directory);
  console.log(`Found ${htmlFiles.length} HTML files to analyze\n`);

  let totalWordCount = 0;
  let totalReadabilityScore = 0;

  for (const file of htmlFiles) {
    const result = analyzeHtmlContent(file);
    totalWordCount += result.wordCount;
    totalReadabilityScore += result.readabilityScore;

    const relativePath = path.relative(directory, file);
    console.log(`File: ${relativePath}`);
    console.log(`  Word Count: ${result.wordCount}`);
    console.log(
      `  Readability: ${result.readabilityScore}/100 (${getReadabilityRating(result.readabilityScore)})`
    );

    // Output heading structure
    console.log(
      `  Headings: H1 (${result.headings.h1}), H2 (${result.headings.h2}), H3 (${result.headings.h3})`
    );

    // Output image stats
    console.log(
      `  Images: ${result.images.withAlt}/${result.images.total} have alt text (${Math.round((result.images.withAlt / Math.max(1, result.images.total)) * 100)}%)`
    );

    // Output keyword analysis if available
    if (result.keywordResults) {
      console.log('  Keyword Analysis:');
      for (const [keyword, data] of Object.entries(result.keywordResults)) {
        const status = data.density < 0.5 ? '⚠️ Low' : data.density > 2.5 ? '⚠️ High' : '✅ Good';
        console.log(
          `   - "${keyword}": ${data.count} occurrences, ${data.density}% density ${status}`
        );
      }
    }

    console.log('');
  }

  // Summary
  if (htmlFiles.length > 0) {
    console.log('======== Summary ========');
    console.log(`Total Content: ${totalWordCount} words`);
    console.log(
      `Average Readability Score: ${Math.round(totalReadabilityScore / htmlFiles.length)}/100`
    );
    console.log(
      `Readability Rating: ${getReadabilityRating(Math.round(totalReadabilityScore / htmlFiles.length))}`
    );
  }
}

main();
