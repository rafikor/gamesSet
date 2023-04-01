const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:42851';

const context =  [
    "/weatherforecast",
    "/GameSessions",
    "/tictactoe.html",
    "/counter",
    "/fetch-data",
    "/TicTacToeHub"
];

module.exports = function(app) {
  const appProxy = createProxyMiddleware(context, {
    target: target,
    secure: false,
      ws: true, // <-- Add this
      //headers: { // <-- Remove this
      //    Connection: "Keep-Alive", // <-- Remove this
      //}, // <-- Remove this
  });

  app.use(appProxy);
};
