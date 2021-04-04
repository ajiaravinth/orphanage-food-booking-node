"use strict";

const express = require("express"),
  path = require("path"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  validator = require("express-validator"),
  cookieParser = require("cookie-parser"),
  compression = require("compression"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  CONFIG = require("./config/config");

var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server, { transports: ["polling", "websocket"] });
// io.set("transports", ["websocket"]);

global.GLOBAL_CONFIG = {};
mongoose.Promise = global.Promise;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

mongoose.connect(CONFIG.DB_URL, {
  useCreateIndex: true,
  useFindAndModify: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.connection.on("error", (error) =>
  console.error("Error in MongoDb connection: " + error)
);
mongoose.connection.on("reconnected", () =>
  console.log("Trying to reconnect!")
);
mongoose.connection.on("disconnected", () =>
  console.log("MongoDB disconnected!")
);

mongoose.connection.on("connected", () => {
  app.disable("x-powered-by");
  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
  app.use(validator());
  app.set("view engine", "html");
  app.locals.pretty = true;
  app.set("public", "./public");
  app.use("/", express.static(path.join(__dirname, "public")));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });
  app.use(cors({ origin: true, credentials: true }));
  require("./routes")(app, io);

  try {
    server.listen(CONFIG.PORT, () =>
      console.log(`server running on port ${CONFIG.PORT}`)
    );
  } catch (ex) {
    console.log(ex);
  }
});

var closeDbConnection = () => {
  mongoose.connection.close(() => process.exit(0));
};

process.on("SIGINT", closeDbConnection).on("SIGTERM", closeDbConnection);
