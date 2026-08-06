import asyncWrapper from '#utils/async-wrapper.js';

export const getHealth = asyncWrapper(async (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: Math.floor(process.uptime()), // Uptime in seconds
    timestamp: new Date().toISOString(),
  });
});
