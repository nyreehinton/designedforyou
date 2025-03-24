const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');

// Define your website URLs - using proper relative paths
const links = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/index.html', changefreq: 'weekly', priority: 0.9 },
  { url: '/services', changefreq: 'monthly', priority: 0.8 },
  { url: '/portfolio', changefreq: 'monthly', priority: 0.8 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
];

// Set timeout to 10 seconds (10000ms)
const timeout = 10000;

async function generateSitemap() {
  try {
    // Create a stream of URLs
    const stream = new SitemapStream({ hostname: 'https://designedforyou.dev' });

    // Return a promise that resolves with the XML sitemap
    const data = await streamToPromise(Readable.from(links).pipe(stream));

    // Write the XML to file
    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, data.toString());

    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Set a timeout for the operation
const sitemapPromise = generateSitemap();
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Sitemap generation timed out')), timeout);
});

// Race the sitemap generation against the timeout
Promise.race([sitemapPromise, timeoutPromise]).catch((error) => console.error(error.message));

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /
Disallow: /404

Sitemap: https://designedforyou.ai/sitemap.xml`;

fs.writeFileSync('./robots.txt', robotsTxt);
console.log('robots.txt generated successfully!');
