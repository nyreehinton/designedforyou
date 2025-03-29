# This is my designedforyou website, ignore the below

# SEO Optimization Tools

This repository contains tools for SEO optimization of the Designed For You website.

## Tools Overview

### 1. SEO Audit Tool

The SEO audit tool analyzes HTML pages for common SEO issues and generates a comprehensive report with recommendations.

```bash
npm run seo-audit
# or use the command tool
npm run seo report
```

This will generate an HTML report in the `seo-report` directory with:

- Metadata score
- Content score
- Overall rating
- Detailed analysis of each page
- Specific recommendations

### 2. Metadata Optimization Tool

This tool fixes common metadata issues:

- Adds missing meta tags (charset, viewport)
- Optimizes title tags
- Adds meta descriptions
- Adds canonical links

```bash
npm run metadata-optimize
# or use the command tool
npm run seo metadata
```

### 3. Content Optimization Tool

This tool improves content for better SEO and readability:

- Ensures proper heading structure (H1, H2, H3)
- Adds alt text to images
- Simplifies text content for better readability
- Adds semantic HTML structure

```bash
npm run content-optimize
# or use the command tool
npm run seo content
```

### 4. Combined SEO Fix

Run all optimization tools in sequence:

```bash
npm run seo-fix
# or use the command tool
npm run seo all
```

## Command Line Tools

This project includes two command-line tools for managing SEO and deployment tasks:

### SEO Tools

```bash
# Run directly
./commands/seo-tools.sh [command]

# Or via npm
npm run seo [command]
```

Available commands:

- `metadata` - Run metadata optimization
- `content` - Run content optimization
- `sitemap [url]` - Generate sitemap
- `report [url]` - Generate SEO report
- `all` - Run all SEO tools

### Deployment Tools

```bash
# Run directly
./commands/deployment-tools.sh [command]

# Or via npm
npm run deploy [command]
```

Available commands:

- `deploy-preview -b "branch"` - Configure deployment preview for a branch
- `build` - Build the application
- `export` - Export static files
- `start` - Start production server

For a complete list of commands and examples, see the [Command Cheatsheet](commands/command-cheatsheet.md).

## Optimization Results

The SEO tools have successfully improved the website's SEO status:

| Metric         | Before | After   |
| -------------- | ------ | ------- |
| Metadata Score | 50/100 | 85+/100 |
| Content Score  | 16/100 | 65+/100 |
| Overall Rating | 36/100 | 75+/100 |

### Key Improvements

1. **Metadata Fixes**

   - Added proper meta descriptions to all pages
   - Added canonical links
   - Optimized title tags
   - Added proper viewport and charset tags

2. **Content Enhancements**

   - Improved heading structure
   - Added semantic HTML elements
   - Simplified content for better readability
   - Added alt text to images

3. **Structural Improvements**
   - Added proper semantic structure (header, main, etc.)
   - Improved HTML semantics

## Future Recommendations

1. **Content Development**

   - Create more comprehensive content (300+ words per page)
   - Add more internal links between pages
   - Develop a consistent content strategy

2. **Technical SEO**

   - Implement schema.org markup
   - Create a sitemap.xml
   - Set up regular SEO audits

3. **Performance Optimization**
   - Optimize images
   - Implement lazy loading
   - Minimize JavaScript and CSS

## Build Process

This project includes a build script that:

1. Creates a distribution directory (`dist/`)
2. Copies HTML files and essential assets
3. Runs SEO optimization on all HTML files
4. Generates a sitemap and robots.txt
5. Runs a final SEO audit on the dist directory

To build the project:

```bash
npm run build
# or use the command tool
npm run deploy build
```

The built site will be in the `dist/` directory, ready for deployment to Netlify or other hosting services.

### Build Verification

To verify the build quality separately:

```bash
npm run dist-audit
# or as part of the complete seo check
npm run seo all
```

This will run an SEO audit specifically on the `dist/` directory to ensure all SEO optimizations are correctly applied to the production build.

### Netlify Deployment

The project includes a `netlify.toml` configuration for easy deployment:

- Build command: `npm run build`
- Publish directory: `dist`
- Includes security headers
- Configures redirects for SPA

For configuring branch-specific deployment settings:

```bash
# Configure staging branch deployment
npm run deploy deploy-preview -b "staging"
```
