const Mali = require("mali");
const logger = require("@malijs/logger");
const onError = require("@malijs/onerror");
const path = require("path");

function logError(err, ctx) {
  console.log("Error on %s: %s", ctx.name, err.toString());
}

function grpcServer(service, calls) {
  const app = new Mali(
    path.join(__dirname, "./protos/services.proto"),
    service
  );
  app.use(logger());
  app.use(onError(logError));
  app.use(calls);
  return app;
}

module.exports = grpcServer;
