import userRepository from '#repositories/user.repository.js';
import articleRepository from '#repositories/article.repository.js';
import AppError from '#utils/app-error.js';

export class UserService {
  /**
   * Get list of writers with article stats breakdown.
   */
  async getWriters(query) {
    const { page, limit, search } = query;
    const result = await userRepository.findWritersWithPagination({ page, limit, search });

    // Aggregate article stats for each writer
    const itemsWithStats = await Promise.all(
      result.items.map(async (writer) => {
        const stats = await articleRepository.countByAuthorAndStatus(writer._id);
        const userObj = writer.toJSON ? writer.toJSON() : writer;
        return {
          ...userObj,
          stats,
        };
      })
    );

    return {
      items: itemsWithStats,
      pagination: result.pagination,
    };
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
}

export default new UserService();
