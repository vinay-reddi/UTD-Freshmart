var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var dbConnection;
module.exports={
    connectToServer:function(callback){
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  console.log("Database created!");
  dbConnection = db.db('mydb');
  console.log("************************************")
  return callback(err);  
});
    },
    getDb:function(){
        console.log("dw")
       // console.log(dbConnection)
        return dbConnection
    }
}
