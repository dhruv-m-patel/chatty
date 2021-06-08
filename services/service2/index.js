const { configureApp, runApp } = require("express-app");
const runGrpcServer = require("./grpc-server");
const grpcClient = require("./grpc-client");

const server = configureApp((app) => {
  app.get("/health", (req, res) => {
    res.send("Service is healthy");
  });

  app.get("/message-from-service1", (req, res) => {
    grpcClient().getMessage({ name: "Service2" }, (err, response) => {
      if (err) {
        console.error(err);
      } else {
        res.send(response.message);
      }
    });
  });
});

runApp(server, {
  name: "service2",
  port: 4000,
});

runGrpcServer();
