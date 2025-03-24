#!/usr/bin/env node

/**
 * Generate HTML-TSX file pairs from a content brief
 * Usage: npm run generate-page <pageName> -- --title "Page Title" --description "Page description"
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
    .argument('<pageName>', 'Name of the page to generate')
    .option('--title <title>', 'Page title')
    .option('--description <description>', 'Page description')
    .parse(process.argv);

const pageName = program.args[0];
const options = program.opts();
const title = options.title || `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page`;
const description = options.description || `Description for ${pageName} page`;

// Create HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
</head>
<body>
  <div data-component-id="${pageName}-container">
    <h1>${title}</h1>
    <p>${description}</p>
  </div>
</body>
</html>`;

// Create TSX file (for projects using React/TypeScript)
const tsxContent = `import { FC } from 'react';

interface ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Props {
  title: string;
  description: string;
}

const ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page: FC<${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Props> = ({ title, description }) => {
  return (
    <div id="${pageName}-container">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page;`;

// Write files
fs.writeFileSync(`${pageName}.html`, htmlContent);
console.log(`Created ${pageName}.html`);

fs.writeFileSync(`${pageName}.tsx`, tsxContent);
console.log(`Created ${pageName}.tsx`);

console.log(`Successfully generated HTML-TSX pair for ${pageName}`);