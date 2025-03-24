#!/usr/bin/env node

/**
 * Analyze and optimize HTML-TSX pairs
 * Usage: npm run optimize-performance -- -p <pageName> --lazy-load
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { JSDOM } = require('jsdom');

program
    .option('-p, --page <pageName>', 'Page name to optimize')
    .option('--lazy-load', 'Add lazy loading to images')
    .option('--add-preload', 'Add preload hints for critical resources')
    .option('--minify', 'Minify HTML output')
    .option('--compress-images', 'Suggest image compression')
    .option('-v, --verbose', 'Display detailed output')
    .parse(process.argv);

const options = program.opts();

if (!options.page) {
    console.error('Error: Page name is required');
    process.exit(1);
}

const pageName = options.page;
const htmlFile = `${pageName}.html`;
const tsxFile = `${pageName}.tsx`;

// Check if files exist
if (!fs.existsSync(htmlFile)) {
    console.error(`${htmlFile} does not exist`);
    process.exit(1);
}

if (!fs.existsSync(tsxFile)) {
    console.error(`${tsxFile} does not exist`);
    process.exit(1);
}

// Read files
const htmlContent = fs.readFileSync(htmlFile, 'utf8');
const tsxContent = fs.readFileSync(tsxFile, 'utf8');

// Parse HTML
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

// Performance optimizations
let optimizationsApplied = 0;

// Function to add lazy loading to images
function addLazyLoadingToImages() {
    const images = document.querySelectorAll('img');
    let count = 0;

    images.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
            count++;
        }
    });

    if (count > 0) {
        console.log(`✅ Added lazy loading to ${count} images`);
        optimizationsApplied++;
    } else {
        console.log('No images found to add lazy loading');
    }
}

// Function to add preload hints
function addPreloadHints() {
    const head = document.querySelector('head');
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    let count = 0;

    // Add preload for stylesheets
    cssLinks.forEach(link => {
        const href = link.getAttribute('href');
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = href;
        preloadLink.as = 'style';
        head.insertBefore(preloadLink, head.firstChild);
        count++;
    });

    // Add preload for critical scripts
    scripts.forEach(script => {
        const src = script.getAttribute('src');
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = src;
        preloadLink.as = 'script';
        head.insertBefore(preloadLink, head.firstChild);
        count++;
    });

    if (count > 0) {
        console.log(`✅ Added ${count} preload hints`);
        optimizationsApplied++;
    } else {
        console.log('No resources found to preload');
    }
}

// Function to minify HTML
function minifyHTML(html) {
    // Simple minification - remove comments, whitespace between tags
    let minified = html
        .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
        .replace(/\n\s+/g, '\n') // Remove indentation
        .replace(/>\s+</g, '><'); // Remove whitespace between tags

    console.log('✅ HTML minified');
    optimizationsApplied++;
    return minified;
}

// Function to suggest image compression
function suggestImageCompression() {
    const images = document.querySelectorAll('img');

    if (images.length > 0) {
        console.log('⚠️ Image compression recommended for better performance:');
        images.forEach(img => {
            const src = img.getAttribute('src');
            console.log(`  - ${src}`);
        });
        console.log('Consider using tools like ImageOptim, TinyPNG, or sharp');
        optimizationsApplied++;
    } else {
        console.log('No images found to compress');
    }
}

// Apply optimizations based on options
if (options.lazyLoad) {
    addLazyLoadingToImages();
}

if (options.addPreload) {
    addPreloadHints();
}

let outputHTML = dom.serialize();

if (options.minify) {
    outputHTML = minifyHTML(outputHTML);
}

if (options.compressImages) {
    suggestImageCompression();
}

// Save optimized HTML
if (optimizationsApplied > 0) {
    fs.writeFileSync(htmlFile, outputHTML);
    console.log(`\n✅ Successfully applied ${optimizationsApplied} optimizations to ${htmlFile}`);
} else {
    console.log('\nNo optimizations were applied');
}