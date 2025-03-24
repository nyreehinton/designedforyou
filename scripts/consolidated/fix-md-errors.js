#!/usr/bin/env node

/**
 * Fix common Markdown formatting issues in content files
 * Usage: npm run fix-md
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
    .option('-d, --directory <path>', 'Directory containing markdown files', '.')
    .option('-v, --verbose', 'Display detailed output')
    .parse(process.argv);

const options = program.opts();
const directory = options.directory;

// Find all markdown files in the directory
function findMarkdownFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            results = results.concat(findMarkdownFiles(itemPath));
        } else if (item.endsWith('.md') || item.endsWith('.markdown')) {
            results.push(itemPath);
        }
    }

    return results;
}

// Fix common markdown errors
function fixMarkdownErrors(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    let changes = 0;

    // Fix heading space issues (## Heading vs ##Heading)
    fixedContent = fixedContent.replace(/^(#{1,6})([^ #])/gm, (match, hashes, text) => {
        changes++;
        return `${hashes} ${text}`;
    });

    // Fix list item space issues (* item vs *item)
    fixedContent = fixedContent.replace(/^([*+-])([^ ])/gm, (match, bullet, text) => {
        changes++;
        return `${bullet} ${text}`;
    });

    // Fix numbered list space issues (1. item vs 1.item)
    fixedContent = fixedContent.replace(/^(\d+\.)([^ ])/gm, (match, number, text) => {
        changes++;
        return `${number} ${text}`;
    });

    // Fix link syntax issues ([text](url) vs [text] (url))
    fixedContent = fixedContent.replace(/\[([^\]]+)\]\s+\(([^)]+)\)/g, (match, text, url) => {
        changes++;
        return `[${text}](${url})`;
    });

    // If changes were made, write the file
    if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent);
        if (options.verbose) {
            console.log(`Fixed ${changes} issues in ${filePath}`);
        }
        return changes;
    }

    return 0;
}

// Process all markdown files
const files = findMarkdownFiles(directory);
let totalChanges = 0;
let filesChanged = 0;

for (const file of files) {
    const changes = fixMarkdownErrors(file);
    if (changes > 0) {
        filesChanged++;
        totalChanges += changes;
    }
}

console.log(`\nMarkdown fixes complete: ${totalChanges} issues fixed across ${filesChanged} files`);