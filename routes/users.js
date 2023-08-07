var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
const res = require('express/lib/response');
var alert= require('alert');
var mongodbutil = require( './mongodbutil' );
var dbConnection = mongodbutil.getDb();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get("/shop/:category?",function(req,res)
{ 
  var categories=req.params.category;
  var username=req.session.username;
  console.log(username)
  var url =req.url;
  
  if(url=='/shop/wallet'){
  async function wallet()
  {
    var res1 = await dbConnection.collection("Details").findOne({"username":username})
    
    var res2 = await dbConnection.collection("products").find({"category":"Fresh Veggies and Fruits"}).toArray();
    var res3 = await dbConnection.collection("products").find({"category":"Fresh Veggies and Fruits"}).sort({sold:-1}).limit(2).toArray();
  console.log(res2);
  res.render("shopping",{"products":res2,"points":res1.pts,"popular":res3,"msg":"Fresh Veggies and Fruits"});
  }
  wallet();
  }
  else if(url=='/shop/subscriptions'){
    async function subscriptions()
    {
   
      var res5=[];
      var res1 = await dbConnection.collection("Details").findOne({"username":username})
      var res2 = await dbConnection.collection("products").find({"category":"staples"}).toArray();
      var res3 = await dbConnection.collection("products").find({"category":"staples"}).sort({sold:-1}).limit(2).toArray();
    res.render("shopping",{"products":res2,"points":res1.pts,"popular":res3,"msg":"staples"});
    }
    subscriptions();
    }
    else if(url=='/shop/mobiles'){
      async function subscriptions()
      {
        var res1 = await dbConnection.collection("Details").findOne({"username":username})
        
        var res2 = await dbConnection.collection("products").find({"category":"Dairy"}).toArray();
        var res3 = await dbConnection.collection("products").find({"category":"Dairy"}).sort({sold:-1}).limit(2).toArray();
        console.log(res2)
      
      res.render("shopping",{"products":res2,"points":res1.pts,"popular":res3,"msg":"Dairy"});
      }
      subscriptions();
      }
  else if(url=='/shop'||'/shop/home'){ 
    async function shop(){
      console.log("****************************")
    var res1 = await dbConnection.collection("Details").findOne({"username":username});
    var res2 = await dbConnection.collection("products").find().sort({date:-1}).limit(4).toArray();
    var res3 = await dbConnection.collection("products").find().sort({sold:-1}).limit(4).toArray();
    
    //var res2 = await dbConnection.collection("products").find({}).toArray();
   //console.log(res2[1].file[1].filename);
    res.render("shopping",{"products":res2,"points":res1.pts,"popular":res3,"msg":"HOME PAGE"});
    
  }shop(); 
  }
})

router.get("/addToCart/:id",function(req,res){
  var id = req.params.id;
  var Redemptioncode =Math.floor( Math.random() * 1000000000000);
  var usersession=req.session.username
  async function cart()
  { 
    var res1 = await dbConnection.collection("products").findOne({"_id":ObjectId(id)});
    if(res1.category=="wallet"){
      res1.Redemptioncode=Redemptioncode;
      
    }
    res1.userlogged=usersession;
    //res1._id='' + Math.floor(1000 + Math.random() * 90000000000);
    res1._id=Symbol();
    console.log("------------------------------>");
    console.log(res1._id);
    console.log("------------------------------>");
    res1.rated=false;
    console.log(res1);
    var res2 = await dbConnection.collection("cart").insertOne(res1);
    alert("product added to cart successfully");
    res.redirect("/shop");
  }
  cart();
});
router.get("/product_description/:id",function(req,res){
  var id = req.params.id;
  async function product_des(){
  var res1 = await dbConnection.collection("products").findOne({"_id":ObjectId(id)});
  var res2 = await dbConnection.collection("Details").findOne({ "username": req.session.username })
  //var res3 = await dbConnection.collection("cart").find({ "userlogged": req.session.username }).toArray();
  // for (let i = 0; i < res1.length; i++) {
  //   totalpoints = totalpoints + res1[i].pts;
  // }
  console.log(req.session.username);
  res.render("productitem", { "products": res1, "points": res2.pts, "tpoints": res1.pts });
  
  }product_des();
})

router.get('/purchasehistory',function(req,res){
  var username=req.session.username;
  async function purchasehistory(){
  var res1 = await dbConnection.collection("purchasehistory").find({"userlogged":username}).sort({date:-1}).toArray();
  res.render('purchasehistory',{"purchaseitems":res1})
  }purchasehistory();
})


router.post("/rated/:id",function(req,res)
{
var iid = req.params.id;
var ratingv = req.body.rate
async function rating()
{ var res0 = await dbConnection.collection("purchasehistory").findOne({"_id":ObjectId(req.params.id)});
var res1 = await dbConnection.collection("purchasehistory").updateOne({"_id":ObjectId(req.params.id)},{$set:{"rating":ratingv,"rated":true}})
var res2 = await dbConnection.collection("products").findOne({"id":res0.id});
if(res2.rating != 0)
{
var calc = (res2.rating+parseInt(ratingv))/2;
}
else{
var calc = parseInt(ratingv)
}
var res1 = await dbConnection.collection("products").updateOne({"id":res0.id},{$set:{"rating":calc}})
res.redirect("/purchasehistory")
}
rating()

})


module.exports = router;
