var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");

router.get('/', function(req, res, next) {
	if(!!req.session){
		req.session.destroy();
	}
  	res.render('ng-regis', {title: 'Express' ,config: config});
  	console.log('Register Page');
});

router.post('/', function(req, res, next) {
	console.log('Obj ',req.body);
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			console.log('role',req.body.role);
			req.session.role = req.body.role;
			req.session.perid = req.body.perid;
			req.session.save(function(err) {
				console.log('session.role : ', req.session.role);
				console.log('session.perid : ', req.session.perid);				            
			});
			if (req.body.role == 'Maid') {				
				console.log("Insert ",req.body.role);
				client.query(
					"insert into maid (maid_personalID,name,birthdate,mobile_number,email,gender,password,aboutme,status,"
					+"rating,wage,expert,worktime,workday,home,soi,road,subdistrict,district,city,position,company,created_date)"
					+"values ($1,$2,$3,$4,$5,$6,md5($7),$8,'Active','0','80',$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,now())"
					, [req.body.perid,req.body.name,req.body.bday,req.body.mnumber,req.body.email,req.body.gender,
					req.body.pass,req.body.bio,req.body.expert,req.body.twork,req.body.dwork,req.body.hnum,req.body.soi,
					req.body.road,req.body.subdistrict,req.body.district,req.body.city,req.body.position,req.body.company]
					, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result : ", result);
						// res.json((result||{}).rows);
						res.render('uploadimage', {title: 'Express'});
						//res.redirect('/uploadimage');
					}
					!!done && done();
				});
			}else{
				console.log("Insert ",req.body.role);
				client.query(					
					"insert into employer (emp_personalID,name,birthdate,mobile_number,email,gender,password,"
					+"status,rating,aboutme,created_date)"
					+"values ($1,$2,$3,$4,$5,$6,md5($7),'Active','0',$8,now())"
					, [req.body.perid,req.body.name,req.body.bday,req.body.mnumber,req.body.email,req.body.gender,req.body.pass,req.body.bio]
					, function(err, result){
						if(!!err){
							console.log("err : ", err);
							throw err;	
						}
						else{
							client.query(
								"insert into address_employer(home ,soi,road,subdistrict,district,city,created_date,emp_personalID)"
								+"values ($1,$2,$3,$4,$5,$6,now(),$7)"
								, [req.body.hnum,req.body.soi,req.body.road,req.body.subdistrict,req.body.district,req.body.city,req.body.perid]
								, function(err, result){
									if(!!err){
										console.log("err : ", err);
										throw err;	
									}
									else{
										console.log("result : ", result);
										// res.json((result||{}).rows);
										res.render('uploadimage', {title: 'Express'});
										// res.redirect('/uploadimage');				
									}
								}
							);					
						}
					}
				);
				
				!!done && done();
			}			
		}

		!!done && done();
	});	
});

module.exports = router;