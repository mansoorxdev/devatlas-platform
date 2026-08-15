import Article from '#models/article.model.js';
import Snippet from '#models/snippet.model.js';
import ErrorSolution from '#models/error.model.js';

export class SearchRepository {
  /**
   * Search published Articles up to limit.
   * @param {string} searchTerm - Validated search term string.
   * @param {number} limit - Max items to return (default 3).
   * @returns {Promise<Array>} List of published articles matching query.
   */
  async searchArticles(searchTerm, limit = 3) {
    let articles = await Article.find({
      status: 'published',
      $text: { $search: searchTerm },
    })
      .select('title slug summary tags author publishedAt readTime')
      .populate('author', 'name')
      .limit(limit)
      .lean();

    if (articles.length < limit) {
      const existingIds = articles.map((a) => a._id);
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const regexArticles = await Article.find({
        _id: { $nin: existingIds },
        status: 'published',
        $or: [{ title: regex }, { summary: regex }, { tags: regex }],
      })
        .select('title slug summary tags author publishedAt readTime')
        .populate('author', 'name')
        .limit(limit - articles.length)
        .lean();

      articles = [...articles, ...regexArticles];
    }

    return articles;
  }

  /**
   * Search published Snippets up to limit.
   * @param {string} searchTerm - Validated search term string.
   * @param {number} limit - Max items to return (default 3).
   * @returns {Promise<Array>} List of published snippets matching query.
   */
  async searchSnippets(searchTerm, limit = 3) {
    let snippets = await Snippet.find({
      status: 'published',
      $text: { $search: searchTerm },
    })
      .select('title slug summary language tags author publishedAt')
      .populate('author', 'name')
      .limit(limit)
      .lean();

    if (snippets.length < limit) {
      const existingIds = snippets.map((s) => s._id);
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const regexSnippets = await Snippet.find({
        _id: { $nin: existingIds },
        status: 'published',
        $or: [{ title: regex }, { summary: regex }, { code: regex }, { tags: regex }],
      })
        .select('title slug summary language tags author publishedAt')
        .populate('author', 'name')
        .limit(limit - snippets.length)
        .lean();

      snippets = [...snippets, ...regexSnippets];
    }

    return snippets;
  }

  /**
   * Search published Error Solutions up to limit.
   * @param {string} searchTerm - Validated search term string.
   * @param {number} limit - Max items to return (default 3).
   * @returns {Promise<Array>} List of published error solutions matching query.
   */
  async searchErrors(searchTerm, limit = 3) {
    let errors = await ErrorSolution.find({
      status: 'published',
      $text: { $search: searchTerm },
    })
      .select('title slug errorMessage category language tags author publishedAt')
      .populate('author', 'name')
      .limit(limit)
      .lean();

    if (errors.length < limit) {
      const existingIds = errors.map((e) => e._id);
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const regexErrors = await ErrorSolution.find({
        _id: { $nin: existingIds },
        status: 'published',
        $or: [{ title: regex }, { errorMessage: regex }, { cause: regex }, { solution: regex }, { tags: regex }],
      })
        .select('title slug errorMessage category language tags author publishedAt')
        .populate('author', 'name')
        .limit(limit - errors.length)
        .lean();

      errors = [...errors, ...regexErrors];
    }

    return errors;
  }
}

export default new SearchRepository();
