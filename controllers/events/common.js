const { Types } = require("mongoose");

const checkArray = (e) => Array.isArray(e);

const isObjectId = (e) => Types.ObjectId.isValid(e);

const ObjectId = (e) => Types.ObjectId(e);

module.exports = {
  checkArray,
  isObjectId,
  ObjectId,
};
