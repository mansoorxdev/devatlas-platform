import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants';
import articleService from '@/features/articles/services/articleService';
import snippetService from '@/features/snippets/services/snippetService';
import errorService from '@/features/errors/services/errorService';

export const homeService = {
  /**
   * Search published articles, snippets, and errors via Global Search API.
   * @param {string} query - Validated search query string.
   */
  async searchContent(query) {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH, {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Fetch 3 latest published articles for Homepage.
   */
  async getLatestArticles() {
    return await articleService.getArticles({ limit: 3, sort: '-publishedAt' });
  },

  /**
   * Fetch 3 latest published snippets for Homepage.
   */
  async getLatestSnippets() {
    return await snippetService.getSnippets({ limit: 3, sort: '-publishedAt' });
  },

  /**
   * Fetch 3 latest published error solutions for Homepage.
   */
  async getLatestErrors() {
    return await errorService.getErrors({ limit: 3, sort: '-publishedAt' });
  },
};

export default homeService;
