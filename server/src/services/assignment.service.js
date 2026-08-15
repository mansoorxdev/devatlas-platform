import assignmentRepository from '#repositories/assignment.repository.js';
import userRepository from '#repositories/user.repository.js';
import AppError from '#utils/app-error.js';

export class AssignmentService {
  /**
   * Admin Endpoint: Create a new content brief & assignment for a writer.
   */
  async createAssignment(adminId, assignmentData) {
    // Verify target writer exists and has role 'writer'
    const writerObj = await userRepository.findById(assignmentData.writer);
    if (!writerObj || writerObj.role !== 'writer') {
      throw new AppError('Assigned user must be an active writer', 400, 'BAD_REQUEST');
    }

    if (!writerObj.isActive) {
      throw new AppError('Cannot assign content brief to a deactivated writer', 400, 'BAD_REQUEST');
    }

    const payload = {
      ...assignmentData,
      assignedBy: adminId,
      status: 'assigned',
    };

    const assignment = await assignmentRepository.create(payload);
    return assignmentRepository.findById(assignment._id);
  }

  /**
   * Admin Endpoint: Get paginated assignments list with filters.
   */
  async getAdminAssignments(query = {}) {
    const { page = 1, limit = 10, status, priority, search, writer } = query;

    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (writer) filter.writer = writer;

    if (search && search.trim() !== '') {
      filter.title = new RegExp(search.trim(), 'i');
    }

    return assignmentRepository.findWithPagination({
      filter,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    });
  }

  /**
   * Admin Endpoint: Get assignment details by ID.
   */
  async getAssignmentByIdAdmin(id) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    }
    return assignment;
  }

  /**
   * Admin Endpoint: Update assignment.
   */
  async updateAssignmentAdmin(id, updateData) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    }

    if (assignment.status === 'completed' || assignment.status === 'cancelled') {
      throw new AppError(`Cannot modify an assignment that is ${assignment.status}`, 400, 'BAD_REQUEST');
    }

    return assignmentRepository.updateById(id, updateData);
  }

  /**
   * Admin Endpoint: Cancel assignment.
   * Cancelling an assignment changes status to 'cancelled'. Linked articles are intact.
   */
  async cancelAssignmentAdmin(id) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    }

    if (assignment.status === 'completed') {
      throw new AppError('Cannot cancel a completed assignment', 400, 'BAD_REQUEST');
    }

    return assignmentRepository.updateStatus(id, 'cancelled');
  }

  /**
   * Writer Endpoint: Get writer's own assigned briefs with pagination.
   */
  async getWriterAssignments(writerId, query = {}) {
    const { page = 1, limit = 10, status, priority } = query;

    const filter = { writer: writerId };

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;

    return assignmentRepository.findWithPagination({
      filter,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { deadline: 1, createdAt: -1 },
    });
  }

  /**
   * Writer Endpoint: Get writer's own assignment details by ID.
   */
  async getWriterAssignmentById(writerId, assignmentId) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    }

    if (assignment.writer._id.toString() !== writerId.toString()) {
      throw new AppError('Access denied. You do not own this assignment', 403, 'FORBIDDEN');
    }

    return assignment;
  }

  /**
   * Writer Endpoint: Start writing action (assigned -> in_progress).
   */
  async startAssignmentWriter(writerId, assignmentId) {
    const assignment = await this.getWriterAssignmentById(writerId, assignmentId);

    if (assignment.status === 'cancelled') {
      throw new AppError('Cannot start a cancelled assignment', 400, 'BAD_REQUEST');
    }

    if (assignment.status === 'completed') {
      throw new AppError('Assignment is already completed', 400, 'BAD_REQUEST');
    }

    if (assignment.status === 'assigned') {
      await assignmentRepository.updateStatus(assignmentId, 'in_progress');
      return assignmentRepository.findById(assignmentId);
    }

    return assignment;
  }
}

export default new AssignmentService();
