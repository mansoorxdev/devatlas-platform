import articleRepository from '#repositories/article.repository.js';
import assignmentRepository from '#repositories/assignment.repository.js';
import notificationService from '#services/notification.service.js';
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

  // --- WRITER & EDITORIAL REVIEW METHODS ---

  /**
   * Create an article as a Writer.
   * Author ID is assigned strictly from req.user.id server-side.
   */
  async createWriterArticle(writerId, payload) {
    const { title, summary, content, tags = [], featuredImage, seoTitle, seoDescription, assignmentId, action = 'draft' } = payload;
    const slug = await this.generateUniqueSlug(title);
    const readTime = this.calculateReadTime(content);
    const targetStatus = action === 'submit' ? 'pending_review' : 'draft';

    const articleData = {
      title,
      slug,
      summary,
      content,
      tags,
      featuredImage: featuredImage || '',
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      status: targetStatus,
      author: writerId,
      readTime,
      publishedAt: null,
    };

    if (assignmentId) {
      const assignment = await assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new AppError('Linked assignment not found', 404, 'NOT_FOUND');
      }
      const assignWriterId = assignment.writer._id?.toString() || assignment.writer.toString();
      if (assignWriterId !== writerId.toString()) {
        throw new AppError('Access denied. You do not own this assignment', 403, 'FORBIDDEN');
      }
      if (assignment.status === 'cancelled') {
        throw new AppError('Cannot create article for a cancelled assignment', 400, 'BAD_REQUEST');
      }
      articleData.assignment = assignment._id;
    }

    if (action === 'submit') {
      articleData.reviewHistory = [
        {
          action: 'submit',
          note: 'Submitted for editorial review',
          reviewedBy: writerId,
          createdAt: new Date(),
        },
      ];
    }

    const createdArticle = await articleRepository.create(articleData);

    if (assignmentId) {
      const newAssignmentStatus = action === 'submit' ? 'submitted' : 'in_progress';
      await assignmentRepository.linkArticle(assignmentId, createdArticle._id, newAssignmentStatus);
    }

    if (action === 'submit') {
      try {
        await notificationService.notifyUser({
          recipient: writerId,
          type: 'article_submitted',
          title: 'Article Submitted for Review',
          message: `Your article "${createdArticle.title}" has been submitted for editorial review.`,
          entityType: 'article',
          entityId: createdArticle.id,
          link: '/writer/articles',
          eventId: `submit_writer_${createdArticle.id}_${createdArticle.createdAt?.getTime()}`,
        });

        await notificationService.notifyAdmins({
          type: createdArticle.assignment ? 'assigned_work_submitted' : 'writer_article_submitted',
          title: createdArticle.assignment ? 'Assigned Work Submitted' : 'Writer Article Submitted',
          message: `An article "${createdArticle.title}" was submitted for review.`,
          entityType: 'article',
          entityId: createdArticle.id,
          link: '/portal-master/articles/review',
          eventIdPrefix: `submit_admin_${createdArticle.id}_${createdArticle.createdAt?.getTime()}`,
        });
      } catch (e) {}
    }

    return createdArticle;
  }

  /**
   * Retrieve articles owned by the authenticated Writer.
   */
  async getWriterArticles(writerId, query = {}) {
    const { page = 1, limit = 10, search = '', tag = '', status = 'all', sort = '-createdAt' } = query;

    const filter = { author: writerId };
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
   * Get stats summary for a Writer dashboard.
   */
  async getWriterStats(writerId) {
    return articleRepository.countByAuthorAndStatus(writerId);
  }

  /**
   * Get single article owned by Writer, verifying strict ownership.
   */
  async getWriterArticleById(writerId, id) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw new AppError(`Article not found with ID: '${id}'`, 404, 'NOT_FOUND');
    }

    const authorId = article.author?.id || article.author?._id?.toString() || article.author?.toString();
    if (authorId !== writerId.toString()) {
      throw new AppError('Access denied. You do not own this article.', 403, 'FORBIDDEN');
    }

    return article;
  }

  /**
   * Update an article owned by Writer.
   * Writers can only edit articles in 'draft' or 'changes_requested' status.
   */
  async updateWriterArticle(writerId, id, payload) {
    const existingArticle = await this.getWriterArticleById(writerId, id);

    if (existingArticle.status === 'pending_review') {
      throw new AppError('Article is currently under review and cannot be edited.', 400, 'BAD_REQUEST');
    }

    if (existingArticle.status === 'published') {
      throw new AppError('Published articles cannot be directly edited by writers.', 400, 'BAD_REQUEST');
    }

    if (existingArticle.status === 'rejected') {
      throw new AppError('Rejected articles cannot be edited.', 400, 'BAD_REQUEST');
    }

    const updateData = {};

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

    // Handle action: 'draft' or 'submit' / 'resubmit'
    if (payload.action === 'submit' || payload.action === 'resubmit') {
      updateData.status = 'pending_review';
      const historyEntry = {
        action: existingArticle.status === 'changes_requested' ? 'resubmit' : 'submit',
        note: existingArticle.status === 'changes_requested' ? 'Resubmitted after requested changes' : 'Submitted for editorial review',
        reviewedBy: writerId,
        createdAt: new Date(),
      };
      updateData.$push = { reviewHistory: historyEntry };
    }

    return articleRepository.updateById(id, updateData);
  }

  /**
   * Explicitly submit or resubmit a draft / changes_requested article for review.
   */
  async submitWriterArticle(writerId, id) {
    const article = await this.getWriterArticleById(writerId, id);

    if (article.status === 'pending_review') {
      throw new AppError('Article is already pending review.', 400, 'BAD_REQUEST');
    }

    if (article.status === 'published') {
      throw new AppError('Article is already published.', 400, 'BAD_REQUEST');
    }

    if (article.status === 'rejected') {
      throw new AppError('Rejected articles cannot be submitted for review.', 400, 'BAD_REQUEST');
    }

    const isResubmit = article.status === 'changes_requested';
    const updateData = {
      status: 'pending_review',
    };

    const historyEntry = {
      action: isResubmit ? 'resubmit' : 'submit',
      note: isResubmit ? 'Resubmitted for review after revisions' : 'Submitted for editorial review',
      reviewedBy: writerId,
      createdAt: new Date(),
    };

    if (article.assignment) {
      await assignmentRepository.updateStatus(article.assignment._id || article.assignment, 'submitted');
    }

    const updated = await articleRepository.updateById(id, {
      ...updateData,
      $push: { reviewHistory: historyEntry },
    });

    // Idempotent Notifications
    try {
      await notificationService.notifyUser({
        recipient: writerId,
        type: 'article_submitted',
        title: 'Article Submitted for Review',
        message: `Your article "${updated.title}" has been submitted for editorial review.`,
        entityType: 'article',
        entityId: updated.id,
        link: '/writer/articles',
        eventId: `submit_writer_${updated.id}_${updated.updatedAt?.getTime()}`,
      });

      const adminType = isResubmit ? 'writer_article_resubmitted' : 'writer_article_submitted';
      await notificationService.notifyAdmins({
        type: updated.assignment ? 'assigned_work_submitted' : adminType,
        title: updated.assignment ? 'Assigned Work Submitted' : 'Writer Article Submitted',
        message: `An article "${updated.title}" was submitted for review.`,
        entityType: 'article',
        entityId: updated.id,
        link: '/portal-master/articles/review',
        eventIdPrefix: `submit_admin_${updated.id}_${updated.updatedAt?.getTime()}`,
      });
    } catch (e) {}

    return updated;
  }

  /**
   * Fetch editorial review queue for Admin users.
   */
  async getAdminReviewQueue(query = {}) {
    const { page = 1, limit = 10, search = '', tag = '', status = 'pending_review', sort = '-updatedAt' } = query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    } else {
      filter.status = { $in: ['pending_review', 'changes_requested', 'rejected'] };
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    const sortOption = sort === 'oldest' ? { updatedAt: 1 } : { updatedAt: -1 };

    return articleRepository.findWithPagination({
      filter,
      page,
      limit,
      sort: sortOption,
      search,
    });
  }

  /**
   * Admin approves and publishes a submitted article.
   */
  async approveArticle(adminId, id) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw new AppError(`Article not found with ID: '${id}'`, 404, 'NOT_FOUND');
    }

    const updateData = {
      status: 'published',
      publishedAt: new Date(),
      reviewNote: null,
    };

    const historyEntry = {
      action: 'approve',
      note: 'Approved and published by administrator',
      reviewedBy: adminId,
      createdAt: new Date(),
    };

    if (article.assignment) {
      await assignmentRepository.updateStatus(article.assignment._id || article.assignment, 'completed');
    }

    const updated = await articleRepository.updateById(id, {
      ...updateData,
      $push: { reviewHistory: historyEntry },
    });

    try {
      const authorId = article.author?._id || article.author;
      await notificationService.notifyUser({
        recipient: authorId,
        type: 'article_approved',
        title: 'Article Approved & Published!',
        message: `Congratulations! Your article "${article.title}" has been approved and published.`,
        entityType: 'article',
        entityId: article.id,
        link: `/articles/${article.slug}`,
        eventId: `approve_${article.id}`,
      });
    } catch (e) {}

    return updated;
  }

  /**
   * Admin requests changes from author with required feedback note.
   */
  async requestChanges(adminId, id, reviewNote) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw new AppError(`Article not found with ID: '${id}'`, 404, 'NOT_FOUND');
    }

    const updateData = {
      status: 'changes_requested',
      reviewNote,
    };

    const historyEntry = {
      action: 'request_changes',
      note: reviewNote,
      reviewedBy: adminId,
      createdAt: new Date(),
    };

    const updated = await articleRepository.updateById(id, {
      ...updateData,
      $push: { reviewHistory: historyEntry },
    });

    try {
      const authorId = article.author?._id || article.author;
      await notificationService.notifyUser({
        recipient: authorId,
        type: 'changes_requested',
        title: 'Admin Requested Changes',
        message: `An admin requested revisions on "${article.title}": ${reviewNote}`,
        entityType: 'article',
        entityId: article.id,
        link: `/writer/articles/${article.id}/edit`,
        eventId: `req_changes_${article.id}_${updated.updatedAt?.getTime()}`,
      });
    } catch (e) {}

    return updated;
  }

  /**
   * Admin rejects article with required rejection reason.
   */
  async rejectArticle(adminId, id, reviewNote) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw new AppError(`Article not found with ID: '${id}'`, 404, 'NOT_FOUND');
    }

    const updateData = {
      status: 'rejected',
      reviewNote,
    };

    const historyEntry = {
      action: 'reject',
      note: reviewNote,
      reviewedBy: adminId,
      createdAt: new Date(),
    };

    const updated = await articleRepository.updateById(id, {
      ...updateData,
      $push: { reviewHistory: historyEntry },
    });

    try {
      const authorId = article.author?._id || article.author;
      await notificationService.notifyUser({
        recipient: authorId,
        type: 'article_rejected',
        title: 'Article Review Status: Rejected',
        message: `Your article "${article.title}" was not approved: ${reviewNote}`,
        entityType: 'article',
        entityId: article.id,
        link: '/writer/articles',
        eventId: `reject_${article.id}`,
      });
    } catch (e) {}

    return updated;
  }
}

export default new ArticleService();
