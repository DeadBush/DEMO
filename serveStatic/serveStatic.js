const restify = require('restify');
const server = restify.createServer();

// Optionally, start listening on a port:
server.listen(process.env.PORT || 3978, function () {
  console.log('%s listening at %s', server.name, server.url);
});
