#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const readability = require('readability-metrics');

function improveReadability(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(content);

  // Ensure proper heading structure
  if ($('h1').length !== 1) {
    // Add or modify H1 if missing or multiple
    $('body').prepend(`<h1>${path.basename(filePath, '.html').replace(/-/g, ' ')}</h1>`);
  }

  // Simplify text content
  $('p, div').each((i, elem) => {
    const text = $(elem).text();
    const simplifiedText = simplifyText(text);
    $(elem).text(simplifiedText);
  });

  // Add alt text to images
  $('img').each((i, elem) => {
    if (!$(elem).attr('alt')) {
      const altText = `Image ${i + 1} for ${path.basename(filePath, '.html')}`;
      $(elem).attr('alt', altText);
    }
  });

  // Write optimized file
  fs.writeFileSync(filePath, $.html());
}

function simplifyText(text) {
  // Break long sentences
  return text
    .replace(/([.!?])\s*(\w)/g, '$1\n$2')  // Add line breaks after sentences
    .split('\n')
    .map(sentence => {
      // Simplify complex words
      return sentence
        .replace(/\b(utilize)\b/g, 'use')
        .replace(/\b(implement)\b/g, 'do')
        .replace(/\b(facilitate)\b/g, 'help')
        .replace(/\b(leverage)\b/g, 'use');
    })
    .join('\n');
}

// Process all HTML files
function processHTMLFiles(directory) {
  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith('.html') && !file.includes('node_modules'));

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    improveReadability(fullPath);
    console.log(`Improved readability for: ${file}`);
  });
}

// Run the optimization
processHTMLFiles('/Users/ree/Library/CloudStorage/OneDrive-Personal/_Web Design Business/designedforyou');
