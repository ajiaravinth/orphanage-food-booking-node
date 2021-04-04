var path = require("path");

module.exports = (app, passport, io) => {
  try {
    require("./administrators")(app, io);
    require("./users")(app, io);

    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../public/index.html"));
    });
    app.get("/*", function (req, res) {
      res.sendFile(path.join(__dirname, "../public/index.html"));
    });
  } catch (error) {
    console.log("Error in router", error);
  }
};
