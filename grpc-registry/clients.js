const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const loadDefinition = (protoPath) =>
  protoLoader.loadSync(path.join(__dirname, protoPath), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

const { Service1, Service2 } = grpc.loadPackageDefinition(
  loadDefinition("./protos/services.proto")
).services;

module.exports = {
  Service1,
  Service2,
};
