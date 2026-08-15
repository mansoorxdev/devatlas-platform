import User from '#models/user.model.js';

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
   * Find writers with search and pagination
   */
  async findWritersWithPagination({ page = 1, limit = 10, search = '' }) {
    const filter = { role: 'writer' };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

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
}

export default new UserRepository();
