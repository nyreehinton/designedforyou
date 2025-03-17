const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');

// Define your website URLs
const links = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/index.html', changefreq: 'weekly', priority: 1.0 },
    { url: '#services', changefreq: 'monthly', priority: 0.8 },
    { url: '#process', changefreq: 'monthly', priority: 0.8 },
    { url: '#comparison', changefreq: 'monthly', priority: 0.8 },
    { url: '#contact', changefreq: 'weekly', priority: 0.9 },
    { url: '#faq', changefreq: 'monthly', priority: 0.7 }
];

// Create a stream to write to
const stream = new SitemapStream({ hostname: 'https://designedforyou.ai' });

// Return a promise that resolves with your XML string
streamToPromise(Readable.from(links).pipe(stream))
    .then((data) => {
        fs.writeFileSync('./sitemap.xml', data.toString());
        console.log('Sitemap generated successfully!');
    })
    .catch((error) => {
        console.error('Error generating sitemap:', error);
    });

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /
Disallow: /404

Sitemap: https://designedforyou.ai/sitemap.xml`;

fs.writeFileSync('./robots.txt', robotsTxt);
console.log('robots.txt generated successfully!');