/**
 * HTML to TSX Conversion Tool
 *
 * Converts HTML files to TSX components with proper structure
 * following the MCP guidelines.
 *
 * Usage: node scripts/html-to-tsx.js path/to/file.html [output-path]
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Check if the required arguments are provided
if (process.argv.length < 3) {
  console.error('Usage: node html-to-tsx.js <html-file> [output-file]');
  process.exit(1);
}

const htmlPath = process.argv[2];
const outputPath = process.argv[3] || htmlPath.replace('.html', '.tsx');

// Read the HTML file
try {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Parse the HTML content
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  // Extract the title and main content
  const titleElement = document.querySelector('title');
  const title = titleElement ? titleElement.textContent : 'Page Title';
  const mainContent = document.querySelector('main') || document.querySelector('body');

  // Extract data attributes if present
  const dataComponentId = mainContent.getAttribute('data-component-id') || '';
  const dataPropsStr = mainContent.getAttribute('data-props') || '{}';
  let dataProps = {};

  try {
    dataProps = JSON.parse(dataPropsStr);
  } catch (err) {
    console.warn('Warning: Invalid JSON in data-props attribute:', dataPropsStr);
  }

  // Extract component name from file name
  const fileName = path.basename(htmlPath, '.html');
  const componentName = fileName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // Determine CSS module path relative to the component file
  const outputDir = path.dirname(outputPath);
  const relativePathToStyles = path.relative(outputDir, 'styles');

  // Determine target CSS module directory and file name
  const outputDirParts = outputDir.split(path.sep);
  const componentType = outputDirParts.includes('pages')
    ? 'pages'
    : outputDirParts.includes('ui')
      ? 'ui'
      : outputDirParts.includes('layout')
        ? 'layout'
        : '';

  const cssModuleDir = componentType ? path.join('styles', componentType) : 'styles';

  const cssModulePath = path.join(cssModuleDir, `${componentName}.module.css`);
  const cssModuleImportPath = path.join(
    relativePathToStyles,
    componentType,
    `${componentName}.module.css`
  );

  // Combine properties to avoid duplicates
  const propTypes = {
    title: 'string',
    className: 'string',
    ...Object.fromEntries(
      Object.entries(dataProps).map(([key, value]) => [
        key,
        typeof value === 'string' ? 'string' : typeof value,
      ])
    ),
  };

  // Generate TypeScript interface for props
  const propsInterface = `interface ${componentName}Props {
${Object.entries(propTypes)
  .map(([key, type]) => `  ${key}?: ${type};`)
  .join('\n')}
}`;

  // Generate the TSX component
  const tsxTemplate = `import React from 'react';
import styles from '${cssModuleImportPath.replace(/\\/g, '/')}';

// Component props
${propsInterface}

/**
 * ${componentName} component
 * 
 * @param props - Component properties
 * @returns React component
 */
const ${componentName}: React.FC<${componentName}Props> = ({ 
  title = "${title}",
${Object.entries(dataProps)
  .map(([key, value]) => `  ${key} = ${JSON.stringify(value)},`)
  .join('\n')}
  className = "",
}) => {
  return (
    <div className={\`\${styles.root} \${styles.container} \${className}\`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        ${dataProps.description ? '<p className={styles.description}>{description}</p>' : ''}
      </div>
      <div className={styles.content}>
        {/* Content goes here */}
      </div>
    </div>
  );
};

export default ${componentName};
`;

  // Write the TSX file
  fs.writeFileSync(outputPath, tsxTemplate);
  console.log(`Converted ${htmlPath} to ${outputPath}`);

  // Generate a CSS module file if it doesn't exist
  if (!fs.existsSync(cssModuleDir)) {
    fs.mkdirSync(cssModuleDir, { recursive: true });
  }

  if (!fs.existsSync(cssModulePath)) {
    const cssModuleContent = `/* ${componentName} styles */
.root {
  /* CSS variables scoped to this component */
  --app-primary-color: #0a2856;
  --app-secondary-color: #c19b4a;
  --app-text-color: #333333;
  --app-background-color: #ffffff;
}

.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--app-primary-color);
  margin-bottom: 0.5rem;
}

.description {
  font-size: 1rem;
  color: var(--app-text-color);
}

.content {
  flex: 1;
}`;

    fs.writeFileSync(cssModulePath, cssModuleContent);
    console.log(`Created CSS module: ${cssModulePath}`);
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
