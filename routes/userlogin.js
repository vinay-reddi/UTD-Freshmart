var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
const res = require('express/lib/response');
  const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var mongodbutil = require( './mongodbutil' );
var dbConnection = mongodbutil.getDb();

router.get('/registration', function (req, res) {
  res.render('registration', { "msg": '' });
});
router.post('/register', function (req, res) {

  details = {
    "username": req.body.username,
    "email": req.body.email,
    "pts": 0,
    "password": req.body.password,
    "cpassword": req.body.cpassword,
    "user_type": req.body.user_type,
    "street": req.body.street_id,
    "city": req.body.city_id,
    "zipcode":req.body.zipcode_id
  };
  async function registration() {
    var res1 = await dbConnection.collection("Details").findOne({ "email": req.body.email });
    var findUser = await dbConnection.collection("Details").findOne({ "username": req.body.username });
    console.log(res1)
    if (findUser != null) {
      res.send({ "msg": "Already Registered", "value": '' });
    }
    else if (res1 != null) {
      res.send({ "msg": "Email already in use", "value": '' });
    }
    else {
      if (req.body.password != req.body.cpassword) {
        res.send({ "msg": "Passwords does not match", "value": '' })
      }
      else {
        const saltRounds = 10;
        const hash = bcrypt.hashSync(req.body.password, saltRounds);
        details.password = hash;
        console.log(details.password);
        var insertUser = await dbConnection.collection("Details").insertOne(details, function (err, res1) {

          res.send({ 'msg': '' });
        })
      }
    }
  }
  registration();

});
router.post("/verify", function (req, res) {
  req.session.username = req.body.username;
  async function verify() {
    var res1 = await dbConnection.collection("Details").findOne({ "username": req.body.username,"user_type":req.body.users });
    
   
    if (res1 == null) {
      res.render("user", { "msg": "NO USER FOUND PLEASE REGISTER TO ENJOY OUR SERVICES" });
    }
    else {
      var verify = bcrypt.compareSync(req.body.password, res1.password);
      console.log(verify);
      if (verify == true) {
        req.session.auth1 = true
        if (req.body.users == "Admin") {
          res.redirect('/adminhome')
        }
        if(req.body.users == "Vendor"){
          res.redirect("/vendorhome")
        }
        else {
          res.redirect('/shop');
        }
      }

      else {
        res.render("user", { "msg": "USERNAME OR PASSWORD DOESNOT MATCH" })
      }
    }
  } verify();
});
router.get('/forgotpass', function (req, res) {
  req.otp = 123;
  res.render('forgotpass');
});
router.post('/sendotp', function (req, res) {
  async function otp() {

    var otp = '' + Math.floor(1000 + Math.random() * 9000);
    req.session.generatedotp = otp;
    console.log(otp);
    var res1 = await dbConnection.collection("Details").findOne({ "username": req.body.username });
    req.session.resetusername = req.body.username;
    console.log(res1)
    if (res1 == null) {
      res.send({ "msg": "Invalid Username", "value": '' })
    }
    else {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'savyasachi017@gmail.com',
          pass: 'ss'
        }
      });

      var mailOptions = {
        from: 'pallikonda.rithin@gmail.com',
        to: res1.email,
        subject: 'Sending Email using Node.js',
        text: otp
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })
      res.send({ "msg": "OTP Sent To Registered Email" });
    }
  } otp();
});
router.post('/verifyotp', function (req, res) {
  async function verifyotp() {
    if (req.session.generatedotp == req.body.otp) {
      res.send({ "msg": '' });
    }
    else {
      res.send({ "msg": "OTP does not match", "value": '' })
    }
  } verifyotp();
});


router.get('/resetpassword', function (req, res) {
  res.render('resetpassword');

})
router.post('/resetpass', function (req, res) {
  async function resetpassword() {
    if (req.body.password != req.body.cpassword) {
      res.send({ "msg": "Passwords does not match", "value": '' })
    }
    else {
      const saltRounds = 10;
      var hash = bcrypt.hashSync(req.body.password, saltRounds);
      var updatedpassword = {
        "password": hash

      }
      var res2 = await dbConnection.collection("Details").updateOne({ username: req.session.resetusername }, { $set: updatedpassword });

      res.send({ "msg": '', "value": '' });

    }
  } resetpassword();
})
module.exports = router;