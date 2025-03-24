#!/usr/bin/env node

/**
 * MCP Validation Script
 * 
 * This script validates that your codebase follows the Model Context Protocol (MCP)
 * by checking directory structures, file naming, style imports, and other requirements.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Configuration
const config = {
  rootDir: process.cwd(),
  componentsDir: 'src/components',
  pagesDir: 'src/pages',
  stylesDir: 'src/styles',
  publicDir: 'public',
  
  // Patterns to validate
  patterns: {
    components: {
      tsx: true,
      hasInterface: true,
      noGlobalStyles: true,
      useCssModules: true
    },
    styles: {
      noRootSelector: true,
      useScopedVariables: true,
      prefixVariables: true
    },
    assets: {
      correctPaths: true,
      haveErrorHandling: true
    }
  }
};

let validationErrors = [];
let validationWarnings = [];
let validationSuccess = [];

/**
 * Main validation function
 */
async function validateMCP() {
  console.log('🔍 Starting MCP validation...');
  
  // Validate directory structure
  validateDirectoryStructure();
  
  // Validate component files
  await validateComponents();
  
  // Validate CSS modules
  validateCssModules();
  
  // Validate asset references
  validateAssetReferences();
  
  // Report results
  console.log('\n📋 MCP Validation Report:');
  
  if (validationSuccess.length > 0) {
    console.log('\n✅ Successful validations:');
    validationSuccess.forEach(item => console.log(`- ${item}`));
  }
  
  if (validationWarnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    validationWarnings.forEach(item => console.log(`- ${item}`));
  }
  
  if (validationErrors.length > 0) {
    console.log('\n❌ Errors:');
    validationErrors.forEach(item => console.log(`- ${item}`));
    
    console.log('\n❌ MCP validation failed! Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ MCP validation passed!');
    process.exit(0);
  }
}

/**
 * Validate directory structure according to MCP
 */
function validateDirectoryStructure() {
  console.log('\n🔍 Validating directory structure...');
  
  const requiredDirs = [
    config.componentsDir,
    config.pagesDir,
    config.stylesDir,
    config.publicDir,
    path.join(config.publicDir, 'images')
  ];
  
  let allValid = true;
  
  for (const dir of requiredDirs) {
    const fullPath = path.join(config.rootDir, dir);
    
    if (!fs.existsSync(fullPath)) {
      validationErrors.push(`Required directory "${dir}" does not exist`);
      allValid = false;
    }
  }
  
  if (allValid) {
    validationSuccess.push('Directory structure follows MCP guidelines');
  }
}

/**
 * Validate component files
 */
async function validateComponents() {
  console.log('\n🔍 Validating components...');
  
  const componentFiles = glob.sync(path.join(config.componentsDir, '**/*.tsx'));
  
  if (componentFiles.length === 0) {
    validationWarnings.push('No component files found to validate');
    return;
  }
  
  let interfaceCount = 0;
  let globalStyleImports = 0;
  let cssModuleImports = 0;
  
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Parse the file
    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
      
      // Check for interfaces
      let hasInterface = false;
      let hasGlobalStyleImport = false;
      let hasCssModuleImport = false;
      
      traverse(ast, {
        TSInterfaceDeclaration(path) {
          hasInterface = true;
          interfaceCount++;
        },
        ImportDeclaration(path) {
          const importPath = path.node.source.value;
          
          // Check for global style imports
          if (importPath.endsWith('.css') && !importPath.includes('.module.css')) {
            hasGlobalStyleImport = true;
            globalStyleImports++;
            validationErrors.push(`Global CSS import found in ${file}: "${importPath}"`);
          }
          
          // Check for CSS module imports
          if (importPath.includes('.module.css')) {
            hasCssModuleImport = true;
            cssModuleImports++;
          }
        }
      });
      
      // Validate interface existence if required
      if (config.patterns.components.hasInterface && !hasInterface) {
        validationWarnings.push(`No TypeScript interface found in ${file}`);
      }
      
      // Validate CSS module usage
      if (config.patterns.components.useCssModules && !hasCssModuleImport) {
        validationWarnings.push(`No CSS module import found in ${file}`);
      }
      
    } catch (error) {
      validationErrors.push(`Error parsing ${file}: ${error.message}`);
    }
  }
  
  validationSuccess.push(`Validated ${componentFiles.length} component files`);
  validationSuccess.push(`Found ${interfaceCount} TypeScript interfaces`);
  validationSuccess.push(`Found ${cssModuleImports} CSS module imports`);
  
  if (globalStyleImports > 0) {
    validationErrors.push(`Found ${globalStyleImports} global CSS imports that should be converted to CSS modules`);
  }
}

/**
 * Validate CSS modules
 */
function validateCssModules() {
  console.log('\n🔍 Validating CSS modules...');
  
  const cssFiles = glob.sync(path.join(config.stylesDir, '**/*.module.css'));
  
  if (cssFiles.length === 0) {
    validationWarnings.push('No CSS module files found to validate');
    return;
  }
  
  let rootSelectorCount = 0;
  let unscopedVarCount = 0;
  let unprefixedVarCount = 0;
  
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for :root selector
    if (content.includes(':root') && config.patterns.styles.noRootSelector) {
      rootSelectorCount++;
      validationErrors.push(`:root selector found in ${file} - use a scoped class instead`);
    }
    
    // Check for unscoped CSS variables
    const cssVarRegex = /^(\s*)--[a-zA-Z0-9-]+:/gm;
    let match;
    while ((match = cssVarRegex.exec(content)) !== null) {
      // If the indentation level is 0, it might be an unscoped variable
      if (match[1].length === 0) {
        unscopedVarCount++;
        validationWarnings.push(`Potentially unscoped CSS variable found in ${file}: "${match[0].trim()}"`);
      }
      
      // Check for app-specific prefixes
      if (config.patterns.styles.prefixVariables) {
        const varName = match[0].trim();
        if (!varName.includes('--app-') && !varName.includes('--tb-')) {
          unprefixedVarCount++;
          validationWarnings.push(`CSS variable without proper prefix found in ${file}: "${varName}"`);
        }
      }
    }
  }
  
  validationSuccess.push(`Validated ${cssFiles.length} CSS module files`);
  
  if (rootSelectorCount > 0) {
    validationErrors.push(`Found ${rootSelectorCount} :root selectors that should be converted to scoped classes`);
  }
  
  if (unscopedVarCount > 0) {
    validationWarnings.push(`Found ${unscopedVarCount} potentially unscoped CSS variables`);
  }
  
  if (unprefixedVarCount > 0) {
    validationWarnings.push(`Found ${unprefixedVarCount} CSS variables without proper app-specific prefixes`);
  }
}

/**
 * Validate asset references
 */
function validateAssetReferences() {
  console.log('\n🔍 Validating asset references...');
  
  const componentFiles = glob.sync(path.join(config.componentsDir, '**/*.tsx'));
  
  if (componentFiles.length === 0) {
    return;
  }
  
  let incorrectPathCount = 0;
  let missingErrorHandlerCount = 0;
  
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for relative image paths
    const relativePathRegex = /<img[^>]*src=["']\.\/images\/[^"']*["'][^>]*>/g;
    let match;
    while ((match = relativePathRegex.exec(content)) !== null) {
      incorrectPathCount++;
      validationErrors.push(`Relative image path found in ${file}: "${match[0]}"`);
    }
    
    // Check for missing error handlers
    const imgTagRegex = /<img[^>]*src=["'][^"']*["'][^>]*>/g;
    const imgWithErrorHandlerRegex = /<img[^>]*onError=["'][^"']*["'][^>]*>/g;
    
    const imgTags = content.match(imgTagRegex) || [];
    const imgTagsWithErrorHandler = content.match(imgWithErrorHandlerRegex) || [];
    
    if (imgTags.length > imgTagsWithErrorHandler.length) {
      missingErrorHandlerCount += (imgTags.length - imgTagsWithErrorHandler.length);
      validationWarnings.push(`${imgTags.length - imgTagsWithErrorHandler.length} image tags without error handlers found in ${file}`);
    }
  }
  
  validationSuccess.push(`Validated asset references in ${componentFiles.length} component files`);
  
  if (incorrectPathCount > 0) {
    validationErrors.push(`Found ${incorrectPathCount} incorrect relative image paths`);
  }
  
  if (missingErrorHandlerCount > 0) {
    validationWarnings.push(`Found ${missingErrorHandlerCount} image tags without error handlers`);
  }
}

// Run the validation
validateMCP().catch(error => {
  console.error('Error during validation:', error);
  process.exit(1);
});
