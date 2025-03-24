/**
 * SEO Tools Configuration
 * Centralizes configuration for all SEO tools
 */

export const seoConfig = {
  // Base URL settings
  baseUrl: 'https://designedforyou.dev',

  // File paths
  paths: {
    outputDir: './seo-report',
    sitemapPath: './public/sitemap.xml',
    robotsPath: './public/robots.txt',
  },

  // Sitemap settings
  sitemap: {
    defaultPriority: 0.7,
    defaultChangeFreq: 'weekly',
    homePriority: 1.0,
    homeChangeFreq: 'daily',
    timeout: 30000, // 30 seconds
  },

  // SEO score thresholds
  thresholds: {
    metadata: {
      excellent: 90,
      good: 80,
      fair: 70,
      poor: 60,
    },
    content: {
      veryEasy: 90,
      easy: 80,
      fairlyEasy: 70,
      standard: 60,
      fairlyDifficult: 50,
      difficult: 30,
    },
  },

  // SEO checks
  checks: {
    metadata: [
      {
        name: 'title',
        selector: 'title',
        check: (el) => el && el.textContent.length > 0 && el.textContent.length < 60,
        message: 'Title tag is missing or not optimal (should be between 1-60 chars)',
      },
      {
        name: 'description',
        selector: 'meta[name="description"]',
        check: (el) =>
          el &&
          el.getAttribute('content') &&
          el.getAttribute('content').length > 10 &&
          el.getAttribute('content').length < 160,
        message: 'Meta description is missing or not optimal (should be between 10-160 chars)',
      },
      {
        name: 'viewport',
        selector: 'meta[name="viewport"]',
        check: (el) =>
          el &&
          el.getAttribute('content') &&
          el.getAttribute('content').includes('width=device-width'),
        message: "Viewport meta tag is missing or doesn't include width=device-width",
      },
      {
        name: 'charset',
        selector: 'meta[charset]',
        check: (el) => el && el.getAttribute('charset'),
        message: 'Charset meta tag is missing',
      },
      {
        name: 'headings',
        selector: 'h1',
        check: (el, document) => document.querySelectorAll('h1').length === 1,
        message: 'Page should have exactly one H1 tag',
      },
      {
        name: 'canonical',
        selector: 'link[rel="canonical"]',
        check: (el) => el && el.getAttribute('href'),
        message: 'Canonical link is missing',
      },
    ],

    // Common recommendations by score
    recommendations: {
      metadata: {
        low: 'Improve your HTML metadata by adding missing meta tags and optimizing existing ones.',
        mid: 'Add missing meta tags, particularly canonical links and descriptions.',
        high: 'Fine-tune meta tags for optimal length and content.',
      },
      content: {
        low: 'Improve content readability by using shorter sentences and simpler language.',
        mid: 'Consider breaking up long paragraphs and adding more subheadings for better readability.',
        high: 'Ensure content is well-structured with appropriate heading hierarchy.',
      },
      general: [
        'Ensure all images have descriptive alt text for better accessibility and SEO.',
        'Use a consistent heading structure with a single H1 on each page.',
        'Consider adding more internal links to improve site navigation and SEO.',
      ],
    },
  },
};

export default seoConfig;
