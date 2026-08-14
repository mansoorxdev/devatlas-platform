import Article from '#models/article.model.js';

export class ArticleRepository {
  /**
   * Create a new article.
   * @param {object} articleData - Article data object.
   * @returns {Promise<object>} Created article document.
   */
  async create(articleData) {
    const article = await Article.create(articleData);
    return await article.populate('author', 'name email role');
  }

  /**
   * Find an article by ID.
   * @param {string} id - Article ObjectId string.
   * @returns {Promise<object|null>} Found article or null.
   */
  async findById(id) {
    return await Article.findById(id).populate('author', 'name email role');
  }

  /**
   * Find an article by unique slug.
   * @param {string} slug - Article slug string.
   * @returns {Promise<object|null>} Found article or null.
   */
  async findBySlug(slug) {
    return await Article.findOne({ slug }).populate('author', 'name email role');
  }

  /**
   * Check if a slug exists, optionally excluding a specific article ID (for updates).
   * @param {string} slug - Slug string to check.
   * @param {string} [excludeId] - Optional article ID to exclude.
   * @returns {Promise<boolean>} True if slug exists.
   */
  async checkSlugExists(slug, excludeId = null) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await Article.countDocuments(query);
    return count > 0;
  }

  /**
   * Find articles with filter, search, sorting, and pagination.
   * @param {object} options - Query options { filter, page, limit, sort, search }.
   * @returns {Promise<object>} Object containing items, total, page, pages, limit.
   */
  async findWithPagination({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, search = '' }) {
    const queryFilter = { ...filter };

    if (search) {
      queryFilter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Article.find(queryFilter)
        .populate('author', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Article.countDocuments(queryFilter),
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
    };
  }

  /**
   * Update an article by ID.
   * @param {string} id - Article ObjectId string.
   * @param {object} updateData - Data to update.
   * @returns {Promise<object|null>} Updated article document or null.
   */
  async updateById(id, updateData) {
    return await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('author', 'name email role');
  }

  /**
   * Delete an article by ID.
   * @param {string} id - Article ObjectId string.
   * @returns {Promise<object|null>} Deleted article document or null.
   */
  async deleteById(id) {
    return await Article.findByIdAndDelete(id);
  }
}

export default new ArticleRepository();
