const validate = (schema) => {
  return (req, res, next) => {
    const parseResult = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parseResult.success) {
      const details = parseResult.error.issues.map((issue) => ({
        field: issue.path.slice(1).join('.') || 'root', // Remove the first layer ('body', 'query', 'params')
        location: issue.path[0],                      // 'body', 'query', or 'params'
        message: issue.message,
      }));

      const message = `Validation failed: ${details
        .map((d) => `${d.field} in ${d.location} - ${d.message}`)
        .join('; ')}`;

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message,
          details,
        },
      });
    }

    // Overwrite with validated data (includes casted types/defaults from Zod)
    req.body = parseResult.data.body || req.body;
    req.query = parseResult.data.query || req.query;
    req.params = parseResult.data.params || req.params;

    next();
  };
};

export default validate;
