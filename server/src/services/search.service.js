import searchRepository from '#repositories/search.repository.js';

export class SearchService {
  /**
   * Perform global search across published Articles, Snippets, and Error Solutions.
   * @param {string} query - Validated search query term.
   * @returns {Promise<object>} Unified search results structure.
   */
  async globalSearch(query) {
    const searchTerm = query.trim();

    const [articlesRaw, snippetsRaw, errorsRaw] = await Promise.all([
      searchRepository.searchArticles(searchTerm, 3),
      searchRepository.searchSnippets(searchTerm, 3),
      searchRepository.searchErrors(searchTerm, 3),
    ]);

    // Format Articles for public consumption
    const articles = articlesRaw.map((article) => ({
      type: 'article',
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      tags: article.tags || [],
      author: article.author?.name ? { name: article.author.name } : null,
      publishedAt: article.publishedAt,
      readTime: article.readTime || 1,
    }));

    // Format Snippets for public consumption
    const snippets = snippetsRaw.map((snippet) => ({
      type: 'snippet',
      title: snippet.title,
      slug: snippet.slug,
      summary: snippet.summary || '',
      language: snippet.language,
      tags: snippet.tags || [],
      author: snippet.author?.name ? { name: snippet.author.name } : null,
      publishedAt: snippet.publishedAt,
    }));

    // Format Errors for public consumption
    const errors = errorsRaw.map((errItem) => ({
      type: 'error',
      title: errItem.title,
      slug: errItem.slug,
      errorMessage: errItem.errorMessage,
      category: errItem.category,
      language: errItem.language,
      tags: errItem.tags || [],
      author: errItem.author?.name ? { name: errItem.author.name } : null,
      publishedAt: errItem.publishedAt,
    }));

    const total = articles.length + snippets.length + errors.length;

    return {
      query: searchTerm,
      results: {
        articles,
        snippets,
        errors,
      },
      total,
    };
  }
}

export default new SearchService();
