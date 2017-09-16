var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

/* GET home page. */
router.get('/',auth.authorized, function(req, res, next) {
  res.render('maidwork', { title: 'Express', firstname : req.session.firstname , image : req.session.imagename});
  console.log('Maid Work Page');
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
				+" from employment e where e.maid_personalid = $1 and e.status != 'Waiting'"
				, [req.session.uid]
				, function(err, result){
				console.log('/list.json', err, (result||{}).rowCount);
				if(!!err){
					next(err);
				}
				else{
					result.rows.forEach(function(e, i){
						console.log(i, e);
					})
					res.json(result.rows);	
				}
			});
		}
		!!done && done();
	});	
});

router.post('/getDigit', function(req, res, next) {
	console.log('Obj ',req.body);
	//res.json({ RES : req.body });
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select * from employment where id_employ = $1"
				, [req.body.id]
				, function(err, result){
					if (!!err) {
						next(err);
					}else{
						console.log('result ',result);
						res.json(result.rows);
						!!done && done();	
					}
				}
			);		
		}
		!!done && done();
	});	
});

router.post('/checkin', function(req, res, next) {
	console.log('Obj ',req.body);
	//res.json({ RES : req.body });
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"update employment set status = 'In Service',checkin = now() where id_employ = $1"
				, [req.body.id]
				, function(err, result){
					if (!!err) {
						next(err);
					}else{						
						console.log('result ',result);
						res.json(result.rows);
						!!done && done();
					}
				}
			);		
		}
		!!done && done();
	});	
});

router.post('/checkout', function(req, res, next) {
	console.log('Obj ',req.body);
	//res.json({ RES : req.body });
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"update employment set status = 'Service Complete',checkout = now() where id_employ = $1"
				, [req.body.id]
				, function(err, result){
					if (!!err) {
						next(err);
					}else{						
						console.log('result ',result);
						res.json(result.rows);
						!!done && done();
					}
				}
			);		
		}
		!!done && done();
	});	
});

module.exports = router;