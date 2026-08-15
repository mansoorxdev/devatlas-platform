import userService from '#services/user.service.js';

export class UserController {
  /**
   * Protected Admin endpoint: Get paginated list of writers with article stats.
   */
  async getWriters(req, res) {
    const result = await userService.getWriters(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Admin endpoint: Get writer details by ID.
   */
  async getWriterById(req, res) {
    const writer = await userService.getWriterById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        writer,
      },
    });
  }

  /**
   * Protected Admin endpoint: Toggle writer active/inactive status.
   */
  async toggleWriterStatus(req, res) {
    const writer = await userService.toggleWriterStatus(req.params.id, req.body.isActive);

    res.status(200).json({
      success: true,
      data: {
        writer,
      },
    });
  }

  /**
   * Protected endpoint: Get authenticated user's own profile.
   */
  async getProfile(req, res) {
    const user = await userService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  }

  /**
   * Protected endpoint: Update authenticated user's own profile.
   */
  async updateProfile(req, res) {
    const user = await userService.updateProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  }

  /**
   * Public endpoint: Get public author profile by slug with published articles.
   */
  async getPublicAuthorProfile(req, res) {
    const result = await userService.getPublicAuthorProfile(req.params.slug, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
}

export default new UserController();
