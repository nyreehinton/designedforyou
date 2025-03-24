#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function improveReadability(filePath) {
    console.log(`Processing file: ${filePath}`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content);
        let changes = 0;

        // Ensure proper heading structure
        if ($('h1').length !== 1) {
            // Add H1 if missing or remove extras
            if ($('h1').length === 0) {
                const pageName = path
                    .basename(filePath, '.html')
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase());
                $('body').prepend(`<h1>${pageName}</h1>`);
                console.log(`- Added H1 tag: "${pageName}"`);
                changes++;
            } else if ($('h1').length > 1) {
                // Keep only the first H1 and convert others to H2
                $('h1').each((i, elem) => {
                    if (i > 0) {
                        const $elem = $(elem);
                        const content = $elem.html();
                        $elem.replaceWith(`<h2>${content}</h2>`);
                    }
                });
                console.log(`- Fixed multiple H1 tags (converted extras to H2)`);
                changes++;
            }
        }

        // Add alt text to images
        let imagesModified = 0;
        $('img').each((i, elem) => {
            if (!$(elem).attr('alt')) {
                const pageName = path.basename(filePath, '.html').replace(/-/g, ' ');
                const altText = `${pageName} - image ${i + 1}`;
                $(elem).attr('alt', altText);
                imagesModified++;
            }
        });

        if (imagesModified > 0) {
            console.log(`- Added alt text to ${imagesModified} images`);
            changes++;
        }

        // Simplify text content
        $('p').each((i, elem) => {
            const text = $(elem).text();

            // Only process paragraphs with substantial text
            if (text.length > 50) {
                const simplifiedText = simplifyText(text);
                if (text !== simplifiedText) {
                    $(elem).text(simplifiedText);
                    console.log(`- Simplified paragraph ${i + 1}`);
                    changes++;
                }
            }
        });

        // Add semantic structure if missing
        if (!$('main').length) {
            // Wrap content in main tag for better semantics
            const $mainContent = $('<main></main>');
            $('body > *:not(script):not(header):not(footer)').wrapAll($mainContent);
            console.log(`- Added semantic <main> container`);
            changes++;
        }

        // Add semantic headers and footers if needed
        if (!$('header').length && $('h1').length) {
            $('h1').first().wrap('<header></header>');
            console.log(`- Added semantic <header> container`);
            changes++;
        }

        // Write optimized file if changes were made
        if (changes > 0) {
            fs.writeFileSync(filePath, $.html());
            console.log(`✅ Made ${changes} content improvements to ${path.basename(filePath)}`);
        } else {
            console.log(`⚠️ No content changes needed for ${path.basename(filePath)}`);
        }

        return changes;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}: ${error.message}`);
        return 0;
    }
}

function simplifyText(text) {
    return (
        text
        // Break long sentences into shorter ones
        .replace(/([.!?]),\s+/g, '$1 ')
        .replace(/(\w+) (which|that) (\w+)/g, '$1. This $3')
        // Replace complex words with simpler alternatives
        .replace(/\butilize(s|d)?\b/g, 'use$1')
        .replace(/\bimplement(s|ed|ing)?\b/g, 'use$1')
        .replace(/\bfacilitate(s|d|ing)?\b/g, 'help$1')
        .replace(/\bleverag(e|es|ed|ing)\b/g, 'use$1')
        .replace(/\boptimal\b/g, 'best')
        .replace(/\bmodification(s)?\b/g, 'change$1')
        .replace(/\badditional\b/g, 'more')
        .replace(/\brequirement(s)?\b/g, 'need$1')
        .replace(/\binitial(ly)?\b/g, 'first')
    );
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
                totalChanges += improveReadability(fullPath);
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
console.log(`Starting content optimization in ${currentDir}\n`);

// Run the optimization
const totalChanges = processDirectory(currentDir);
console.log(`\n✅ Completed content optimization with ${totalChanges} total changes`);