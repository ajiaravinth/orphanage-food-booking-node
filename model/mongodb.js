const administrators = require("../schema/administrators");
const users = require("../schema/users");
const slots = require("../schema/slots");

const db = {
  administrators: administrators,
  users: users, 
  slots: slots
};

const GetOneDoc = (model, query, projection, extension) => {
  const Query = db[model].findOne(query, projection, extension.options);
  return new Promise((resolve, reject) => {
    if (extension.populate) {
      Query.populate(extension.populate);
    }
    if (extension.sort) {
      Query.sort(extension.sort);
    }
    if (extension.skip) {
      Query.skip(extension.skip);
    }
    if (extension.limit) {
      Query.limit(extension.limit);
    }
    Query.exec((err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};

const GetDocs = (model, query, projection, extension) => {
  const Query = db[model].find(query, projection, extension.options);
  return new Promise((resolve, reject) => {
    if (extension.populate) {
      Query.populate(extension.populate);
    }
    if (extension.sort) {
      Query.sort(extension.sort);
    }
    if (extension.skip) {
      Query.skip(extension.skip);
    }
    if (extension.limit) {
      Query.limit(extension.limit);
    }
    Query.exec((err, docs) => {
      if (extension.count) {
        Query.countDoucuments((err, docs) => {
          if (err) {
            reject(err);
          } else {
            resolve(docs);
          }
        });
      } else {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      }
    });
  });
};

const GetAggregationDoc = (model, query) => {
  return new Promise((resolve, reject) => {
    var aggregation = db[model].aggregate(query);
    aggregation.options = { allowDiskUse: true };
    aggregation.collation({
      locale: "en_US",
      caseLevel: true,
      caseFirst: "upper",
    });
    aggregation.exec((err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};

const InsertDocs = (model, docs) => {
  const docs_obj = new db[model](docs);
  return new Promise((resolve, reject) => {
    docs_obj.save((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const UpdateDoc = (model, criteria, doc, options) => {
  return new Promise((resolve, reject) => {
    db[model].updateOne(criteria, doc, options, (err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};

const GetCountDocs = (model, conditions) => {
  return new Promise((resolve, reject) => {
    db[model].countDoucuments(conditions, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const DeleteDocs = (model, criteria) => {
  return new Promise((resolve, reject) => {
    db[model].deleteOne(criteria, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const DeleteManyDocs = (model, criteria) => {
  return new Promise((resolve, reject) =>
    db[model].deleteMany(criteria, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  );
};

const FindOneandUpdateDoc = (model, criteria, doc, options) => {
  return new Promise((resolve, reject) => {
    db[model].findOneAndUpdate(criteria, doc, options, (err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};

const InsertMultipleDocs = (model, docs) => {
  return new Promise((resolve, reject) => {
    db[model].insertMany(docs, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const findOneandUpdateDoc = (model, criteria, doc, options) => {
  return new Promise((resolve, reject) => {
    db[model].findOneAndUpdate(criteria, doc, options, (err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};

module.exports = {
  GetDocs: GetDocs,
  GetOneDoc: GetOneDoc,
  GetAggregationDoc: GetAggregationDoc,
  InsertDocs: InsertDocs,
  UpdateDoc: UpdateDoc,
  GetCountDocs: GetCountDocs,
  DeleteDocs: DeleteDocs,
  DeleteManyDocs: DeleteManyDocs,
  FindOneandUpdateDoc: FindOneandUpdateDoc,
  InsertMultipleDocs: InsertMultipleDocs,
  findOneandUpdateDoc: findOneandUpdateDoc,
};
