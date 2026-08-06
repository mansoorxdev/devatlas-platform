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
}

export default new UserRepository();
