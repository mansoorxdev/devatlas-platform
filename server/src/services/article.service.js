import articleRepository from '#repositories/article.repository.js';
import AppError from '#utils/app-error.js';

export class ArticleService {
  /**
   * Helper generating a clean URL-friendly slug from a title string.
   * @param {string} title - Article title.
   * @returns {string} Clean base slug string.
   */
  generateBaseSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')  // Remove non-alphanumeric chars except space and hyphen
      .replace(/[\s_-]+/g, '-')   // Replace spaces/underscores/hyphens with single hyphen
      .replace(/^-+|-+$/g, '');   // Trim leading and trailing hyphens
  }

  /**
   * Helper generating a unique slug handling collision suffixing (-1, -2, etc.).
   * @param {string} title - Article title.
   * @param {string} [excludeId] - Optional article ID to exclude from collision check.
   * @returns {Promise<string>} Guaranteed unique slug string.
   */
  async generateUniqueSlug(title, excludeId = null) {
    const baseSlug = this.generateBaseSlug(title) || 'article';
    let slug = baseSlug;
    let counter = 1;

    while (await articleRepository.checkSlugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  /**
   * Helper calculating read time in minutes based on content word count (~200 WPM).
   * @param {string} content - Markdown/HTML content string.
   * @returns {number} Read time in minutes (minimum 1).
   */
  calculateReadTime(content) {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  /**
   * Create a new article. Author ID is bound strictly from the authenticated user.
   * @param {string} authorId - Authenticated admin ID from req.user.id.
   * @param {object} payload - Article payload { title, summary, content, tags, status }.
   * @returns {Promise<object>} Created article object.
   */
  async createArticle(authorId, payload) {
    const { title, summary, content, tags = [], status = 'draft' } = payload;

    const slug = await this.generateUniqueSlug(title);
    const readTime = this.calculateReadTime(content);

    const articleData = {
      title,
      slug,
      summary,
      content,
      tags,
      status,
      author: authorId,
      readTime,
      publishedAt: status === 'published' ? new Date() : null,
    };

    return articleRepository.create(articleData);
  }

  /**
   * Retrieve published articles for public users with pagination, tag filter, and search.
   * @param {object} query - Query parameters { page, limit, search, tag, sort }.
   * @returns {Promise<object>} Paginated list of published articles.
   */
  async getPublicArticles(query = {}) {
    const { page = 1, limit = 10, search = '', tag = '', sort = '-publishedAt' } = query;

    const filter = { status: 'published' };
    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    // Default sort order for published articles: newest published first
    const sortOption = sort === 'oldest' ? { publishedAt: 1 } : { publishedAt: -1 };

    return articleRepository.findWithPagination({
      filter,
      page,
      limit,
      sort: sortOption,
      search,
    });
  }

  /**
   * Retrieve a single published article by slug for public users.
   * @param {string} slug - Unique article slug.
   * @returns {Promise<object>} Found published article document.
   */
  async getPublicArticleBySlug(slug) {
    const article = await articleRepository.findBySlug(slug);

    if (!article || article.status !== 'published') {
      throw new AppError(`Article not found: '${slug}'`, 404, 'NOT_FOUND');
    }

    return article;
  }

  /**
   * Retrieve all articles (drafts + published) for admin management.
   * @param {object} query - Query parameters { page, limit, search, tag, status, sort }.
   * @returns {Promise<object>} Paginated list of articles.
   */
  async getAdminArticles(query = {}) {
    const { page = 1, limit = 10, search = '', tag = '', status = 'all', sort = '-createdAt' } = query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    return articleRepository.findWithPagination({
      filter,
      page,
      limit,
      sort: sortOption,
      search,
    });
  }

  /**
   * Retrieve a single article by ID for admin management.
   * @param {string} id - Article ObjectId string.
   * @returns {Promise<object>} Found article document.
   */
  async getAdminArticleById(id) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw new AppError(`Article not found with ID: '${id}'`, 404, 'NOT_FOUND');
    }
    return article;
  }

  /**
   * Update an existing article. Preserves existing slug if title has not changed.
   * Disallows author modification.
   * @param {string} id - Article ObjectId string.
   * @param {object} payload - Update payload { title, summary, content, tags, status }.
   * @returns {Promise<object>} Updated article document.
   */
  async updateArticle(id, payload) {
    const existingArticle = await articleRepository.findById(id);
    if (!existingArticle) {
      throw new AppError(`Article not found with ID: '${id}'`, 404, 'NOT_FOUND');
    }

    const updateData = {};

    // 1. Title & Slug handling: only regenerate slug if title actually changed
    if (payload.title && payload.title !== existingArticle.title) {
      updateData.title = payload.title;
      updateData.slug = await this.generateUniqueSlug(payload.title, id);
    }

    if (payload.summary !== undefined) updateData.summary = payload.summary;
    if (payload.content !== undefined) {
      updateData.content = payload.content;
      updateData.readTime = this.calculateReadTime(payload.content);
    }
    if (payload.tags !== undefined) updateData.tags = payload.tags;

    // 2. Status & PublishedAt state transition handling
    if (payload.status !== undefined && payload.status !== existingArticle.status) {
      updateData.status = payload.status;
      if (payload.status === 'published') {
        updateData.publishedAt = new Date();
      } else if (payload.status === 'draft') {
        updateData.publishedAt = null;
      }
    }

    return articleRepository.updateById(id, updateData);
  }

  /**
   * Toggle publication status (published <-> draft).
   * Sets publishedAt = new Date() on publish, and publishedAt = null on unpublish.
   * @param {string} id - Article ObjectId string.
   * @param {string} targetStatus - Target status ('draft' | 'published').
   * @returns {Promise<object>} Updated article document.
   */
  async togglePublishStatus(id, targetStatus) {
    const existingArticle = await articleRepository.findById(id);
    if (!existingArticle) {
      throw new AppError(`Article not found with ID: '${id}'`, 404, 'NOT_FOUND');
    }

    const updateData = {
      status: targetStatus,
      publishedAt: targetStatus === 'published' ? new Date() : null,
    };

    return articleRepository.updateById(id, updateData);
  }

  /**
   * Delete an article by ID.
   * @param {string} id - Article ObjectId string.
   * @returns {Promise<object>} Confirmation message.
   */
  async deleteArticle(id) {
    const existingArticle = await articleRepository.findById(id);
    if (!existingArticle) {
      throw new AppError(`Article not found with ID: '${id}'`, 404, 'NOT_FOUND');
    }

    await articleRepository.deleteById(id);
    return { message: 'Article deleted successfully' };
  }
}

export default new ArticleService();
