import articleService from '#services/article.service.js';

export class ArticleController {
  /**
   * Create a new article.
   * Author ID is extracted from req.user.id (authenticated admin).
   */
  async createArticle(req, res) {
    const authorId = req.user.id || req.user._id;
    const article = await articleService.createArticle(authorId, req.body);

    res.status(201).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Public endpoint: Get paginated list of published articles.
   */
  async getPublicArticles(req, res) {
    const result = await articleService.getPublicArticles(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Public endpoint: Get a single published article by slug.
   */
  async getPublicArticleBySlug(req, res) {
    const article = await articleService.getPublicArticleBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Admin endpoint: Get all articles (drafts + published).
   */
  async getAdminArticles(req, res) {
    const result = await articleService.getAdminArticles(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Admin endpoint: Get single article by ID.
   */
  async getAdminArticleById(req, res) {
    const article = await articleService.getAdminArticleById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Admin endpoint: Update an existing article.
   */
  async updateArticle(req, res) {
    const article = await articleService.updateArticle(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Admin endpoint: Toggle publish status (publish/unpublish).
   */
  async togglePublishStatus(req, res) {
    const article = await articleService.togglePublishStatus(req.params.id, req.body.status);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Admin endpoint: Delete an article by ID.
   */
  async deleteArticle(req, res) {
    const result = await articleService.deleteArticle(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  // --- WRITER CONTROLLER METHODS ---

  /**
   * Protected Writer endpoint: Create an article as Writer.
   */
  async createWriterArticle(req, res) {
    const writerId = req.user.id || req.user._id;
    const article = await articleService.createWriterArticle(writerId, req.body);

    res.status(201).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Writer endpoint: Get writer's own articles.
   */
  async getWriterArticles(req, res) {
    const writerId = req.user.id || req.user._id;
    const result = await articleService.getWriterArticles(writerId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Writer endpoint: Get stats for writer dashboard.
   */
  async getWriterStats(req, res) {
    const writerId = req.user.id || req.user._id;
    const stats = await articleService.getWriterStats(writerId);

    res.status(200).json({
      success: true,
      data: {
        stats,
      },
    });
  }

  /**
   * Protected Writer endpoint: Get single article owned by writer.
   */
  async getWriterArticleById(req, res) {
    const writerId = req.user.id || req.user._id;
    const article = await articleService.getWriterArticleById(writerId, req.params.id);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Writer endpoint: Update writer's own draft/changes_requested article.
   */
  async updateWriterArticle(req, res) {
    const writerId = req.user.id || req.user._id;
    const article = await articleService.updateWriterArticle(writerId, req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Writer endpoint: Submit or resubmit article for editorial review.
   */
  async submitWriterArticle(req, res) {
    const writerId = req.user.id || req.user._id;
    const article = await articleService.submitWriterArticle(writerId, req.params.id);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  // --- ADMIN EDITORIAL REVIEW CONTROLLER METHODS ---

  /**
   * Protected Admin endpoint: Get queue of submitted articles for review.
   */
  async getAdminReviewQueue(req, res) {
    const result = await articleService.getAdminReviewQueue(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Protected Admin endpoint: Approve and publish submitted article.
   */
  async approveArticle(req, res) {
    const adminId = req.user.id || req.user._id;
    const article = await articleService.approveArticle(adminId, req.params.id);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Admin endpoint: Request changes with feedback note.
   */
  async requestChanges(req, res) {
    const adminId = req.user.id || req.user._id;
    const article = await articleService.requestChanges(adminId, req.params.id, req.body.reviewNote);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }

  /**
   * Protected Admin endpoint: Reject article with rejection reason.
   */
  async rejectArticle(req, res) {
    const adminId = req.user.id || req.user._id;
    const article = await articleService.rejectArticle(adminId, req.params.id, req.body.reviewNote);

    res.status(200).json({
      success: true,
      data: {
        article,
      },
    });
  }
}

export default new ArticleController();
