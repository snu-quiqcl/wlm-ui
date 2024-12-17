/* eslint-disable @typescript-eslint/no-require-imports */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(createProxyMiddleware({
    target: 'http://localhost:8000',
    pathFilter: '/api',
  }));
  
  app.use(createProxyMiddleware({
    target: 'ws://localhost:8000',
    pathFilter: '/ws',
    ws: true,
  }));
};
