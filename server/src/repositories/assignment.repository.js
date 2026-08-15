import ArticleAssignment from '#models/assignment.model.js';

export class AssignmentRepository {
  /**
   * Create a new assignment record
   */
  async create(assignmentData) {
    return ArticleAssignment.create(assignmentData);
  }

  /**
   * Find assignment by ID
   */
  async findById(id) {
    return ArticleAssignment.findById(id)
      .populate('writer', 'name email avatar bio slug')
      .populate('assignedBy', 'name email')
      .populate('article', 'title slug status');
  }

  /**
   * Find paginated list of assignments with search and filters
   */
  async findWithPagination({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ArticleAssignment.find(filter)
        .populate('writer', 'name email avatar bio slug')
        .populate('assignedBy', 'name email')
        .populate('article', 'title slug status')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ArticleAssignment.countDocuments(filter),
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
   * Update assignment status or fields
   */
  async updateById(id, updateData) {
    return ArticleAssignment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    )
      .populate('writer', 'name email avatar bio slug')
      .populate('assignedBy', 'name email')
      .populate('article', 'title slug status');
  }

  /**
   * Update assignment status
   */
  async updateStatus(id, status) {
    return ArticleAssignment.findByIdAndUpdate(
      id,
      { $set: { status } },
      { returnDocument: 'after', runValidators: true }
    );
  }

  /**
   * Link article to assignment and update status
   */
  async linkArticle(assignmentId, articleId, newStatus = 'in_progress') {
    return ArticleAssignment.findByIdAndUpdate(
      assignmentId,
      { $set: { article: articleId, status: newStatus } },
      { returnDocument: 'after' }
    );
  }
}

export default new AssignmentRepository();
