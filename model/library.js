const bcrypt = require("bcrypt-nodejs"),
  jwt = require("jsonwebtoken"),
  CONFIG = require("../config/config");

const validPassword = (password, passworddb) => {
  console.log(password, passworddb, "password, passworddb")
  return bcrypt.compareSync(password, passworddb);
};

const jwtSign = (payload) => {
  return jwt.sign(payload, CONFIG.SECRET_KEY, { expiresIn: "10h" });
};

module.exports = {
  validPassword,
  jwtSign,
};
