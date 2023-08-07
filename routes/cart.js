var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
const nodemailer = require('nodemailer');
const res = require('express/lib/response');
var mongodbutil = require( './mongodbutil' );
var dbConnection = mongodbutil.getDb();
// USER CART //
router.get("/userCart", function (req, res) {
  var totalpoints = 0;

  async function productsincart() {


    var res2 = await dbConnection.collection("Details").findOne({ "username": req.session.username })
    var res1 = await dbConnection.collection("cart").find({ "userlogged": req.session.username }).toArray();
    for (let i = 0; i < res1.length; i++) {
      totalpoints = totalpoints + res1[i].pts;
    }
    console.log(req.session.username);
    res.render("cartitem", { "cartitems": res1, "points": res2.pts, "tpoints": totalpoints });

  }
  productsincart();
});
//CONFIRMING THE ORDER//
router.get("/confirm", function (req, res) {
  var totalpoints = 0;
  var dailyredeemed =0;
  var selling=0;
  var msg;
  async function deletepts() {
    var result = await dbConnection.collection("Details").findOne({ "username": req.session.username });
    var userpoints = result.pts;
    if (userpoints < "0") {
      alert("NO POINTS TO REDEEM PLEASE GET POINTS TO COMPLETE TRANSACTION");
    }
    else {
      var res1 = await dbConnection.collection("cart").find({ "userlogged": req.session.username }).toArray();
      
      for (let i = 0; i < res1.length; i++) {
        totalpoints = totalpoints + res1[i].pts;
        var selling=parseInt(res1[i].sold+1);
        console.log(selling);
        var soldobj={"sold":selling};
        var res3 = await dbConnection.collection("products").updateOne({ "id": res1[i].id }, { $set: soldobj })
        if (res1[i].category == "wallet") {
          msg = 'Your Redemption Code for Purchase Made : ' + ''+res1[i].Redemptioncode;
          console.log(msg);
          console.log(res1[i].Redemptioncode);
        }
        else {
          msg = "Order has been Successfully Placed"
        }
      }
      if (totalpoints <= userpoints) {  
        var updatedpoints = (userpoints - totalpoints);
        dailyredeemed = dailyredeemed+totalpoints;
        console.log(dailyredeemed);
        var obj = { "pts": updatedpoints }
        var res2 = await dbConnection.collection("Details").updateOne({ "username": req.session.username }, { $set: obj })
        var res5 = await dbConnection.collection("cart").find({ "userlogged": req.session.username }).toArray();
        console.log("8888888888888888")
        for(let i=0;i<res5.length;i++){
          res5[i].date=new Date();
          res5[i].sold=selling;
        }
        console.log("8888888888888888");
        console.log(res5);
        var purchasehistory= await dbConnection.collection("purchasehistory").insertMany(res5);
        var del = await dbConnection.collection("cart").deleteMany({ "userlogged": req.session.username });
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'pallikonda.rithin@gmail.com',
            pass: 'ravijyothi1'
          }
        });

        var mailOptions = {
          from: 'pallikonda.rithin@gmail.com',
          to: result.email,
          subject: 'Order Successfully Placed Thank you! shop with us Again',
          text: msg
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }

        })
      res.redirect("/shop");

      }
      else {
        res.render('cartitem',{"msg":"Not Enough Points to Buy"})
      }

    }
  } deletepts();
});

//REMOVING ITEMS FROM USERCART// 

router.get("/deleteitem/:id", function (req, res) {
  dbConnection.collection("cart").deleteOne({ "_id": ObjectId(req.params.id) }, function (err, result) {
    res.redirect("/userCart");
  })
})



module.exports = router;