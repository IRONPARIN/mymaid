var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

router.get('/', function(req, res, next) {

	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			client.query(
				"select * from image ORDER BY id DESC LIMIT 1"
				, function(err, result){
				console.log("result : " , result);
				console.log("result.rows : " , result.rows[0]);
				console.log("name : " , result.rows[0].name);
				console.log("path : " , result.rows[0].path);
				res.render('select-image', {name: result.rows[0].name});
			});
		}

		!!done && done();
	});
});

module.exports = router;