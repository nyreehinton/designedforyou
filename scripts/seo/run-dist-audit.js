#!/usr/bin/env node

/**
 * This script runs an SEO audit specifically on the dist directory
 * to verify that the built site is properly optimized.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Create a temporary package.json with cheerio dependency in dist
function createTempPackageJson() {
  const tempPackageJson = {
    name: 'seo-audit-temp',
    version: '1.0.0',
    description: 'Temporary package for SEO audit',
    dependencies: {
      cheerio: '^1.0.0-rc.10',
    },
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'dist', 'package.json'),
    JSON.stringify(tempPackageJson, null, 2)
  );
}

// Copy the seo-audit.js script to the dist directory
const scriptDir = path.dirname(__filename);
const auditScript = path.join(scriptDir, 'seo-audit.js');
const distAuditScript = path.join(process.cwd(), 'dist', 'audit-script.js');
const nodeModulesDir = path.join(process.cwd(), 'node_modules');
const distNodeModulesDir = path.join(process.cwd(), 'dist', 'node_modules');

try {
  // Make sure dist directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
    console.error('❌ Error: dist directory does not exist. Run build first.');
    process.exit(1);
  }

  // Copy the audit script to dist
  fs.copyFileSync(auditScript, distAuditScript);

  // Create temp package.json for dependencies
  console.log('Setting up dependencies for audit...');

  // Option 1: Create symlink to node_modules (faster but platform-dependent)
  if (fs.existsSync(nodeModulesDir) && !fs.existsSync(distNodeModulesDir)) {
    try {
      fs.symlinkSync(nodeModulesDir, distNodeModulesDir, 'junction');
      console.log('Created symlink to node_modules');
    } catch (symlinkError) {
      console.log('Could not create symlink, creating package.json instead...');
      createTempPackageJson();

      // Install dependencies in dist directory
      console.log('Installing dependencies in dist directory...');
      const install = spawn('npm', ['install', '--no-audit', '--loglevel=error'], {
        cwd: path.join(process.cwd(), 'dist'),
        stdio: 'inherit',
      });

      install.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Failed to install dependencies in dist directory, code ${code}`);
          process.exit(code);
        }
        runAudit();
      });

      return; // Exit this function and continue after npm install completes
    }
  }

  // Run the audit directly if symlink worked or node_modules already exists
  runAudit();
} catch (error) {
  console.error('❌ Error running dist directory SEO audit:', error.message);
  cleanupAndExit(1);
}

function runAudit() {
  // Run the audit in the dist directory
  console.log('Running SEO audit on dist directory...');

  const audit = spawn('node', ['audit-script.js'], {
    cwd: path.join(process.cwd(), 'dist'),
    stdio: 'inherit',
  });

  audit.on('close', (code) => {
    cleanupAndExit(code);
  });
}

function cleanupAndExit(code) {
  // Clean up temporary files
  console.log('Cleaning up temporary files...');

  if (fs.existsSync(distAuditScript)) {
    fs.unlinkSync(distAuditScript);
  }

  // Remove symlink if created
  if (fs.existsSync(distNodeModulesDir) && fs.lstatSync(distNodeModulesDir).isSymbolicLink()) {
    fs.unlinkSync(distNodeModulesDir);
  }

  if (code === 0) {
    console.log('✅ Dist directory SEO audit completed successfully!');
  } else {
    console.error(`❌ SEO audit failed with code ${code}`);
    process.exit(code);
  }
}
