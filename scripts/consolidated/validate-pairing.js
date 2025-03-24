#!/usr/bin/env node

/**
 * Check for mismatches between HTML placeholders and TSX props
 * Usage: npm run validate-pairing -- --single <pageName>
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { JSDOM } = require('jsdom');
const ts = require('typescript');

program
    .option('-s, --single <pageName>', 'Validate a specific page')
    .option('-a, --all', 'Validate all HTML-TSX pairs')
    .option('-v, --verbose', 'Display detailed output')
    .parse(process.argv);

const options = program.opts();

function validatePair(pageName) {
    console.log(`Validating ${pageName}...`);

    // Check if files exist
    if (!fs.existsSync(`${pageName}.html`)) {
        console.error(`${pageName}.html does not exist`);
        return false;
    }

    if (!fs.existsSync(`${pageName}.tsx`)) {
        console.error(`${pageName}.tsx does not exist`);
        return false;
    }

    // Read files
    const htmlContent = fs.readFileSync(`${pageName}.html`, 'utf8');
    const tsxContent = fs.readFileSync(`${pageName}.tsx`, 'utf8');

    // Parse HTML
    const dom = new JSDOM(htmlContent);
    const dataComponents = Array.from(dom.window.document.querySelectorAll('[data-component-id]'));
    const htmlIds = dataComponents.map(el => el.getAttribute('data-component-id'));

    // Check for component IDs in TSX
    const tsxMatches = htmlIds.filter(id => tsxContent.includes(`id="${id}"`));

    if (options.verbose) {
        console.log('HTML data-component-ids:', htmlIds);
        console.log('TSX matching ids:', tsxMatches);
    }

    // Check for mismatches
    const mismatches = htmlIds.filter(id => !tsxMatches.includes(id));

    if (mismatches.length === 0) {
        console.log(`✅ ${pageName} validation passed`);
        return true;
    } else {
        console.error(`❌ ${pageName} validation failed with mismatches:`, mismatches);
        return false;
    }
}

// Run validation
if (options.single) {
    validatePair(options.single);
} else if (options.all) {
    // Find all HTML files and validate their pairs
    const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
    const results = htmlFiles.map(file => {
        const pageName = file.replace('.html', '');
        return validatePair(pageName);
    });

    const passCount = results.filter(result => result).length;
    console.log(`\nValidation complete: ${passCount}/${results.length} pairs passed`);
} else {
    console.error('Please specify --single <pageName> or --all');
}