var express = require('express');
var router = express.Router();
var config = require("../config.json");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('test_date', { config: config});

  console.log('test_date Page');

});

module.exports = router;
