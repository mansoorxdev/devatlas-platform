import userRepository from '#repositories/user.repository.js';
import articleRepository from '#repositories/article.repository.js';
import Article from '#models/article.model.js';
import ArticleAssignment from '#models/assignment.model.js';
import AppError from '#utils/app-error.js';

export class UserService {
  /**
   * Get list of writers with status filter and article/assignment stats breakdown.
   */
  async getWriters(query) {
    const { page, limit, search, status } = query;
    return userRepository.findWritersWithPagination({ page, limit, search, status });
  }

  /**
   * Get writer profile details and article breakdown by ID.
   */
  async getWriterById(id) {
    const user = await userRepository.findById(id);
    if (!user || user.role !== 'writer') {
      throw new AppError('Writer not found', 404, 'NOT_FOUND');
    }

    const stats = await articleRepository.countByAuthorAndStatus(user._id);
    const userObj = user.toJSON ? user.toJSON() : user;

    return {
      ...userObj,
      stats,
    };
  }

  /**
   * Admin Endpoint: Get comprehensive writer performance analytics.
   */
  async getWriterPerformance(id) {
    const user = await userRepository.findById(id);
    if (!user || user.role !== 'writer') {
      throw new AppError('Writer not found', 404, 'NOT_FOUND');
    }

    const [
      draftCount,
      pendingCount,
      changesRequestedCount,
      publishedCount,
      rejectedCount,
      totalArticles,
      assignedCount,
      inProgressCount,
      submittedCount,
      completedCount,
      cancelledCount,
      totalAssignments,
      recentArticles,
      recentAssignments,
    ] = await Promise.all([
      Article.countDocuments({ author: id, status: 'draft' }),
      Article.countDocuments({ author: id, status: 'pending_review' }),
      Article.countDocuments({ author: id, status: 'changes_requested' }),
      Article.countDocuments({ author: id, status: 'published' }),
      Article.countDocuments({ author: id, status: 'rejected' }),
      Article.countDocuments({ author: id }),
      ArticleAssignment.countDocuments({ writer: id, status: 'assigned' }),
      ArticleAssignment.countDocuments({ writer: id, status: 'in_progress' }),
      ArticleAssignment.countDocuments({ writer: id, status: 'submitted' }),
      ArticleAssignment.countDocuments({ writer: id, status: 'completed' }),
      ArticleAssignment.countDocuments({ writer: id, status: 'cancelled' }),
      ArticleAssignment.countDocuments({ writer: id }),
      Article.find({ author: id }).sort({ createdAt: -1 }).limit(5),
      ArticleAssignment.find({ writer: id }).sort({ createdAt: -1 }).limit(5),
    ]);

    const totalSubmitted = publishedCount + rejectedCount + changesRequestedCount + pendingCount;
    const publicationRate = totalSubmitted > 0 ? Math.round((publishedCount / totalSubmitted) * 100) : 0;
    const assignmentCompletionRate = totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;

    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      slug: user.slug,
      avatar: user.avatar,
      bio: user.bio,
      expertise: user.expertise,
      socialLinks: user.socialLinks,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return {
      writer: userProfile,
      articleStats: {
        total: totalArticles,
        draft: draftCount,
        pending_review: pendingCount,
        changes_requested: changesRequestedCount,
        published: publishedCount,
        rejected: rejectedCount,
      },
      assignmentStats: {
        total: totalAssignments,
        assigned: assignedCount,
        in_progress: inProgressCount,
        submitted: submittedCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
      performanceMetrics: {
        articlesSubmitted: totalSubmitted,
        articlesPublished: publishedCount,
        articlesRejected: rejectedCount,
        changesRequested: changesRequestedCount,
        publicationRate,
        assignmentCompletionRate,
      },
      recentArticles,
      recentAssignments,
    };
  }

  /**
   * Toggle active status of a writer.
   */
  async toggleWriterStatus(id, isActive) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    if (user.role === 'admin') {
      throw new AppError('Administrator accounts cannot be deactivated', 400, 'BAD_REQUEST');
    }

    const updatedUser = await userRepository.updateUserStatus(id, isActive);
    return updatedUser;
  }

  /**
   * Fetch authenticated user's own profile.
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
  }

  /**
   * Update authenticated user's own profile details.
   */
  async updateProfile(userId, profileData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    if (profileData.name) user.name = profileData.name.trim();
    if (profileData.bio !== undefined) user.bio = profileData.bio.trim();
    if (profileData.avatar !== undefined) user.avatar = profileData.avatar.trim();
    if (profileData.expertise) user.expertise = profileData.expertise;
    if (profileData.socialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...profileData.socialLinks,
      };
    }

    await user.save();
    return user;
  }

  /**
   * Public endpoint logic to retrieve author profile by slug with published articles.
   */
  async getPublicAuthorProfile(slug, query = {}) {
    const author = await userRepository.findAuthorBySlug(slug);
    if (!author) {
      throw new AppError('Author not found', 404, 'NOT_FOUND');
    }

    const { page = 1, limit = 10 } = query;

    // Fetch ONLY published articles by this author
    const articleResult = await articleRepository.findWithPagination({
      filter: {
        author: author._id || author.id,
        status: 'published',
      },
      page,
      limit,
      sort: { publishedAt: -1, createdAt: -1 },
    });

    return {
      author,
      articles: articleResult.items,
      pagination: articleResult.pagination,
      stats: {
        publishedArticlesCount: articleResult.pagination.total,
      },
    };
  }
}

export default new UserService();
