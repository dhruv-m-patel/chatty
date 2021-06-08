const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const packageDefinition = protoLoader.loadSync(
  path.resolve(__dirname, "../../protos/service1.proto"),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);
const service1 = grpc.loadPackageDefinition(packageDefinition).service1;

function main() {
  const client = new service1.MessageService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  return client;
}

module.exports = main;
