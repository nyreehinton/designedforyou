/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://designedforyou.netlify.app',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    changefreq: 'weekly',
    priority: 0.7,
    exclude: ['/404'],
    robotsTxtOptions: {
        additionalSitemaps: [
            'https://designedforyou.netlify.app/sitemap.xml'
        ],
        policies: [{
            userAgent: '*',
            allow: '/',
            disallow: ['/404']
        }]
    }
}