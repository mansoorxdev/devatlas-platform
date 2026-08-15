import User from '#models/user.model.js';
import Article from '#models/article.model.js';
import ArticleAssignment from '#models/assignment.model.js';

export class UserRepository {
  /**
   * Find a user by email, selecting password hash explicitly for verification
   */
  async findByEmail(email) {
    return User.findOne({ email }).select('+password');
  }

  /**
   * Find a user by ID
   */
  async findById(id) {
    return User.findById(id);
  }

  /**
   * Create a new user record
   */
  async create(userData) {
    return User.create(userData);
  }

  /**
   * Check if a user matches the query filter
   */
  async exists(filter) {
    return User.exists(filter);
  }

  /**
   * Find writers with status filter, search, pagination, and aggregated metrics
   */
  async findWritersWithPagination({ page = 1, limit = 10, search = '', status = 'all' }) {
    const filter = { role: 'writer' };

    if (status === 'active') filter.isActive = true;
    if (status === 'deactivated') filter.isActive = false;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const skip = (page - 1) * limit;

    const [rawItems, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    // Populate article & assignment metrics for each writer
    const items = await Promise.all(
      rawItems.map(async (user) => {
        const userObj = user.toObject();

        const [
          totalArticles,
          publishedArticles,
          pendingReviewArticles,
          totalAssignments,
          completedAssignments,
        ] = await Promise.all([
          Article.countDocuments({ author: user._id }),
          Article.countDocuments({ author: user._id, status: 'published' }),
          Article.countDocuments({ author: user._id, status: 'pending_review' }),
          ArticleAssignment.countDocuments({ writer: user._id }),
          ArticleAssignment.countDocuments({ writer: user._id, status: 'completed' }),
        ]);

        userObj.stats = {
          totalArticles,
          publishedArticles,
          pendingReviewArticles,
          totalAssignments,
          completedAssignments,
        };

        return userObj;
      })
    );

    const pages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Update active status for a user
   */
  async updateUserStatus(id, isActive) {
    return User.findByIdAndUpdate(
      id,
      { isActive },
      { returnDocument: 'after', runValidators: true }
    );
  }

  /**
   * Find public author by slug, selecting ONLY public profile fields and excluding sensitive data
   */
  async findAuthorBySlug(slug) {
    await this.backfillMissingSlugs();
    await this.backfillMissingAvatars();

    const user = await User.findOne({
      slug: slug.toLowerCase(),
      isActive: { $ne: false },
    }).select('name slug bio avatar avatarType expertise socialLinks role');

    return user;
  }

  /**
   * Backfill missing slugs for existing users in database (Admin and Writer migration)
   */
  async backfillMissingSlugs() {
    const usersWithoutSlug = await User.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    for (const user of usersWithoutSlug) {
      await user.save();
    }
  }

  /**
   * Backfill missing avatars for existing users in database
   */
  async backfillMissingAvatars() {
    const usersWithoutAvatar = await User.find({
      $or: [{ avatar: { $exists: false } }, { avatar: null }, { avatar: '' }],
    });
    for (const user of usersWithoutAvatar) {
      user.avatar = 'avatar-01';
      user.avatarType = 'default';
      await user.save();
    }
  }
}

export default new UserRepository();
