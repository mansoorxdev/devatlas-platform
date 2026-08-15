import searchService from '#services/search.service.js';

export class SearchController {
  /**
   * GET /api/v1/search?q=<query>
   * Public endpoint to search published Articles, Snippets, and Error Solutions.
   */
  globalSearch = async (req, res, next) => {
    try {
      const { q } = req.query;
      const searchResult = await searchService.globalSearch(q);

      return res.status(200).json({
        success: true,
        data: searchResult,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new SearchController();
