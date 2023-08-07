var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.auth1=false;

  res.render('user', { "msg": "" });
  // console.log("inside index")
  // res.render('login', { title: 'Express' });
});

module.exports = router;




