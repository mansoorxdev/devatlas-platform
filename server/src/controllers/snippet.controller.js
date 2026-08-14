import snippetService from '#services/snippet.service.js';

export class SnippetController {
  /**
   * Create a new snippet.
   * Author ID is extracted from req.user.id (authenticated admin).
   */
  async createSnippet(req, res) {
    const authorId = req.user.id || req.user._id;
    const snippet = await snippetService.createSnippet(authorId, req.body);

    res.status(201).json({
      success: true,
      data: {
        snippet,
      },
    });
  }

  /**
   * Public endpoint: Get paginated list of published snippets.
   */
  async getPublicSnippets(req, res) {
    const result = await snippetService.getPublicSnippets(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Public endpoint: Get a single published snippet by slug.
   */
  async getPublicSnippetBySlug(req, res) {
    const snippet = await snippetService.getPublicSnippetBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: {
        snippet,
      },
    });
  }

  /**
   * Protected Admin endpoint: Get all snippets (drafts + published).
   */
  async getAdminSnippets(req, res) {
    const result = await snippetService.getAdminSnippets(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Admin endpoint: Get single snippet by ID.
   */
  async getAdminSnippetById(req, res) {
    const snippet = await snippetService.getAdminSnippetById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        snippet,
      },
    });
  }

  /**
   * Protected Admin endpoint: Update an existing snippet.
   */
  async updateSnippet(req, res) {
    const snippet = await snippetService.updateSnippet(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: {
        snippet,
      },
    });
  }

  /**
   * Protected Admin endpoint: Toggle publish status (publish/unpublish).
   */
  async togglePublishStatus(req, res) {
    const snippet = await snippetService.togglePublishStatus(req.params.id, req.body.status);

    res.status(200).json({
      success: true,
      data: {
        snippet,
      },
    });
  }

  /**
   * Protected Admin endpoint: Delete a snippet by ID.
   */
  async deleteSnippet(req, res) {
    const result = await snippetService.deleteSnippet(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
}

export default new SnippetController();
