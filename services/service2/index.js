const { configureApp, runApp } = require("express-app");
const grpc = require("@grpc/grpc-js");
const { grpcServer, grpcClients } = require("grpc-registry");
const { getMessage } = require("./models/message");

const runGrpcServer = () => {
  const server = grpcServer("Service2", {
    getMessage: (ctx) => {
      ctx.res = { message: getMessage(ctx.req.name) };
    },
  });
  server.start("0.0.0.0:50052");
  console.log("Service2: gRPC server running on port 50052");
};
runGrpcServer();

const service1Client = new grpcClients.Service1(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
runApp(
  configureApp((app) => {
    app.get("/health", (req, res) => {
      res.send("Service is healthy");
    });

    app.get("/message-from-service1", (req, res) => {
      service1Client.getMessage({ name: "Service2" }, (err, response) => {
        if (err) {
          console.error(err);
        } else {
          res.send(response.message);
        }
      });
    });
  }),
  {
    name: "service2",
    port: 4000,
  }
);
