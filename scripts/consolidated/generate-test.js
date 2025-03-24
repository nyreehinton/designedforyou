#!/usr/bin/env node

/**
 * Create automated test scaffolding for HTML-TSX pairs
 * Usage: npm run generate-test -- -p <pageName> -t component
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
    .option('-p, --page <pageName>', 'Page name to generate tests for')
    .option('-t, --type <testType>', 'Type of test to generate (component, e2e, unit)', 'component')
    .parse(process.argv);

const options = program.opts();

if (!options.page) {
    console.error('Error: Page name is required');
    process.exit(1);
}

const pageName = options.page;
const testType = options.type;
const testsDir = './tests';

// Create tests directory if it doesn't exist
if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir);
}

// Create subdirectories for test types
if (!fs.existsSync(`${testsDir}/${testType}`)) {
    fs.mkdirSync(`${testsDir}/${testType}`);
}

function generateComponentTest(pageName) {
    const componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    const testContent = `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${componentName}Page from '../${pageName}.tsx';

describe('${componentName}Page Component', () => {
  it('renders without crashing', () => {
    render(<${componentName}Page title="Test Title" description="Test Description" />);
    
    // Basic assertions
    expect(screen.getByRole('heading')).toHaveTextContent('Test Title');
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
  
  it('has the correct container ID', () => {
    render(<${componentName}Page title="Test Title" description="Test Description" />);
    
    // Check that the container ID matches the one in the HTML
    const container = document.getElementById('${pageName}-container');
    expect(container).toBeInTheDocument();
  });
});
`;

    fs.writeFileSync(`${testsDir}/${testType}/${pageName}.test.tsx`, testContent);
    console.log(`Generated component test at ${testsDir}/${testType}/${pageName}.test.tsx`);
}

function generateE2ETest(pageName) {
    const testContent = `describe('${pageName} page', () => {
  beforeEach(() => {
    cy.visit('/${pageName}.html');
  });
  
  it('loads successfully', () => {
    // Check title
    cy.title().should('include', '${pageName.charAt(0).toUpperCase() + pageName.slice(1)}');
    
    // Check for container
    cy.get('[data-component-id="${pageName}-container"]').should('exist');
  });
  
  it('displays content correctly', () => {
    // Check heading
    cy.get('h1').should('be.visible');
    
    // Check for expected elements
    // Add more assertions as needed for your page
  });
});
`;

    fs.writeFileSync(`${testsDir}/${testType}/${pageName}.spec.js`, testContent);
    console.log(`Generated E2E test at ${testsDir}/${testType}/${pageName}.spec.js`);
}

function generateUnitTest(pageName) {
    const testContent = `const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('${pageName} HTML structure', () => {
  let dom;
  let container;
  
  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../${pageName}.html'), 'utf8');
    dom = new JSDOM(html);
    container = dom.window.document.querySelector('[data-component-id="${pageName}-container"]');
  });
  
  test('container element exists', () => {
    expect(container).not.toBeNull();
  });
  
  test('page has correct metadata', () => {
    const title = dom.window.document.querySelector('title');
    const metaDescription = dom.window.document.querySelector('meta[name="description"]');
    
    expect(title).not.toBeNull();
    expect(metaDescription).not.toBeNull();
  });
  
  test('content structure is valid', () => {
    const heading = container.querySelector('h1');
    const paragraph = container.querySelector('p');
    
    expect(heading).not.toBeNull();
    expect(paragraph).not.toBeNull();
  });
});
`;

    fs.writeFileSync(`${testsDir}/${testType}/${pageName}.test.js`, testContent);
    console.log(`Generated unit test at ${testsDir}/${testType}/${pageName}.test.js`);
}

// Generate test based on type
switch (testType) {
    case 'component':
        generateComponentTest(pageName);
        break;
    case 'e2e':
        generateE2ETest(pageName);
        break;
    case 'unit':
        generateUnitTest(pageName);
        break;
    default:
        console.error(`Unknown test type: ${testType}`);
        process.exit(1);
}

console.log(`Test generation complete for ${pageName}`);