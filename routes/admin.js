var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
var multer = require('multer');
var path = require('path')
const res = require('express/lib/response');
var url = "mongodb://localhost:27017/mydb";
var mongodbutil = require( './mongodbutil' );
var dbConnection = mongodbutil.getDb();



var Storage=multer.diskStorage({
    destination:"./public/uploads",
    filename:(req,file,cb)=>{
      cb(null,file.filename+"_"+Date.now()+path.extname(file.originalname));
    }
});
  
var upload=multer({
    storage:Storage
}).array('file',10)


router.get('/products',function(req,res){
  
    async function products(){
    var result= await dbConnection.collection("products").find({}).toArray()
    
    res.render('products',{"product":result,"vendor":"0"});
    }products();
})
  
router.get('/vendor_products',function(req,res){
  
  async function products(){
  var result= await dbConnection.collection("products").find({}).toArray()
  
  res.render('products',{"product":result,"vendor":"1"});
  }products();
})
//USER TABLE PAGE//
router.get('/userstable',function(req,res){
  dbConnection.collection("Details").find({}).toArray(function (err, result) {
    if (err) throw err; 
    console.log(req.session.username)
    res.render('allusers', { "empar": result, "username1": req.session.username });
  });

})
router.get('/adminhome', function (req, res) {

  async function admin(){
    var pipeline=[
      {
        '$group': {
          '_id': {
            '$dateToString': {
              'format': '%Y-%m-%d', 
              'date': '$date'
            }
          }, 
          'tpts': {
            '$sum': '$pts'
          }
        }
      }
    ]
    var pipeline1=[
      {
        '$sort': {
          'date': -1
        }
      }, {
        '$limit': 5
      }
    ]
    
    var res1= await dbConnection.collection("purchasehistory").aggregate(pipeline).sort({"_id":-1}).limit(7).toArray();
  
    var res2= await dbConnection.collection("purchasehistory").aggregate(pipeline1).toArray();
    

    console.log(JSON.stringify(res1));
    //res.render('gra',{"dailyredeemed":JSON.stringify(res1)});
    res.render('adminhome', {"dailyptsredeemed":JSON.stringify(res1),"username1": req.session.username,"purchaseitems":res2});
  }admin();
  
});

router.get('/vendorhome', function (req, res) {

  async function vendor(){
    var pipeline=[
      {
        '$group': {
          '_id': {
            '$dateToString': {
              'format': '%Y-%m-%d', 
              'date': '$date'
            }
          }, 
          'tpts': {
            '$sum': '$pts'
          }
        }
      }
    ]
    var pipeline1=[
      {
        '$sort': {
          'date': -1
        }
      }, {
        '$limit': 5
      }
    ]
    
    var res1= await dbConnection.collection("purchasehistory").aggregate(pipeline).sort({"_id":-1}).limit(7).toArray();
  
    var res2= await dbConnection.collection("purchasehistory").aggregate(pipeline1).toArray();
    

    console.log(JSON.stringify(res1));
    //res.render('gra',{"dailyredeemed":JSON.stringify(res1)});
    res.render('vendorhome', {"dailyptsredeemed":JSON.stringify(res1),"username1": req.session.username,"purchaseitems":res2});
  }vendor();
  
});
//ADDING PRODUCT BY ADMIN//
router.get("/productform",upload,function(req,res)
{
  console.log("hello")
  res.render("productform",{"msg":"","vendor":"0"});
})
router.get("/vendor_productform",upload,function(req,res)
{
  console.log("hello")
  res.render("productform",{"msg":"","vendor":"1"});
})
router.post("/addproduct",upload,function(req,res){
  productDetails={
  "name":req.body.name,
  "id":req.body.id,
  "des":req.body.desc,
  "category":req.body.category,
  "pts":parseInt(req.body.pts),
  "file":req.files,
  "date":new Date(),
  "sold":0,
  "rating":0
  }

  async function product()
  {
    console.log(req.body.pid)
    var res2=await dbConnection.collection("products").findOne({"id":req.body.id});
    if(res2==null){
      var res1= await dbConnection.collection("products").insertOne(productDetails);
      res.redirect("/products");
    }
    else{
      res.render('productform',{"msg":"ID Already Registered"})
    }
  }product();
});

router.post("/vendor_addproduct",upload,function(req,res){
  productDetails={
  "name":req.body.name,
  "id":req.body.id,
  "des":req.body.desc,
  "category":req.body.category,
  "pts":parseInt(req.body.pts),
  "file":req.files,
  "date":new Date(),
  "sold":0,
  "rating":0
  }

  async function product()
  {
    console.log(req.body.pid)
    var res2=await dbConnection.collection("products").findOne({"id":req.body.id});
    if(res2==null){
      var res1= await dbConnection.collection("products").insertOne(productDetails);
      res.redirect("/vendor_products");
    }
    else{
      res.render('productform',{"msg":"ID Already Registered","vendor":"1"})
    }
  }product();
});

// EDITING PRODUCTS BY ADMIN
router.post("/editproduct",upload,function(req,res){
  if(req.files.length != 0){
  productDetails={
  "name":req.body.name,
  "id":req.body.id,
  "des":req.body.desc,
  "category":req.body.category,
  "pts":parseInt(req.body.pts),
  "file":req.files,
  
  }
}
else{
  productDetails={
    "name":req.body.name,
    "id":req.body.id,
    "des":req.body.desc,
    "category":req.body.category,
    "pts":parseInt(req.body.pts),
    }
}

  async function product()
  {
    console.log(req.body.pid)
    var res2=await dbConnection.collection("products").findOne({"id":req.body.id});
    if(res2==null){
      var res1= await dbConnection.collection("products").insertOne(productDetails);
      res.redirect("/products");
    }
    else{
      var res3= await dbConnection.collection("products").updateOne({"id":(req.body.id)},{$set:productDetails});
      res.redirect("/products");
    }
  }product();
});
router.post("/vendor_editproduct",upload,function(req,res){
  if(req.files.length != 0){
    productDetails={
      "name":req.body.name,
      "id":req.body.id,
      "des":req.body.desc,
      "category":req.body.category,
      "pts":parseInt(req.body.pts),
      "file":req.files,
      }
  }
  else{
    productDetails={
  "name":req.body.name,
  "id":req.body.id,
  "des":req.body.desc,
  "category":req.body.category,
  "pts":parseInt(req.body.pts),

  }
  }
  async function product()
  {
    console.log(req.body.pid)
    var res2=await dbConnection.collection("products").findOne({"id":req.body.id});
    if(res2==null){
      var res1= await dbConnection.collection("products").insertOne(productDetails);
      res.redirect("/vendor_products");
    }
    else{
      var res3= await dbConnection.collection("products").updateOne({"id":(req.body.id)},{$set:productDetails});
      res.redirect("/vendor_products");
    }
  }product();
});
//ADDING POINTS TO USER BY ADMIN//
router.get('/pointsadd/:id',function(req,res){
  var id=req.params.id

    dbConnection.collection("Details").findOne({"_id":ObjectId(id)},function(req,res1){
    
  
    res.render("pointsadd",{"uname":res1});
  })
})

router.post("/addingpts",function(req,res){

  
  async function addpts(){
    var result=await dbConnection.collection("Details").findOne({"_id":ObjectId(req.body.userid)});

    var p={
      "oldpts":result.pts
    }
    
    var pointsafteradding=p.oldpts + parseInt(req.body.userpts);
    var updatedpoint={
      "pts":pointsafteradding
    }
    var res2 =await dbConnection.collection("Details").updateOne({ "_id": ObjectId(req.body.userid) }, { $set:updatedpoint});

  }
  addpts();
  res.redirect('/userstable');
});
router.get('/edit/:id',upload,function(req,res){
  pid=req.params.id;
  async function edit(){
    var res1=await dbConnection.collection("products").findOne({"_id":ObjectId(pid)});
    console.log(res1.file)
    var p={
      res:res1
    }
    console.log(p.res.file)
    res.render('editproduct',{"product":res1,"msg":'',"vendor":"0"});
    
  }edit();
})
router.get('/vendor_edit/:id',upload,function(req,res){
  pid=req.params.id;
  async function edit(){
    var res1=await dbConnection.collection("products").findOne({"_id":ObjectId(pid)});
    console.log(res1.file)
    var p={
      res:res1
    }
    console.log(p.res.file)
    res.render('editproduct',{"product":res1,"msg":'',"vendor":"1"});
    
  }edit();
})
router.get('/delete/:id', function (req, res) {
  var pkey = req.params.id;
  console.log(pkey);
  dbConnection.collection("products").deleteOne({ "_id": ObjectId(pkey) },function (err, res1) {
    if(err) throw err;
    res.redirect('/products');
  }); 
});
router.get('/vendor_delete/:id', function (req, res) {
  var pkey = req.params.id;
  console.log(pkey);
  dbConnection.collection("products").deleteOne({ "_id": ObjectId(pkey) },function (err, res1) {
    if(err) throw err;
    res.redirect('/vendor_products');
  }); 
});




module.exports=router;