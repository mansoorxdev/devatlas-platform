import sitemapRepository from '#repositories/sitemap.repository.js';
import config from '#config/env.config.js';

// XML special character escaping helper
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Format ISO Date for <lastmod> tag
function formatDate(dateVal) {
  if (!dateVal) return null;
  try {
    return new Date(dateVal).toISOString();
  } catch (e) {
    return null;
  }
}

export class SitemapService {
  /**
   * Generates a valid XML sitemap string for published content.
   */
  async generateSitemapXml() {
    const baseUrl = config.CLIENT_URL.replace(/\/$/, '');
    const { articles, snippets, errors, authors = [] } = await sitemapRepository.getPublishedSitemapData();

    const staticRoutes = [
      { loc: `${baseUrl}/` },
      { loc: `${baseUrl}/articles` },
      { loc: `${baseUrl}/snippets` },
      { loc: `${baseUrl}/errors` },
      { loc: `${baseUrl}/devtools` },
    ];

    let xmlEntries = '';

    // Render static pages
    for (const route of staticRoutes) {
      xmlEntries += `  <url>\n    <loc>${escapeXml(route.loc)}</loc>\n  </url>\n`;
    }

    // Render published Articles
    for (const art of articles) {
      const loc = `${baseUrl}/articles/${art.slug}`;
      const lastmod = formatDate(art.updatedAt || art.publishedAt);
      xmlEntries += `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
      if (lastmod) {
        xmlEntries += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
      }
      xmlEntries += `  </url>\n`;
    }

    // Render published Snippets
    for (const snip of snippets) {
      const loc = `${baseUrl}/snippets/${snip.slug}`;
      const lastmod = formatDate(snip.updatedAt || snip.publishedAt);
      xmlEntries += `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
      if (lastmod) {
        xmlEntries += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
      }
      xmlEntries += `  </url>\n`;
    }

    // Render published Error Solutions
    for (const err of errors) {
      const loc = `${baseUrl}/errors/${err.slug}`;
      const lastmod = formatDate(err.updatedAt || err.publishedAt);
      xmlEntries += `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
      if (lastmod) {
        xmlEntries += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
      }
      xmlEntries += `  </url>\n`;
    }

    // Render public Author profiles
    for (const author of authors) {
      if (!author.slug) continue;
      const loc = `${baseUrl}/authors/${author.slug}`;
      const lastmod = formatDate(author.updatedAt);
      xmlEntries += `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
      if (lastmod) {
        xmlEntries += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
      }
      xmlEntries += `  </url>\n`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}</urlset>`;
  }
}

export default new SitemapService();
