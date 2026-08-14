import snippetRepository from '#repositories/snippet.repository.js';
import AppError from '#utils/app-error.js';

class SnippetService {
  /**
   * Helper function to convert text to a clean URL-friendly slug.
   */
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W_]+?/g, '-') // Replace spaces and special chars with a single dash
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }

  /**
   * Generate a unique slug, appending -1, -2 if collisions exist.
   */
  async generateUniqueSlug(title, excludeId = null) {
    const baseSlug = this.slugify(title) || 'snippet';
    let slug = baseSlug;
    let counter = 1;

    while (await snippetRepository.checkSlugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  /**
   * Create a new Snippet. Author comes exclusively from authenticated user.
   */
  async createSnippet(authorId, data) {
    if (!authorId) {
      throw new AppError('Authenticated user required to create a snippet', 401, 'UNAUTHORIZED');
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(data.title);

    // Calculate publishedAt timestamp
    const isPublished = data.status === 'published';
    const publishedAt = isPublished ? new Date() : null;

    const snippetData = {
      ...data,
      slug,
      author: authorId,
      publishedAt,
    };

    return snippetRepository.create(snippetData);
  }

  /**
   * Get public snippets (published only).
   */
  async getPublicSnippets(queryParams = {}) {
    const { page, limit, search, tag, language, sort } = queryParams;

    const filter = { status: 'published' };
    if (tag) filter.tags = tag;
    if (language) filter.language = language;

    return snippetRepository.findWithPagination(filter, {
      page,
      limit,
      search,
      sort: sort || '-publishedAt',
    });
  }

  /**
   * Get a public snippet by slug (published only).
   */
  async getPublicSnippetBySlug(slug) {
    const snippet = await snippetRepository.findBySlug(slug);

    if (!snippet || snippet.status !== 'published') {
      throw new AppError('Snippet not found', 404, 'NOT_FOUND');
    }

    return snippet;
  }

  /**
   * Get all snippets for admin panel (both drafts and published).
   */
  async getAdminSnippets(queryParams = {}) {
    const { page, limit, search, tag, language, status, sort } = queryParams;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (tag) filter.tags = tag;
    if (language) filter.language = language;

    return snippetRepository.findWithPagination(filter, {
      page,
      limit,
      search,
      sort: sort || '-createdAt',
    });
  }

  /**
   * Get a snippet by ID for admin panel.
   */
  async getAdminSnippetById(id) {
    const snippet = await snippetRepository.findById(id);
    if (!snippet) {
      throw new AppError('Snippet not found', 404, 'NOT_FOUND');
    }
    return snippet;
  }

  /**
   * Update an existing snippet. Author cannot be modified.
   */
  async updateSnippet(id, updateData) {
    const existingSnippet = await snippetRepository.findById(id);
    if (!existingSnippet) {
      throw new AppError('Snippet not found', 404, 'NOT_FOUND');
    }

    // Never allow author or slug override directly from payload
    delete updateData.author;
    delete updateData.authorId;
    delete updateData.slug;

    // Preserve existing slug if title is unchanged, otherwise generate new unique slug
    let slug = existingSnippet.slug;
    if (updateData.title && updateData.title.trim() !== existingSnippet.title) {
      slug = await this.generateUniqueSlug(updateData.title, id);
    }

    // Handle status & publishedAt transitions
    let publishedAt = existingSnippet.publishedAt;
    if (updateData.status && updateData.status !== existingSnippet.status) {
      if (updateData.status === 'published') {
        publishedAt = new Date();
      } else if (updateData.status === 'draft') {
        publishedAt = null;
      }
    }

    const payload = {
      ...updateData,
      slug,
      publishedAt,
    };

    return snippetRepository.updateById(id, payload);
  }

  /**
   * Toggle status (publish/unpublish) for a snippet.
   */
  async togglePublishStatus(id, newStatus) {
    const snippet = await snippetRepository.findById(id);
    if (!snippet) {
      throw new AppError('Snippet not found', 404, 'NOT_FOUND');
    }

    if (snippet.status === newStatus) {
      return snippet;
    }

    const publishedAt = newStatus === 'published' ? new Date() : null;

    return snippetRepository.updateById(id, {
      status: newStatus,
      publishedAt,
    });
  }

  /**
   * Delete a snippet by ID.
   */
  async deleteSnippet(id) {
    const snippet = await snippetRepository.findById(id);
    if (!snippet) {
      throw new AppError('Snippet not found', 404, 'NOT_FOUND');
    }

    await snippetRepository.deleteById(id);
    return { id, message: 'Snippet deleted successfully' };
  }
}

export const snippetService = new SnippetService();
export default snippetService;
