#!/usr/bin/env node

/**
 * MCP Component Creator Tool
 * 
 * This script creates new components following the Model Context Protocol (MCP)
 * guidelines. It generates TSX components with proper TypeScript interfaces,
 * CSS modules, and appropriate directory structure.
 * 
 * Usage:
 *   node create-component.js --name MyComponent --type page|block|ui --app [app-name]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let componentName = '';
let componentType = 'ui'; // Default type
let appName = ''; // Optional app name for integration

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name' && args[i + 1]) {
    componentName = args[i + 1];
    i++;
  } else if (args[i] === '--type' && args[i + 1]) {
    componentType = args[i + 1];
    i++;
  } else if (args[i] === '--app' && args[i + 1]) {
    appName = args[i + 1];
    i++;
  }
}

if (!componentName) {
  console.error('Error: Component name is required. Use --name ComponentName');
  process.exit(1);
}

// Ensure component name starts with a capital letter
componentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

// Configuration
const config = {
  rootDir: process.cwd(),
  componentsDir: 'src/components',
  stylesDir: 'src/styles',
  pagesDir: 'src/pages'
};

/**
 * Main function to create a component
 */
async function createComponent() {
  console.log(`Creating ${componentType} component: ${componentName}`);

  // Determine component directory based on type and app name
  let componentDir;
  if (appName) {
    componentDir = path.join(config.componentsDir, appName.toLowerCase());
    
    // For app components, organize by component type
    if (componentType === 'ui') {
      componentDir = path.join(componentDir, 'ui');
    } else if (componentType === 'layout') {
      componentDir = path.join(componentDir, 'layout');
    } else if (componentType === 'feature') {
      // Convert feature name to kebab case directory
      const featureDirName = componentName
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      componentDir = path.join(componentDir, featureDirName);
    }
  } else {
    if (componentType === 'page') {
      componentDir = path.join(config.componentsDir, 'pages');
    } else if (componentType === 'block') {
      componentDir = path.join(config.componentsDir, 'blocks');
    } else {
      componentDir = path.join(config.componentsDir, 'ui');
    }
  }

  // Create component directory if it doesn't exist
  if (!fs.existsSync(componentDir)) {
    console.log(`Creating directory: ${componentDir}`);
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // Create component files
  createComponentFiles(componentDir, componentName, componentType, appName);
}

/**
 * Check available directories before starting
 */
function checkAvailableDirectories() {
  console.log('Checking available directories...');
  
  try {
    // List the current directory to see what's available
    const rootContents = fs.readdirSync(config.rootDir);
    
    // Check if src directory exists
    if (!rootContents.includes('src')) {
      console.log('Warning: "src" directory not found in current directory.');
      console.log('Available directories:', rootContents.join(', '));
      
      // Ask user to confirm or specify path
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Would you like to create the missing directories? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          // Create necessary directories
          if (!fs.existsSync(path.join(config.rootDir, 'src'))) {
            fs.mkdirSync(path.join(config.rootDir, 'src'));
          }
          if (!fs.existsSync(path.join(config.rootDir, config.componentsDir))) {
            fs.mkdirSync(path.join(config.rootDir, config.componentsDir), { recursive: true });
          }
          if (!fs.existsSync(path.join(config.rootDir, config.stylesDir))) {
            fs.mkdirSync(path.join(config.rootDir, config.stylesDir), { recursive: true });
          }
          console.log('Created necessary directories.');
          readline.close();
          createComponent();
        } else {
          console.log('Operation cancelled. Please navigate to the correct directory.');
          readline.close();
          process.exit(1);
        }
      });
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking directories:', error.message);
    return false;
  }
}

/**
 * Create component files
 */
function createComponentFiles(componentDir, componentName, componentType, appName) {
  // Create component TSX file
  const componentPath = path.join(componentDir, `${componentName}.tsx`);
  const componentContent = generateComponentCode(componentName, componentType, appName);
  
  console.log(`Creating component file: ${componentPath}`);
  fs.writeFileSync(componentPath, componentContent);
  
  // Create CSS module file
  let cssModulePath;
  if (appName) {
    // For app components, create a scoped CSS module
    cssModulePath = path.join(config.stylesDir, `${appName.toLowerCase()}-${componentName.toLowerCase()}.module.css`);
  } else {
    cssModulePath = path.join(config.stylesDir, `${componentName.toLowerCase()}.module.css`);
  }
  
  const cssModuleContent = generateCssModuleCode(componentName, appName);
  console.log(`Creating CSS module: ${cssModulePath}`);
  fs.writeFileSync(cssModulePath, cssModuleContent);
  
  // If it's a page component, also create a page file
  if (componentType === 'page') {
    createPageFile(componentName, appName);
  }
  
  // If this is a new app integration, create app-level files if they don't exist
  if (appName && !fs.existsSync(path.join(config.componentsDir, appName.toLowerCase(), `${appName}Page.tsx`))) {
    createAppMainFile(appName);
  }
  
  console.log(`✅ Component ${componentName} created successfully!`);
}

/**
 * Generate component TSX code
 */
function generateComponentCode(componentName, componentType, appName) {
  const componentCode = `import React from 'react';
import styles from '${appName 
  ? `@/styles/${appName.toLowerCase()}-${componentName.toLowerCase()}.module.css`
  : `@/styles/${componentName.toLowerCase()}.module.css`}';

${componentType === 'page' 
  ? `// Page component props
interface ${componentName}Props {
  title?: string;
  description?: string;
}` 
  : `// Component props
interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}`}

/**
 * ${componentName} ${componentType} component
 ${appName ? `* Part of the ${appName} application` : ''}
 */
const ${componentName}: React.FC<${componentName}Props> = ({ 
  ${componentType === 'page' 
    ? 'title = "Default Title", description = "Default description"' 
    : 'className = "", children'} 
}) => {
  return (
    <div className={${appName ? `\`\${styles.root} \${styles.container}\`` : 'styles.root'}}>
      ${componentType === 'page' 
        ? `<div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.content}>
        {/* Page content goes here */}
      </div>`
        : `{/* Component content */}
      {children}`}
    </div>
  );
};

export default ${componentName};
`;

  return componentCode;
}

/**
 * Generate CSS Module code
 */
function generateCssModuleCode(componentName, appName) {
  const prefix = appName ? `--${appName.toLowerCase()}-` : '--app-';
  
  const cssCode = `/* ${componentName} styles */
.root {
  /* CSS variables scoped to this component */
  ${prefix}primary-color: #0a2856;
  ${prefix}secondary-color: #c19b4a;
  ${prefix}text-color: #333333;
  ${prefix}background-color: #ffffff;
}

.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

${componentName.toLowerCase() === 'page' 
  ? `.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: var(${prefix}primary-color);
  margin-bottom: 0.5rem;
}

.description {
  font-size: 1rem;
  color: var(${prefix}text-color);
}

.content {
  flex: 1;
}`
  : '/* Additional component-specific styles */'}
`;

  return cssCode;
}

/**
 * Create a Next.js page file
 */
function createPageFile(componentName, appName) {
  const pageFileName = componentName.toLowerCase().replace(/page$/, '');
  const pagePath = path.join(config.pagesDir, `${pageFileName}.tsx`);
  
  const pageCode = `import React from 'react';
import Head from 'next/head';
import ${componentName} from '@/components/${appName ? appName.toLowerCase() + '/' : 'pages/'}${componentName}';

/**
 * ${componentName} page
 */
export default function ${componentName}Page() {
  return (
    <>
      <Head>
        <title>${componentName}</title>
        <meta name="description" content="${componentName} page" />
      </Head>
      <${componentName} 
        title="${componentName}"
        description="Welcome to the ${componentName} page"
      />
    </>
  );
}
`;

  console.log(`Creating page file: ${pagePath}`);
  fs.writeFileSync(pagePath, pageCode);
}

/**
 * Create main app file for new app integrations
 */
function createAppMainFile(appName) {
  const appMainPath = path.join(config.componentsDir, appName.toLowerCase(), `${appName}Page.tsx`);
  const appMainCode = `import React from 'react';
import styles from '@/styles/${appName.toLowerCase()}.module.css';

/**
 * Main ${appName} application component
 */
const ${appName}Page: React.FC = () => {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1>${appName} Application</h1>
      </header>
      <main className={styles.main}>
        {/* Main content will be rendered here */}
      </main>
    </div>
  );
};

export default ${appName}Page;
`;

  console.log(`Creating main app file: ${appMainPath}`);
  fs.mkdirSync(path.dirname(appMainPath), { recursive: true });
  fs.writeFileSync(appMainPath, appMainCode);
  
  // Also create the main CSS module for the app
  const appCssPath = path.join(config.stylesDir, `${appName.toLowerCase()}.module.css`);
  const appCssCode = `/* ${appName} application styles */
.root {
  /* CSS variables scoped to ${appName} */
  --${appName.toLowerCase()}-primary-color: #0a2856;
  --${appName.toLowerCase()}-secondary-color: #c19b4a;
  --${appName.toLowerCase()}-text-color: #333333;
  --${appName.toLowerCase()}-background-color: #f5f5f5;
  
  width: 100%;
  min-height: 100vh;
  background-color: var(--${appName.toLowerCase()}-background-color);
}

.header {
  background-color: var(--${appName.toLowerCase()}-primary-color);
  color: white;
  padding: 1rem 2rem;
}

.main {
  padding: 2rem;
}
`;

  console.log(`Creating main CSS module: ${appCssPath}`);
  fs.writeFileSync(appCssPath, appCssCode);
}
    