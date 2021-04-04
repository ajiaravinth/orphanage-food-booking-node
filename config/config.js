const path = require("path"),
  fs = require("fs");

var config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/config.json"), "utf-8")
);

const CONFIG = {};

CONFIG.PORT = config.port;
CONFIG.DB_URL = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.db}`;
CONFIG.SECRET_KEY =
  "fZwLwG7QmKnYbhQilnTjhcHhWJ8Va3VfTfOdMLTWk5IlcptmAavHc0MXzJGzArChxhk7Q2";

module.exports = CONFIG;
