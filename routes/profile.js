var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

router.get('/', auth.authorized, function(req, res, next) {
  res.render('profile', { title: 'Express', firstname : req.session.firstname, image : req.session.imagename, role : req.session.role});
  console.log('Profile Maid Page',req.session.role);
});

router.get('/list.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			if (req.session.role == 'employer') {				
				client.query(
					"select e.*,(select ie.name from image_employer ie where ie.emp_personalid = e.emp_personalid and ie.type = 'Profile') as imagename , (select ae.home from address_employer ae where e.emp_personalid = ae.emp_personalid) as home, (select ae.soi from address_employer ae where e.emp_personalid = ae.emp_personalid) as soi ,(select ae.road from address_employer ae where e.emp_personalid = ae.emp_personalid) as road , (select ae.district from address_employer ae where e.emp_personalid = ae.emp_personalid) as district,(select ae.subdistrict from address_employer ae where e.emp_personalid = ae.emp_personalid) as subdistrict,(select ae.city from address_employer ae where e.emp_personalid = ae.emp_personalid) as city from employer e where e.emp_personalid = $1"
					, [req.session.uid]
					, function(err, result){
					console.log('/list.json', err, (result||{}).rowCount);
					res.json(result.rows);
				});
			}else{
				client.query(
					"select m.*,(select im.name from image_maid im where im.maid_personalid = m.maid_personalid and im.type = 'Profile') as imagename from maid m where m.maid_personalid = $1"
					, [req.session.uid]
					, function(err, result){
					console.log('/list.json', err, (result||{}).rowCount);
					res.json(result.rows);
				});
			}
		}
		!!done && done();
	});	
});

router.get('/imglist.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			if (req.session.role == 'employer') {				
				client.query(
					"select * from image_employer where emp_personalid = $1 and type = 'Image'"
					, [req.session.uid]
					, function(err, result){
					console.log('/list.json', err, (result||{}).rowCount);
					res.json(result.rows);
				});
			}else{
				client.query(
					"select * from image_maid where maid_personalid = $1 and type = 'Image'"
					, [req.session.uid]
					, function(err, result){
					console.log('/list.json', err, (result||{}).rowCount);
					res.json(result.rows);
				});
			}
		}
		!!done && done();
	});	
});

module.exports = router;
