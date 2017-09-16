var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

router.get('/', auth.authorized, function(req, res, next) {
  res.render('editprofile', { title: 'Express', firstname : req.session.firstname, image : req.session.imagename, role : req.session.role, config: config});
  console.log('Edit Profile');
});

router.get('/list.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select e.*, (select ae.home from address_employer ae where e.emp_personalid = ae.emp_personalid) as home"
				+" ,(select ae.soi from address_employer ae where e.emp_personalid = ae.emp_personalid) as soi"
				+",(select ae.road from address_employer ae where e.emp_personalid = ae.emp_personalid) as road"
				+", (select ae.district from address_employer ae where e.emp_personalid = ae.emp_personalid) as district"
				+",(select ae.subdistrict from address_employer ae where e.emp_personalid = ae.emp_personalid) as subdistrict"
				+",(select ae.city from address_employer ae where e.emp_personalid = ae.emp_personalid) as city"
				+" from employer e where e.emp_personalid = $1"
				, [req.session.uid]
				, function(err, result){
					res.json(result.rows[0]);
					!!done && done();
				}
			);
		}
	});	
})

router.post('/', function(req, res, next) {
	console.log('Obj ',req.body);
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{		

			if (req.session.role == 'employer') {
				client.query(
					"update employer set name = $2,aboutme = $3,mobile_number = $4,gender = $5,email = $6,birthdate = $7,"
					+"modifier_date = now() where emp_personalid = $1"
					, [req.session.uid,req.body.name,req.body.aboutme,req.body.mobile_number,req.body.gender,req.body.email,req.body.birthdate]
					, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result : ", result);
						client.query(
							"update address_employer set home = $2,soi = $3,road = $4,subdistrict = $5,district = $6,city = $7"
							+" where emp_personalid = $1"
							, [req.session.uid,req.body.home,req.body.soi,req.body.road,req.body.subdistrict,req.body.district,req.body.city]
							, function(err, result){
							if(!!err){
								console.log("err : ", err);
								throw err;	
							}
							else{
								console.log("result : ", result);
								res.json(result.rows);							
							}
						});	
					}
					!!done && done();
				});
			}else{
				client.query(
					"update maid set name = $2,aboutme = $3,mobile_number = $4,gender = $5,email = $6,birthdate = $7"
					+",home = $8,soi = $9,road = $10,subdistrict = $11,district = $12,city = $13,modifier_date = now()"
					+" where maid_personalid = $1"
					, [req.session.uid,req.body.name,req.body.aboutme,req.body.mobile_number,req.body.gender,req.body.email,
					req.body.birthdate,req.body.home,req.body.soi,req.body.road,req.body.subdistrict,req.body.district,req.body.city]
					, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result : ", result);
						res.json(result.rows);							
					}
					!!done && done();
				});
			}								
		}
		!!done && done();
	});	
});

module.exports = router;
