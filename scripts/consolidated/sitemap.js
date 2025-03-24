#!/usr/bin/env node

/**
 * SEO Sitemap Generator
 * Generates an XML sitemap for the website
 */

import fs from 'fs';
import path from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { Command } from 'commander';
import { seoConfig } from './config.js';

// Configure CLI options
const program = new Command();
program
  .option('-d, --directory <path>', 'Directory to scan', '.')
  .option('-o, --output <path>', 'Output file', seoConfig.paths.sitemapPath)
  .option('-b, --base-url <url>', 'Base URL for the site', seoConfig.baseUrl)
  .option(
    '-p, --priority <priority>',
    'Default priority',
    seoConfig.sitemap.defaultPriority.toString()
  )
  .parse(process.argv);

const options = program.opts();

// Find all HTML files
function findHtmlFiles(dir, baseDir = dir) {
  const results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...findHtmlFiles(filePath, baseDir));
    } else if (path.extname(file) === '.html') {
      // Get relative path from base directory
      let relativePath = path.relative(baseDir, filePath);

      // Convert Windows backslashes to forward slashes if needed
      relativePath = relativePath.replace(/\\/g, '/');

      // Handle index.html special case
      if (path.basename(relativePath) === 'index.html') {
        relativePath = path.dirname(relativePath);
        if (relativePath === '.') {
          relativePath = '';
        }
      }

      results.push({
        path: relativePath,
        lastmod: new Date(stat.mtime).toISOString(),
      });
    }
  }

  return results;
}

// Generate XML sitemap
async function generateSitemap(pages, baseUrl) {
  try {
    // Prepare links
    const links = pages.map((page) => {
      // For the root URL
      const url = page.path === '' ? '/' : `/${page.path}`;

      return {
        url,
        lastmod: page.lastmod,
        changefreq: url === '/' ? 'daily' : 'weekly',
        priority: url === '/' ? 1.0 : parseFloat(options.priority), // Convert to number
      };
    });

    // Create a sitemap stream
    const stream = new SitemapStream({ hostname: baseUrl });

    // Generate XML
    const data = await streamToPromise(Readable.from(links).pipe(stream));

    return data.toString();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

// Write sitemap to file
function writeSitemap(xml, outputPath) {
  // Create directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(outputPath, xml);
  console.log(`Sitemap generated at: ${outputPath}`);
}

// Generate robots.txt
function generateRobotsTxt(sitemapUrl) {
  return `# robots.txt
User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}

// Main function
async function main() {
  const directory = path.resolve(options.directory);
  const outputPath = path.resolve(options.output);
  const baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash if present

  console.log(`Scanning directory: ${directory} for HTML files...`);

  try {
    // Find all HTML files
    const pages = findHtmlFiles(directory);
    console.log(`Found ${pages.length} HTML pages`);

    if (pages.length === 0) {
      console.warn('No HTML pages found. Sitemap will be empty.');
    }

    // Generate sitemap
    console.log('Generating sitemap...');
    const xml = await generateSitemap(pages, baseUrl);

    // Write sitemap to file
    writeSitemap(xml, outputPath);

    // Generate robots.txt next to sitemap
    const robotsPath = path.join(path.dirname(outputPath), 'robots.txt');
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const robotsTxt = generateRobotsTxt(sitemapUrl);

    fs.writeFileSync(robotsPath, robotsTxt);
    console.log(`Robots.txt generated at: ${robotsPath}`);

    console.log('Sitemap and robots.txt generation completed successfully.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Set timeout limit for the operation
const timeout = 30000; // 30 seconds
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Sitemap generation timed out')), timeout);
});

// Run with timeout protection
Promise.race([main(), timeoutPromise]).catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
