import assignmentService from '#services/assignment.service.js';

export class AssignmentController {
  /**
   * Protected Admin Endpoint: Create assignment & content brief
   */
  async createAssignment(req, res) {
    const assignment = await assignmentService.createAssignment(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: {
        assignment,
      },
    });
  }

  /**
   * Protected Admin Endpoint: Get paginated list of assignments
   */
  async getAdminAssignments(req, res) {
    const result = await assignmentService.getAdminAssignments(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Admin Endpoint: Get single assignment details
   */
  async getAssignmentByIdAdmin(req, res) {
    const assignment = await assignmentService.getAssignmentByIdAdmin(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        assignment,
      },
    });
  }

  /**
   * Protected Admin Endpoint: Update assignment
   */
  async updateAssignmentAdmin(req, res) {
    const assignment = await assignmentService.updateAssignmentAdmin(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: {
        assignment,
      },
    });
  }

  /**
   * Protected Admin Endpoint: Cancel assignment
   */
  async cancelAssignmentAdmin(req, res) {
    const assignment = await assignmentService.cancelAssignmentAdmin(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        assignment,
      },
    });
  }

  /**
   * Protected Writer Endpoint: Get writer's own assignments
   */
  async getWriterAssignments(req, res) {
    const result = await assignmentService.getWriterAssignments(req.user.id, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Writer Endpoint: Get writer's single assignment by ID
   */
  async getWriterAssignmentById(req, res) {
    const assignment = await assignmentService.getWriterAssignmentById(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: {
        assignment,
      },
    });
  }

  /**
   * Protected Writer Endpoint: Start assignment action
   */
  async startAssignmentWriter(req, res) {
    const assignment = await assignmentService.startAssignmentWriter(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: {
        assignment,
      },
    });
  }
}

export default new AssignmentController();
