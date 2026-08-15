import Article from '#models/article.model.js';
import Snippet from '#models/snippet.model.js';
import ErrorSolution from '#models/error.model.js';

export class SitemapRepository {
  /**
   * Fetch all published content slugs and modification timestamps for sitemap generation.
   * Only documents with status === 'published' are retrieved.
   */
  async getPublishedSitemapData() {
    const [articles, snippets, errors] = await Promise.all([
      Article.find({ status: 'published' })
        .select('slug updatedAt publishedAt')
        .sort({ publishedAt: -1 })
        .lean(),
      Snippet.find({ status: 'published' })
        .select('slug updatedAt publishedAt')
        .sort({ publishedAt: -1 })
        .lean(),
      ErrorSolution.find({ status: 'published' })
        .select('slug updatedAt publishedAt')
        .sort({ publishedAt: -1 })
        .lean(),
    ]);

    return { articles, snippets, errors };
  }
}

export default new SitemapRepository();
