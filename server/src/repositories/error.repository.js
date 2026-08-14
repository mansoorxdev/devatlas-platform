import ErrorSolution from '#models/error.model.js';

class ErrorRepository {
  /**
   * Create a new Error Solution record.
   */
  async create(data) {
    const errorSolution = await ErrorSolution.create(data);
    return await errorSolution.populate('author', 'name email avatar');
  }

  /**
   * Find an Error Solution by ID.
   */
  async findById(id) {
    return await ErrorSolution.findById(id).populate('author', 'name email avatar');
  }

  /**
   * Find an Error Solution by slug.
   */
  async findBySlug(slug) {
    return await ErrorSolution.findOne({ slug }).populate('author', 'name email avatar');
  }

  /**
   * Check if a slug already exists in the database.
   */
  async checkSlugExists(slug, excludeId = null) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await ErrorSolution.countDocuments(query);
    return count > 0;
  }

  /**
   * Find Error Solutions with pagination, filters, and text search.
   */
  async findWithPagination({ filter = {}, page = 1, limit = 10, sort = '-publishedAt', search = '' }) {
    const queryFilter = { ...filter };

    // Text search if query provided
    if (search) {
      queryFilter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ErrorSolution.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean({ virtuals: true }),
      ErrorSolution.countDocuments(queryFilter),
    ]);

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Update an Error Solution by ID.
   */
  async updateById(id, updateData) {
    return await ErrorSolution.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('author', 'name email avatar');
  }

  /**
   * Delete an Error Solution by ID.
   */
  async deleteById(id) {
    return await ErrorSolution.findByIdAndDelete(id);
  }
}

export default new ErrorRepository();
