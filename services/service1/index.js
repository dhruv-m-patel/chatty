const { configureApp, runApp } = require("express-app");

const server = configureApp((app) => {
  app.get("/health", (req, res) => {
    res.send("Service is healthy");
  });
});

runApp(server, {
  name: "service1",
  port: "3000",
});
