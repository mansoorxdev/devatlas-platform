import Snippet from '../models/snippet.model.js';

class SnippetRepository {
  /**
   * Create a new snippet document.
   */
  async create(data) {
    const snippet = await Snippet.create(data);
    return snippet.populate('author', 'name email avatar');
  }

  /**
   * Find a snippet by its MongoDB ObjectId.
   */
  async findById(id) {
    return Snippet.findById(id).populate('author', 'name email avatar');
  }

  /**
   * Find a snippet by its unique slug.
   */
  async findBySlug(slug) {
    return Snippet.findOne({ slug }).populate('author', 'name email avatar');
  }

  /**
   * Find snippets with pagination, text search, filtering, and sorting.
   */
  async findWithPagination(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt', search = '' } = options;

    const queryFilter = { ...filter };

    // Text search integration
    if (search && search.trim() !== '') {
      queryFilter.$text = { $search: search.trim() };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Snippet.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .exec(),
      Snippet.countDocuments(queryFilter),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Update a snippet by ID.
   */
  async updateById(id, data) {
    return Snippet.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate(
      'author',
      'name email avatar'
    );
  }

  /**
   * Delete a snippet by ID.
   */
  async deleteById(id) {
    return Snippet.findByIdAndDelete(id);
  }

  /**
   * Check if a slug already exists in the collection.
   */
  async checkSlugExists(slug, excludeId = null) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await Snippet.countDocuments(query);
    return count > 0;
  }
}

export const snippetRepository = new SnippetRepository();
export default snippetRepository;
