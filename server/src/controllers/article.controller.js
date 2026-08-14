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
}

export default new ArticleController();
