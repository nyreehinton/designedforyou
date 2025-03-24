#!/usr/bin/env node

/**
 * Configure Netlify deployment preview settings
 * Usage: npm run deploy-preview -- -f -e -b "staging"
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { execSync } = require('child_process');

program
    .option('-f, --forms', 'Configure Netlify Forms')
    .option('-e, --env', 'Configure environment variables')
    .option('-b, --branch <branch>', 'Specify branch for preview', 'main')
    .option('--functions', 'Configure Netlify Functions')
    .option('--edge', 'Configure Netlify Edge Functions')
    .option('-v, --verbose', 'Display detailed output')
    .parse(process.argv);

const options = program.opts();
const configFile = 'netlify.toml';

// Check if netlify.toml exists, if not create it
if (!fs.existsSync(configFile)) {
    const basicConfig = `[build]
  command = "npm run build"
  publish = "build"
`;
    fs.writeFileSync(configFile, basicConfig);
    console.log(`Created ${configFile} with basic configuration`);
}

// Read existing configuration
let config = fs.readFileSync(configFile, 'utf8');

// Add or update build context for the branch
if (options.branch) {
    const branch = options.branch;

    // Check if the context already exists
    const contextRegex = new RegExp(`\\[context\\.${branch}\\]`, 'g');
    if (contextRegex.test(config)) {
        console.log(`Context for branch ${branch} already exists`);
    } else {
        config += `
[context.${branch}]
  command = "npm run build"
  publish = "build"
`;
        console.log(`✅ Added build context for branch ${branch}`);
    }
}

// Configure Netlify Forms
if (options.forms) {
    // Add forms documentation and example
    config += `
# Forms configuration
# Add the following to your HTML forms:
# <form name="contact" data-netlify="true">
#   <!-- form fields here -->
# </form>
`;
    console.log('✅ Added Netlify Forms configuration');

    // Create an example form in .github folder
    const githubDir = '.github';
    if (!fs.existsSync(githubDir)) {
        fs.mkdirSync(githubDir);
    }

    const exampleForm = `<!-- Example Netlify Form -->
<form name="contact" data-netlify="true" method="POST">
  <p>
    <label>Name: <input type="text" name="name" /></label>
  </p>
  <p>
    <label>Email: <input type="email" name="email" /></label>
  </p>
  <p>
    <label>Message: <textarea name="message"></textarea></label>
  </p>
  <p>
    <button type="submit">Send</button>
  </p>
</form>
`;

    fs.writeFileSync(`${githubDir}/example-form.html`, exampleForm);
    console.log(`Created example form at ${githubDir}/example-form.html`);
}

// Configure environment variables
if (options.env) {
    // Add environment variables section to config
    config += `
# Environment variables
# Set these in the Netlify UI or use the CLI:
# netlify env:set KEY VALUE
# Example:
[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
`;

    console.log('✅ Added environment variables configuration');

    // Create .env.example file
    const envExample = `# Example environment variables
# Copy to .env for local development
# Don't commit .env files to git

NODE_ENV=development
API_KEY=your_api_key_here
`;

    fs.writeFileSync('.env.example', envExample);
    console.log('Created .env.example file');
}

// Configure Netlify Functions
if (options.functions) {
    // Add functions section to config
    config += `
# Netlify Functions configuration
[functions]
  directory = "netlify/functions"
`;

    // Create functions directory and example function
    const functionsDir = 'netlify/functions';
    if (!fs.existsSync('netlify')) {
        fs.mkdirSync('netlify');
    }
    if (!fs.existsSync(functionsDir)) {
        fs.mkdirSync(functionsDir);
    }

    const exampleFunction = `// Example Netlify function
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify Functions!" }),
  };
};
`;

    fs.writeFileSync(`${functionsDir}/hello-world.js`, exampleFunction);
    console.log(`✅ Added Netlify Functions configuration and example function at ${functionsDir}/hello-world.js`);
}

// Configure Netlify Edge Functions
if (options.edge) {
    // Add edge functions section to config
    config += `
# Netlify Edge Functions configuration
[[edge_functions]]
  path = "/api/*"
  function = "transform"
`;

    // Create edge functions directory and example function
    const edgeFunctionsDir = 'netlify/edge-functions';
    if (!fs.existsSync('netlify')) {
        fs.mkdirSync('netlify');
    }
    if (!fs.existsSync(edgeFunctionsDir)) {
        fs.mkdirSync(edgeFunctionsDir);
    }

    const exampleEdgeFunction = `// Example Netlify Edge Function
export default async (request, context) => {
  const url = new URL(request.url);
  
  // Example: transform response by adding a header
  const response = await context.next();
  response.headers.set('X-Edge-Function', 'true');
  
  return response;
};
`;

    fs.writeFileSync(`${edgeFunctionsDir}/transform.js`, exampleEdgeFunction);
    console.log(`✅ Added Netlify Edge Functions configuration and example function at ${edgeFunctionsDir}/transform.js`);
}

// Add redirects and headers example
config += `
# Redirects examples
[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301

# Headers examples
[[headers]]
  for = "/*"
    [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
`;

// Write updated configuration
fs.writeFileSync(configFile, config);
console.log(`\n✅ Successfully updated ${configFile} with deploy preview settings`);

// Suggest Netlify CLI installation
console.log('\nFor local testing, install the Netlify CLI:');
console.log('  npm install -g netlify-cli');

// Provide commands to initialize and deploy
console.log('\nTo initialize a new Netlify site:');
console.log('  netlify init');
console.log('\nTo create a deploy preview:');
console.log(`  netlify deploy --branch=${options.branch}`);

// Check if netlify-cli is installed
try {
    execSync('netlify --version', { stdio: 'ignore' });
    console.log('\nNetlify CLI is already installed. You can run:');
    console.log('  netlify deploy --build');
} catch (error) {
    console.log('\nNetlify CLI is not installed. Install it with:');
    console.log('  npm install -g netlify-cli');
}