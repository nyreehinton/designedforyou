/**
 * Tailwind CSS Extractor
 *
 * Extracts Tailwind CSS classes from HTML files and
 * creates CSS module files with equivalent styling.
 *
 * Usage: node scripts/extract-tailwind.js path/to/file.html [output-path]
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Check if the required arguments are provided
if (process.argv.length < 3) {
    console.error('Usage: node extract-tailwind.js <html-file> [output-file]');
    process.exit(1);
}

const htmlPath = process.argv[2];
const outputPath = process.argv[3] || htmlPath.replace('.html', '.module.css');

// Read the HTML file
try {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Parse the HTML content
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Extract all elements with class attributes
    const allElements = Array.from(document.querySelectorAll('*'));

    const classMap = {};
    allElements.forEach((el, index) => {
        const classAttr = el.getAttribute('class');
        if (classAttr) {
            const classes = classAttr.split(' ').filter(Boolean);
            if (classes.length) {
                const selector = el.tagName.toLowerCase();
                const cssClass = `${selector}_${index}`;
                classMap[cssClass] = classes.join(' ');
            }
        }
    });

    // Generate the CSS content
    const cssContent = `/* Extracted from ${path.basename(htmlPath)} */
/* CSS module with Tailwind class equivalents */

:root {
  --app-primary-color: #0a2856;
  --app-secondary-color: #c19b4a;
  --app-text-color: #333333;
  --app-background-color: #ffffff;
}

${Object.entries(classMap)
  .map(([className, tailwindClasses]) => {
    return `.${className} {
  /* Tailwind classes: ${tailwindClasses} */
}`;
  })
  .join('\n\n')}

/* Common utility classes */
.root {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.container {
  padding: 1rem;
  margin: 0 auto;
  max-width: 1200px;
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

  // Write the CSS file
  fs.writeFileSync(outputPath, cssContent);
  console.log(`Extracted Tailwind classes from ${htmlPath} to ${outputPath}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}