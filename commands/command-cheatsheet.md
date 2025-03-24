# Command Cheatsheet

This document outlines all available commands for the DesignedForYou website management.

## Table of Contents

- [SEO Tools](#seo-tools)
- [Deployment Tools](#deployment-tools)

## SEO Tools

SEO tools help optimize your website content and monitor SEO performance.

```bash
# Get help on SEO commands
./commands/seo-tools.sh --help

# Run metadata validation and optimization
./commands/seo-tools.sh metadata

# Run content analysis and optimization
./commands/seo-tools.sh content

# Generate sitemap (defaults to https://designedforyou.dev)
./commands/seo-tools.sh sitemap [url]

# Generate an SEO report (defaults to https://designedforyou.dev)
./commands/seo-tools.sh report [url]

# Run all SEO tools in sequence
./commands/seo-tools.sh all
```

## Deployment Tools

Deployment tools help with building and deploying the website.

```bash
# Get help on deployment commands
./commands/deployment-tools.sh --help

# Configure deployment preview for a branch
./commands/deployment-tools.sh deploy-preview -b "staging"

# Build the application
./commands/deployment-tools.sh build

# Export static files to export/ directory
./commands/deployment-tools.sh export

# Start production server locally
./commands/deployment-tools.sh start
```

## Examples

Example workflows for common tasks:

### SEO Optimization Workflow

```bash
# Run full SEO optimization
./commands/seo-tools.sh all

# Generate specific report for another URL
./commands/seo-tools.sh report https://designedforyou.dev/about
```

### Deployment Workflow

```bash
# For staging deployment
./commands/deployment-tools.sh deploy-preview -b "staging"
./commands/deployment-tools.sh build

# For production deployment
./commands/deployment-tools.sh build
```

### Testing Production Build Locally

```bash
./commands/deployment-tools.sh build
./commands/deployment-tools.sh start
```

## Adding to package.json

For convenience, you can add these commands to your package.json:

```json
"scripts": {
  "seo": "./commands/seo-tools.sh",
  "deploy": "./commands/deployment-tools.sh"
}
```

Then you can use:

```bash
npm run seo all
npm run deploy build
```
