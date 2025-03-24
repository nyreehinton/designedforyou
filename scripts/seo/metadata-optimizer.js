#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function optimizeMetadata(filePath) {
  console.log(`Processing file: ${filePath}`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    let changes = 0;

    // Add charset meta tag if missing
    if (!$('meta[charset]').length) {
      $('head').prepend('<meta charset="UTF-8">');
      console.log(`- Added charset meta tag`);
      changes++;
    }

    // Add viewport meta tag if missing
    if (!$('meta[name="viewport"]').length) {
      $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      console.log(`- Added viewport meta tag`);
      changes++;
    }

    // Optimize title tag
    const title = $('title').text();
    if (!title || title.length < 10 || title.length > 60) {
      const pageName = path
        .basename(filePath, '.html')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const suggestedTitle = `${pageName} | Designed For You`;
      $('title').text(suggestedTitle);
      console.log(`- Optimized title tag: "${suggestedTitle}"`);
      changes++;
    }

    // Add meta description if missing or not optimal
    const metaDesc = $('meta[name="description"]');
    if (
      !metaDesc.length ||
      metaDesc.attr('content').length < 10 ||
      metaDesc.attr('content').length > 160
    ) {
      const pageName = path.basename(filePath, '.html').replace(/-/g, ' ');
      const description = `Discover ${pageName} - Expert web design and development services by Designed For You. We create stunning, fast-loading websites tailored to your business needs.`;

      if (metaDesc.length) {
        metaDesc.attr('content', description);
      } else {
        $('head').append(`<meta name="description" content="${description}">`);
      }
      console.log(`- Added/optimized meta description`);
      changes++;
    }

    // Add canonical link if missing
    if (!$('link[rel="canonical"]').length) {
      const fileName = path.basename(filePath);
      const canonicalUrl = `https://designedforyou.dev/${fileName}`;
      $('head').append(`<link rel="canonical" href="${canonicalUrl}">`);
      console.log(`- Added canonical link: ${canonicalUrl}`);
      changes++;
    }

    // Check if h1 exists
    if ($('h1').length !== 1) {
      console.log(
        `- [WARNING] Page should have exactly one H1 tag (currently has ${$('h1').length})`
      );
    }

    // Write optimized file if changes were made
    if (changes > 0) {
      fs.writeFileSync(filePath, $.html());
      console.log(`✅ Made ${changes} metadata improvements to ${path.basename(filePath)}`);
    } else {
      console.log(`⚠️ No metadata changes needed for ${path.basename(filePath)}`);
    }

    return changes;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return 0;
  }
}

// Process all HTML files in a directory and its subdirectories
function processDirectory(directory) {
  try {
    const files = fs.readdirSync(directory);
    let totalChanges = 0;
    let processedFiles = 0;

    files.forEach((file) => {
      const fullPath = path.join(directory, file);

      // Skip node_modules and hidden directories
      if (file.startsWith('.') || file === 'node_modules') {
        return;
      }

      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively process subdirectories
        totalChanges += processDirectory(fullPath);
      } else if (file.endsWith('.html')) {
        // Process HTML files
        totalChanges += optimizeMetadata(fullPath);
        processedFiles++;
      }
    });

    if (processedFiles > 0) {
      console.log(`\nProcessed ${processedFiles} HTML files in ${directory}`);
    }

    return totalChanges;
  } catch (error) {
    console.error(`❌ Error processing directory ${directory}: ${error.message}`);
    return 0;
  }
}

// Get current directory
const currentDir = process.cwd();
console.log(`Starting metadata optimization in ${currentDir}\n`);

// Run the optimization
const totalChanges = processDirectory(currentDir);
console.log(`\n✅ Completed metadata optimization with ${totalChanges} total changes`);
