var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

/* GET home page. */
router.get('/', auth.authorized, function(req, res, next) {
  res.render('requestmaid', { title: 'Express', firstname : req.session.firstname , image : req.session.imagename});
  console.log('Request Maid Page');
});

router.get('/list.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			client.query(
				"select e.*"
				+",(select im.name from image_maid im where im.maid_personalid = e.maid_personalid and im.type = 'Profile') as imagename"
				+",(select m.name from maid m where m.maid_personalid = e.maid_personalid) as maidname"
				+" from employment e where e.emp_personalid = $1 order by id_employ DESC"
				, [req.session.uid]
				, function(err, result){
				console.log('/list.json', err, (result||{}).rowCount);
				res.json(result.rows);
			});
		}
		!!done && done();
	});	
});

module.exports = router;