const { configureApp, runApp } = require("express-app");
const grpc = require("@grpc/grpc-js");
const { grpcServer, grpcClients } = require("grpc-registry");
const { getMessage } = require("./models/message");

const runGrpcServer = () => {
  const server = grpcServer("Service1", {
    getMessage: (ctx) => {
      ctx.res = { message: getMessage(ctx.req.name) };
    },
  });
  server.start("0.0.0.0:50051");
  console.log("Service1: gRPC server running on port 50051");
};
runGrpcServer();

const service2Client = new grpcClients.Service2(
  "localhost:50052",
  grpc.credentials.createInsecure()
);
runApp(
  configureApp((app) => {
    app.get("/health", (req, res) => {
      res.send("Service is healthy");
    });

    app.get("/message-from-service2", (req, res) => {
      service2Client.getMessage({ name: "Service1" }, (err, response) => {
        if (err) {
          console.error(err);
        } else {
          res.send(response.message);
        }
      });
    });
  }),
  {
    name: "service1",
    port: 3000,
  }
);
