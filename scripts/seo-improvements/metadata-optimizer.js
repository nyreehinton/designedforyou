#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function optimizeMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(content);

  // Ensure proper meta tags
  if (!$('meta[charset]').length) {
    $('head').prepend('<meta charset="UTF-8">');
  }

  if (!$('meta[name="viewport"]').length) {
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  }

  // Add canonical link
  if (!$('link[rel="canonical"]').length) {
    const canonicalUrl = `https://designedforyou.dev${filePath.replace(/^.*?\//, '/')}`;
    $('head').append(`<link rel="canonical" href="${canonicalUrl}">`);
  }

  // Optimize title
  const title = $('title').text();
  if (!title || title.length < 10 || title.length > 60) {
    const suggestedTitle = path.basename(filePath, '.html')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    $('title').text(suggestedTitle);
  }

  // Add meta description if missing
  if (!$('meta[name="description"]').length) {
    const description = `Discover ${path.basename(filePath, '.html').replace(/-/g, ' ')} - Expert web design and development services by Designed For You.`;
    $('head').append(`<meta name="description" content="${description}">`);
  }

  // Write optimized file
  fs.writeFileSync(filePath, $.html());
}

// Process all HTML files
function processHTMLFiles(directory) {
  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith('.html') && !file.includes('node_modules'));

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    optimizeMetadata(fullPath);
    console.log(`Optimized metadata for: ${file}`);
  });
}

// Run the optimization
processHTMLFiles('/Users/ree/Library/CloudStorage/OneDrive-Personal/_Web Design Business/designedforyou');
