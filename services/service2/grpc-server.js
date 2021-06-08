const Mali = require("mali");
const logger = require("@malijs/logger");
const onError = require("@malijs/onerror");
const { getMessage } = require("./models/message");
const path = require("path");

function logError(err, ctx) {
  console.log("Error on %s: %s", ctx.name, err.toString());
}

function getService2Message(ctx) {
  ctx.res = { message: getMessage(ctx.req.name) };
}

function main() {
  const app = new Mali(path.resolve(__dirname, "../../protos/service2.proto"));
  app.use(logger());
  app.use(onError(logError));
  app.use({ getMessage: getService2Message });
  app.start("0.0.0.0:50052");
  console.log("Service2: gRPC server running on port 50052");
}

module.exports = main;
