import sitemapService from '#services/sitemap.service.js';

export class SitemapController {
  /**
   * Generates and returns sitemap.xml with application/xml header.
   */
  async getSitemap(req, res, next) {
    try {
      const xml = await sitemapService.generateSitemapXml();
      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(xml);
    } catch (error) {
      next(error);
    }
  }
}

export default new SitemapController();
