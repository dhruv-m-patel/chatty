const Mali = require("mali");
const logger = require("@malijs/logger");
const onError = require("@malijs/onerror");
const { getMessage } = require("./models/message");
const path = require("path");

function logError(err, ctx) {
  console.log("Error on %s: %s", ctx.name, err.toString());
}

function getService1Message(ctx) {
  ctx.res = { message: getMessage(ctx.req.name) };
}

function main() {
  const app = new Mali(path.resolve(__dirname, "../../protos/service1.proto"));
  app.use(logger());
  app.use(onError(logError));
  app.use({ getMessage: getService1Message });
  app.start("0.0.0.0:50051");
  console.log("Service1: gRPC server running on port 50051");
}

module.exports = main;
