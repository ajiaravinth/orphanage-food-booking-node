
const {
    GetOneDoc,
    UpdateDoc,
    GetDocs,
    InsertDocs,
    GetAggregationDoc
  } = require("../model/mongodb");
  const library = require("../model/library");
  const bcrypt = require("bcrypt-nodejs");
  const { checkArray } = require("./events/common");
module.exports = () => {
    const router = {};

    router.admin_register = async (req, res) => {
        data = {};
        data.status = 0;
        req.checkBody("name", "Name is requires").notEmpty();
        req.checkBody("username", "Username Required").notEmpty();
        req.checkBody("email", "Email Required").notEmpty();
        req.checkBody("password", "Password Required").notEmpty();
        const error = req.validationErrors();
        if (error) {
          data.response = error[0].msg;
          res.send(data);
        }
        const admin = {
          name: req.body.name,
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          status: 1,
        };

    
        if (req.body.password) {
          admin.password = bcrypt.hashSync(
            req.body.password,
            bcrypt.genSaltSync(8),
            null
          );
          // admin.password = library.jwtSign({
          //   password: admin.password,
          // });
        }
    
        let check_email = await GetDocs(
          "administrators",
          { email: String(admin.email).trim() },
          { _id: 1 },
          {}
        );
        if (check_email && checkArray(check_email) && check_email.length > 0) {
          return res.json({ status: 0, response: "Email is already exisits!" });
        }
        let check_username = await GetDocs(
          "administrators",
          { username: String(admin.username).trim() },
          { _id: 1 },
          {}
        );
        if (
          check_username &&
          checkArray(check_username) &&
          check_username.length > 0
        ) {
          return res.json({ status: 0, response: "Username is already exisits!" });
        }
    
        let newDocs = InsertDocs("administrators", admin);
        if (newDocs) {
          return res.json({
            status: 1,
            response: "Registered successfully."
          });
        } else {
          return res.json({
            status: 0,
            response: "Unable to Save Your Data Please try again",
          });
        }
      };
    
      router.admin_login = async (req, res) => {
        data = {};
        data.status = 0;
        req.checkBody("email", "Email Required").notEmpty();
        req.checkBody("password", "Password Required").notEmpty();
        const errors = req.validationErrors();
        if (errors) {
          data.response = errors[0].msg;
          return res.send(data);
        }
        const { email, password } = req.body;
    
        let docData = await GetOneDoc(
          "administrators",
          {
            $or: [
              { email: email, status: 1 },
              { username: email, status: 1 },
            ],
          },
          {},
          {}
        );
        
        if (!docData) {
          return res.json({
            status: 0,
            response: "Invalid Credentials",
          });
        } else {
          let validity = library.validPassword(password, docData.password);
          if(validity) {
            const auth_token = library.jwtSign({
              username: docData.username,
              id: docData._id,
            });
            return res.json({
              status: 1,
              response: {
                auth_token: auth_token,
                data: docData.username,        
              },
              message: "Login Successful!!",
    
            });
          }
          else {
            return res.json({
              status: 0,
              response: "Invalid Credentials",
            });
          }
      };
    }

    router.booking_list = async(req, res) => {
        let data = {};
        data.status = 0;
        const errors = req.validationErrors();
        if (errors) {
          data.response = errors[0].msg;
          return res.send(data);
        }
    
        const userQuery = [];
    
        userQuery.push({
          $match: { status: { $eq: 1 } },
        });
    
        if (req.body.search) {
          const searchs = req.body.search;
          if (req.body.filter === "all") {
            userQuery.push({
              $match: {
                $or: [
                  { username: { $regex: searchs + ".*", $options: "si" } },
                  { email: { $regex: searchs + ".*", $options: "si" } },
                  { user_phone: { $regex: searchs + ".*", $options: "si" } },                 
                  { user_address: { $regex: searchs + ".*", $options: "si" } },            
                  { orphanage_name: { $regex: searchs + ".*", $options: "si" } },          
                ],
              },
            });
          } else {
            const searching = {};
            searching[req.body.filter] = { $regex: searchs + ".*", $options: "si" };
            userQuery.push({ $match: searching });
          }
        }
    
        const withoutlimit = Object.assign([], userQuery);
        withoutlimit.push({ $count: "count" });
    
        // if (req.body.skip >= 0) {
        //   userQuery.push({ $skip: parseInt(req.body.skip) });
        // }
    
        // if (req.body.limit >= 0) {
        //   userQuery.push({ $limit: parseInt(req.body.limit) });
        // }
    
        if (req.body.field && req.body.order) {
          const sorting = {};
          sorting[req.body.field] = parseInt(req.body.order);
    
          userQuery.push({ $sort: sorting });
        } else {
          userQuery.push({ $sort: { createdAt: -1 } });
        }
    
        const finalQuery = [
          {
            $facet: {
              overall: withoutlimit,
              result: userQuery,
            },
          },
        ];
    
        let docData = await GetAggregationDoc("slots", finalQuery);
        data.status = 1;
        let fullcount;
        if (docData[0].overall[0] && docData[0].overall[0].count) {
          fullcount = docData[0].overall[0].count;
        } else {
          fullcount = docData[0].result.length;
        }
        data.response = {
          finalQuery: finalQuery,
          result: docData[0].result,
          length: docData[0].result.length,
          fullcount: fullcount,
        };
        return res.send(data);
      };

    return router 
}