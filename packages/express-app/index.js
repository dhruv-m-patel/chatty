const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");

const configureApp = (setup) => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(cors());
  app.use(compression());
  app.use(cookieParser());
  app.use(morgan("common"));
  setup(app);
  app.use((err, req, res, next) => {
    if (err) {
      console.log(`Unhandler error: ${err.message}`, err.stack);
      res.status(err.status || 500).send("Internal server error");
    } else {
      next();
    }
  });
  return app;
};

const runApp = (app, options) => {
  const { name, port } = options;
  app.listen(port, () => {
    console.log(`${name} is running on port ${port}...`);
  });
};

module.exports = { configureApp, runApp };
