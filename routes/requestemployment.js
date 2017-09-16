var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

/* GET home page. */
router.get('/',auth.authorized, function(req, res, next) {
  res.render('requestemployment', { title: 'Express', firstname : req.session.firstname , image : req.session.imagename});
  console.log('Request Employment Page');
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
				+",(select ie.name from image_employer ie where ie.emp_personalid = e.emp_personalid and ie.type = 'Profile') as imagename"
				+",(select ee.name from employer ee where ee.emp_personalid = e.emp_personalid) as empname"
				+" from employment e where e.maid_personalid = $1 and e.status = 'Waiting' order by created_date desc"
				, [req.session.uid]
				, function(err, result){
				console.log('/list.json', err, (result||{}).rowCount);
				res.json(result.rows);
			});
		}
		!!done && done();
	});	
});

router.get('/check.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			client.query(
				"select e.*"
				+",(select ie.name from image_employer ie where ie.emp_personalid = e.emp_personalid and ie.type = 'Profile') as imagename"
				+",(select ee.name from employer ee where ee.emp_personalid = e.emp_personalid) as empname"
				+" from employment e where e.maid_personalid = $1 and e.status = 'Paid' order by created_date desc"
				, [req.session.uid]
				, function(err, result){
				console.log('/check.json', result.rows);
				res.json(result.rows);
			});
		}
		!!done && done();
	});	
});


router.get('/rating.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			client.query(
				"select e.* from employment e where e.maid_personalid = $1 and e.status = 'Service Complete'"
				+" and e.id_employ not in (select id_employ from review where type = 'maid')"
				, [req.session.uid]
				, function(err, result){
					if (!!err) {
						console.log("err : ", err);
						throw err;	
					}else{
						console.log('/rating.json', result);
						res.json(result.rows);
					}				
				}
			);
		}
		!!done && done();
	});	
});

module.exports = router;