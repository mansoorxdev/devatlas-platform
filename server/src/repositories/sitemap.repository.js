import Article from '#models/article.model.js';
import Snippet from '#models/snippet.model.js';
import ErrorSolution from '#models/error.model.js';
import User from '#models/user.model.js';

export class SitemapRepository {
  /**
   * Fetch all published content slugs and modification timestamps for sitemap generation.
   * Only documents with status === 'published' are retrieved.
   */
  async getPublishedSitemapData() {
    const [articles, snippets, errors, authors] = await Promise.all([
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
      User.find({ role: 'writer', isActive: { $ne: false }, slug: { $exists: true, $ne: null } })
        .select('slug updatedAt')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return { articles, snippets, errors, authors };
  }
}

export default new SitemapRepository();
