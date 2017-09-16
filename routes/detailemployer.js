var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");
var employerid;

router.get('/:id.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select e.*"
				+",(select ie.name from image_employer ie where ie.emp_personalid = e.emp_personalid and ie.type = 'Profile') as imagename"
				+",(select ee.name from employer ee where ee.emp_personalid = e.emp_personalid) as empname"
				+",(select ee.aboutme from employer ee where ee.emp_personalid = e.emp_personalid) as aboutme"
				+",(select ee.rating from employer ee where ee.emp_personalid = e.emp_personalid) as rating"
				+" from employment e where e.id_employ = $1"
				, [req.params.id]
				, function(err, result){
					res.json(result.rows[0]);
					!!done && done();
				}
			);
		}
	});	
})

router.get('/:id.comment', auth.authorized, function(req, res, next){
	console.log("empid = ",req.params.id);
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select emp_personalid from employment where id_employ = $1"
				, [req.params.id]
				, function(err, result){
					if (!!err) {
						throw(err);
					}else{
						console.info('result : ',result.rows[0].emp_personalid);	
						employerid = result.rows[0].emp_personalid;
						client.query(
							"select emp.maid_personalid, emp.emp_personalid, re.comment, re.created_date, re.type, m.name as maidname, imm.name as imagemaid"
							+" from employment emp"
							+" inner join review re on emp.id_employ = re.id_employ"
							+" inner join maid m on m.maid_personalid = emp.maid_personalid"
							+" inner join image_maid imm on imm.maid_personalid = emp.maid_personalid"
							+" where emp.emp_personalid = $1 and re.type = 'maid' and imm.type = 'Profile' and re.comment is not null"
							, [employerid]
							, function(err, result){
								if (!!err) {
									throw(err);
								}else{
									res.json(result.rows);
									console.info('result : ',result)	
								}
							}
						);
					}					
					!!done && done();
				}
			);
		}
	});	
})

router.get('/:id', auth.authorized, function(req, res, next) {
  res.render('detailemployer', { title: 'Express', firstname : req.session.firstname, image : req.session.imagename, id: req.params.id});
  console.log('Detail Employer Page');
});

router.post('/editemploy', function(req, res, next) {
	console.log('Obj ',req.body);
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"update employment set status = 'Matched',detail = $1,confirm_date = now() where id_employ = $2"
				, ["{\"insurance\":\""+req.body.obj.detail.insurance+"\",\"maidaccident\":\""+req.body.obj.accident+"\"}",req.body.obj.id_employ]
				, function(err, result){
				if(!!err){
					console.log("err : ", err);
					throw err;	
				}
				else{
					console.log("result : ", result);
					res.json(req.body.obj.id_employ);
				}
				!!done && done();
			});											
		}
		!!done && done();
	});	
});

router.post('/cancel', function(req, res, next) {
	console.log('Obj ',req.body);
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"update employment set status = 'Cancel',modifier_date = now() where id_employ = $1"
				, [req.body.id]
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
		!!done && done();
	});	
});

module.exports = router;