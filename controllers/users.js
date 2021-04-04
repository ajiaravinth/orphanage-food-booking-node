const { InsertDocs } = require("../model/mongodb");
const db = require("../model/mongodb"),
  library = require("../model/library"),
  bcrypt = require("bcrypt-nodejs")
const { checkArray } = require("./events/common");

module.exports = (app, io) => {
  const router = {};

  router.user_register = async (req, res) => {
    const data = {};
    data.status = 0;
    req.checkBody("username", "Username is Required!").notEmpty();
    req.checkBody("email", "Invalid Email!").notEmpty().isEmail();
    req.checkBody("name", "Name is Required!").notEmpty();
    if (!req.body._id) {
      req.checkBody("password", "Invalid Password").notEmpty();
      req
        .checkBody("confirm_password", "Password not match")
        .equals(req.body.password);
    }
    req.checkBody("phone", "Invalid Number").notEmpty();

    const errors = req.validationErrors();
    if (errors) {
      data.response = errors[0].msg;
      return res.send(data);
    }
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
      name: req.body.name,
      phone: req.body.phone,
      address: {
        line1: req.body.line1,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
      },
      status: 1,
      tempstatus: req.body.tempstatus,
    };   
      // user.password = library.jwtSign({
      //   password: user.password,
      // });
      if (req.body.password && req.body.confirm_password) {
        user.password = bcrypt.hashSync(
          req.body.password,
          bcrypt.genSaltSync(8),
          null
        );
      }

    let check_email = await db.GetDocs(
      "users",
      { email: String(req.body.email).trim() },
      {},
      {}
    );
    if (check_email && checkArray(check_email) && check_email.length > 0) {
      return res.json({
        status: 0,
        response: "Email already exsist!",
      });
    }

    let check_username = await db.GetDocs(
      "users",
      { username: String(req.body.username).trim() },
      {},
      {}
    );
    if (
      check_username &&
      checkArray(check_username) &&
      check_username.length > 0
    ) {
      return res.json({
        status: 0,
        response: "Username already exsist!",
      });
    }

    let userRegister = await db.InsertDocs("users", user);
    if (!userRegister) {
      data.response = "Username/Email is already Exists";
      res.send(data);
    } else {
      const message = "New User Registered!";
      return res.json({
        status: 1,
        response: userRegister,
        message: message,
      });
    }
  }

  router.user_login = async (req, res) => {
    const data = {};
    data.status = 0;
    req.checkBody("email", "Email Required").notEmpty();
    req.checkBody("password", "Password Required").notEmpty();
    const errors = req.validationErrors();
    if (errors) {
      data.response = errors[0].msg;
      return res.send(data);
    }
    const { email, password } = req.body;

    let docData = await db.GetOneDoc(
      "users",
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
      if (!validity) {             
          return res.json({
            status: 0,
            response: "Invalid Credentials",
          });      
      } else {
        const auth_token = library.jwtSign({
          username: docData.username,
          id: docData._id,
        });
        return res.json({
          status: 1,
          response: {
            auth_token: auth_token,
            data: docData.username,
            userid: docData._id,
            address: docData.address.city,
            phone: docData.phone
          },
          message: "Login Successful!!",

        });
      }
    }

  }

  router.slot_booking = async (req, res) => {

    let data = {};
    data.status = 0;
    req.checkBody("orphanage_name", "select orphonage").notEmpty()
    req.checkBody("date", "select date").notEmpty()
    const errors = req.validationErrors();
    if (errors) {
      data.response = errors[0].msg;
      return res.send(data);cd
    }
    const { orphanage_name, date, slot, userid, username, slot_timing, user_address, user_phone } = req.body;
    const booking_data = {
      orphanage_name: orphanage_name,
      slot_timing: slot_timing,
      booking_date: date,
      username: username,
      user_address: user_address,
      user_phone: user_phone,
      status: 1,
    }

    let insertData = await InsertDocs("slots", booking_data);    
    (insertData) ?
      res.json({
        status: 1,
        response: "Your Slot Booked",
        result: insertData
      })
      :
      res.json({
        status: 0,
        response: "Your Slot Not Booked"
      })
  }

  router.booking_details = async (req, res) => {
    const data = {};
    data.status = 0;
    const errors = req.validationErrors();
    if (errors) {
      data.response = errors[0].msg;
      return res.send(data);
    }
    const { orphanage_name, date, slot_timing } = req.body;
    let docData = await db.GetOneDoc("slots", { $and: [{ orphanage_name: { $eq: orphanage_name } }, { booking_date: { $eq: new Date(date) } }, { slot_timing: { $eq: slot_timing } }] }, {}, {});
    if (docData && docData !== null) {
      res.json({
        status: 1,
        response: true
      })
    }
    if (docData === null) {
      res.json({
        status: 0,
        response: false
      })
    }
  }

  return router
}