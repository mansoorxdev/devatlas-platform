import errorService from '#services/error.service.js';

class ErrorController {
  /**
   * Create new Error Solution
   */
  async createErrorSolution(req, res) {
    const authorId = req.user.id;
    const errorSolution = await errorService.createErrorSolution(authorId, req.body);
    res.status(201).json({
      success: true,
      data: { errorSolution },
    });
  }

  /**
   * Get public published Error Solutions
   */
  async getPublicErrorSolutions(req, res) {
    const result = await errorService.getPublicErrorSolutions(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Get single public Error Solution by slug
   */
  async getPublicErrorSolutionBySlug(req, res) {
    const { slug } = req.params;
    const errorSolution = await errorService.getPublicErrorSolutionBySlug(slug);
    res.status(200).json({
      success: true,
      data: { errorSolution },
    });
  }

  /**
   * Get all Error Solutions for Admin
   */
  async getAdminErrorSolutions(req, res) {
    const result = await errorService.getAdminErrorSolutions(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Get single Error Solution by ID for Admin
   */
  async getAdminErrorSolutionById(req, res) {
    const { id } = req.params;
    const errorSolution = await errorService.getAdminErrorSolutionById(id);
    res.status(200).json({
      success: true,
      data: { errorSolution },
    });
  }

  /**
   * Update Error Solution
   */
  async updateErrorSolution(req, res) {
    const { id } = req.params;
    const errorSolution = await errorService.updateErrorSolution(id, req.body);
    res.status(200).json({
      success: true,
      data: { errorSolution },
    });
  }

  /**
   * Toggle publish status
   */
  async togglePublishStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const errorSolution = await errorService.togglePublishStatus(id, status);
    res.status(200).json({
      success: true,
      data: { errorSolution },
    });
  }

  /**
   * Delete Error Solution
   */
  async deleteErrorSolution(req, res) {
    const { id } = req.params;
    await errorService.deleteErrorSolution(id);
    res.status(200).json({
      success: true,
      message: 'Error solution deleted successfully',
    });
  }
}

export default new ErrorController();
