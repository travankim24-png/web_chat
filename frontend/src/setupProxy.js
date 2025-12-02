const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://192.168.233.56:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};
