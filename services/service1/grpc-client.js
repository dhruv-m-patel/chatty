const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const packageDefinition = protoLoader.loadSync(
  path.resolve(__dirname, "../../protos/service2.proto"),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);
const service2 = grpc.loadPackageDefinition(packageDefinition).service2;

function main() {
  const client = new service2.MessageService(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );
  return client;
}

module.exports = main;
