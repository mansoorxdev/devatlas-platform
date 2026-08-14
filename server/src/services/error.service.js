import errorRepository from '#repositories/error.repository.js';
import AppError from '#utils/app-error.js';

class ErrorService {
  /**
   * Helper function to convert text to a clean URL-friendly slug.
   */
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W_]+?/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper to generate a unique URL slug from title.
   */
  async generateUniqueSlug(title, excludeId = null) {
    const baseSlug = this.slugify(title) || 'error-solution';
    let slug = baseSlug;
    let counter = 1;

    while (await errorRepository.checkSlugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Create a new Error Solution as Admin.
   */
  async createErrorSolution(authorId, data) {
    const slug = await this.generateUniqueSlug(data.title);

    const publishedAt = data.status === 'published' ? new Date() : null;

    const errorSolutionData = {
      ...data,
      slug,
      author: authorId,
      publishedAt,
    };

    return await errorRepository.create(errorSolutionData);
  }

  /**
   * Get public paginated list of published Error Solutions.
   */
  async getPublicErrorSolutions({ page = 1, limit = 10, search = '', language = '', category = '', tag = '', sort = '-publishedAt' }) {
    const filter = { status: 'published' };

    if (language) {
      filter.language = language.toLowerCase();
    }

    if (category) {
      filter.category = category.toLowerCase();
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    return await errorRepository.findWithPagination({
      filter,
      page,
      limit,
      search,
      sort,
    });
  }

  /**
   * Get single published Error Solution by slug.
   */
  async getPublicErrorSolutionBySlug(slug) {
    const errorSolution = await errorRepository.findBySlug(slug);

    if (!errorSolution || errorSolution.status !== 'published') {
      throw new AppError('Error solution not found', 404, 'NOT_FOUND');
    }

    return errorSolution;
  }

  /**
   * Get admin list of all Error Solutions (drafts + published).
   */
  async getAdminErrorSolutions({ page = 1, limit = 10, search = '', language = '', category = '', tag = '', status, sort = '-createdAt' }) {
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (language) {
      filter.language = language.toLowerCase();
    }

    if (category) {
      filter.category = category.toLowerCase();
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    return await errorRepository.findWithPagination({
      filter,
      page,
      limit,
      search,
      sort,
    });
  }

  /**
   * Get single Error Solution by ID for Admin.
   */
  async getAdminErrorSolutionById(id) {
    const errorSolution = await errorRepository.findById(id);

    if (!errorSolution) {
      throw new AppError('Error solution not found', 404, 'NOT_FOUND');
    }

    return errorSolution;
  }

  /**
   * Update an existing Error Solution.
   */
  async updateErrorSolution(id, updateData) {
    const existing = await errorRepository.findById(id);
    if (!existing) {
      throw new AppError('Error solution not found', 404, 'NOT_FOUND');
    }

    const payload = { ...updateData };

    // Regenerate slug if title changes
    if (payload.title && payload.title !== existing.title) {
      payload.slug = await this.generateUniqueSlug(payload.title, id);
    }

    // Preserve publishedAt state if status changes
    if (payload.status) {
      if (payload.status === 'published' && existing.status !== 'published') {
        payload.publishedAt = new Date();
      } else if (payload.status === 'draft') {
        payload.publishedAt = null;
      }
    }

    return await errorRepository.updateById(id, payload);
  }

  /**
   * Toggle publication status of an Error Solution.
   */
  async togglePublishStatus(id, targetStatus) {
    const existing = await errorRepository.findById(id);
    if (!existing) {
      throw new AppError('Error solution not found', 404, 'NOT_FOUND');
    }

    const publishedAt = targetStatus === 'published' ? new Date() : null;

    return await errorRepository.updateById(id, {
      status: targetStatus,
      publishedAt,
    });
  }

  /**
   * Delete an Error Solution by ID.
   */
  async deleteErrorSolution(id) {
    const existing = await errorRepository.findById(id);
    if (!existing) {
      throw new AppError('Error solution not found', 404, 'NOT_FOUND');
    }

    return await errorRepository.deleteById(id);
  }
}

export default new ErrorService();
