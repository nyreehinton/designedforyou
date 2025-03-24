const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');

// Get hostname from command line arguments or use default
const defaultHostname = 'https://designedforyou.dev';
const hostname = process.argv[2] || defaultHostname;

// Remove trailing slash if present
const formattedHostname = hostname.replace(/\/$/, '');

console.log(`Generating sitemap for: ${formattedHostname}`);

// Define your website URLs
const links = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/index.html', changefreq: 'weekly', priority: 1.0 },
    { url: '#services', changefreq: 'monthly', priority: 0.8 },
    { url: '#process', changefreq: 'monthly', priority: 0.8 },
    { url: '#comparison', changefreq: 'monthly', priority: 0.8 },
    { url: '#contact', changefreq: 'weekly', priority: 0.9 },
    { url: '#faq', changefreq: 'monthly', priority: 0.7 },
];

// Create a stream to write to
const stream = new SitemapStream({ hostname: formattedHostname });

// Return a promise that resolves with your XML string
streamToPromise(Readable.from(links).pipe(stream))
    .then((data) => {
        fs.writeFileSync('./sitemap.xml', data.toString());
        console.log('Sitemap generated successfully!');
    })
    .catch((error) => {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    });

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /
Disallow: /404

Sitemap: ${formattedHostname}/sitemap.xml`;

fs.writeFileSync('./robots.txt', robotsTxt);
console.log('robots.txt generated successfully!');